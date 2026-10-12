import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { RotateCcw, RotateCw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { CompileStatus, FontFamily, SyncTeXBox } from '../types/index.ts';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PdfCanvasRef {
  calculateFitWidth: () => number;
}

interface TextItemInfo {
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PdfCanvasProps {
  projectId: string | null;
  pdfVersion: number;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  compileStatus: CompileStatus;
  onCompile?: () => void;
  fontFamily?: FontFamily;
  texContent?: string;
  synctexBoxes?: SyncTeXBox[];
  onJumpToSource: (line: number) => void;
}

export const PdfCanvas = forwardRef<PdfCanvasRef, PdfCanvasProps>(
  (
    { projectId, pdfVersion, zoom, onZoomChange, compileStatus, onCompile, texContent = '', synctexBoxes = [], onJumpToSource },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
    const renderTasks = useRef<Map<number, any>>(new Map());
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [pageTextItems, setPageTextItems] = useState<Map<number, TextItemInfo[]>>(new Map());

    // Expose calculateFitWidth to parent
    useImperativeHandle(ref, () => ({
      calculateFitWidth: () => {
        if (!containerRef.current || !pageDimensions) return 100;
        const availableWidth = containerRef.current.clientWidth - 48; // 24px padding each side
        const calculatedZoom = Math.round((availableWidth / pageDimensions.width) * 100);
        return Math.max(40, Math.min(250, calculatedZoom));
      },
    }));

    // Fetch and load PDF document whenever projectId or pdfVersion changes
    useEffect(() => {
      if (!projectId) {
        setIsLoading(false);
        setPdfDoc(null);
        return;
      }

      let isMounted = true;
      setIsLoading(true);
      setError(null);

      const pdfUrl = `/api/projects/${projectId}/pdf?v=${pdfVersion}`;

      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      loadingTask.promise
        .then(async (doc) => {
          if (!isMounted) return;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setIsLoading(false);

          // Get dimensions of first page
          try {
            const firstPage = await doc.getPage(1);
            const vp = firstPage.getViewport({ scale: 1 });
            setPageDimensions({ width: vp.width, height: vp.height });
          } catch (e) {
            console.error('Failed to get page dimensions:', e);
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('PDF load warning:', err.message);
          setIsLoading(false);
          setError('PDF not yet compiled or unavailable.');
          setPdfDoc(null);
          setNumPages(0);
        });

      return () => {
        isMounted = false;
        loadingTask.destroy();
      };
    }, [projectId, pdfVersion]);

    // Render each page to canvas & extract text layer coordinates whenever pdfDoc or zoom changes
    useEffect(() => {
      if (!pdfDoc || numPages === 0) return;

      const scale = zoom / 100;
      const dpr = window.devicePixelRatio || 1;
      const newTextItemsMap = new Map<number, TextItemInfo[]>();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const canvas = canvasRefs.current.get(pageNum);
        if (!canvas) continue;

        // Cancel previous render task for this page if running
        if (renderTasks.current.has(pageNum)) {
          try {
            renderTasks.current.get(pageNum).cancel();
          } catch (_) {}
          renderTasks.current.delete(pageNum);
        }

        pdfDoc.getPage(pageNum).then(async (page) => {
          const viewport = page.getViewport({ scale });
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) return;

          // HiDPI / Retina Crisp rendering
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;

          const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

          const renderTask = page.render({
            canvasContext: ctx,
            viewport,
            transform,
          });

          renderTasks.current.set(pageNum, renderTask);

          renderTask.promise.catch((err) => {
            if (err.name !== 'RenderingCancelledException') {
              console.error(`Page ${pageNum} render error:`, err);
            }
          });

          // Extract text content for click-to-code navigation
          try {
            const textContent = await page.getTextContent();
            const items: TextItemInfo[] = [];

            for (const item of textContent.items as any[]) {
              if (!item.str || !item.str.trim()) continue;
              const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
              items.push({
                str: item.str,
                left: tx[4],
                top: tx[5] - (item.height * scale),
                width: item.width * scale,
                height: Math.max(item.height * scale, 12 * scale),
              });
            }
            newTextItemsMap.set(pageNum, items);
            setPageTextItems(new Map(newTextItemsMap));
          } catch (e) {
            console.error('Failed to extract text content:', e);
          }
        });
      }
    }, [pdfDoc, numPages, zoom]);

    // Handle clicking text on PDF to jump to LaTeX source code
    const handleTextClick = (textStr: string) => {
      const cleanTarget = textStr.trim();
      if (!cleanTarget || cleanTarget.length < 2 || !texContent) return;

      const lines = texContent.split('\n');
      let matchedLine = -1;

      // 1. Exact substring match
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(cleanTarget)) {
          matchedLine = i + 1;
          break;
        }
      }

      // 2. Word-based match if exact phrase not found (handles LaTeX commands stripped by PDF engine)
      if (matchedLine === -1) {
        const words = cleanTarget.split(/\s+/).filter((w) => w.length > 3);
        if (words.length > 0) {
          for (let i = 0; i < lines.length; i++) {
            if (words.some((word) => lines[i].includes(word))) {
              matchedLine = i + 1;
              break;
            }
          }
        }
      }

      if (matchedLine > 0) {
        onJumpToSource(matchedLine);
      }
    };

    // Scroll tracking to update currentPage
    const handleScroll = () => {
      if (!containerRef.current || numPages <= 1) return;
      const scrollTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;

      for (let i = 1; i <= numPages; i++) {
        const canvas = canvasRefs.current.get(i);
        if (canvas) {
          const top = canvas.offsetTop - containerRef.current.offsetTop;
          const height = canvas.clientHeight;
          if (scrollTop >= top - containerHeight / 2 && scrollTop < top + height - containerHeight / 2) {
            setCurrentPage(i);
            break;
          }
        }
      }
    };

    const scrollToPage = (pageNum: number) => {
      if (pageNum < 1 || pageNum > numPages) return;
      const canvas = canvasRefs.current.get(pageNum);
      if (canvas && containerRef.current) {
        canvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentPage(pageNum);
      }
    };

    return (
      <div className="flex-1 h-full bg-[#11100e] relative overflow-hidden flex flex-col">
        {/* Scrollable PDF Pages Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto flex flex-col items-center py-6 px-4 gap-6 select-none"
        >
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8c887e] gap-3">
              <RotateCw className="w-6 h-6 animate-spin text-[#d4af37]" />
              <span className="text-xs font-mono">Rendering high-resolution vector PDF...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8c887e] gap-3 p-6 text-center max-w-md">
              <FileText className="w-10 h-10 text-[#57534e]" />
              <div className="text-sm font-semibold text-[#f4f2ec]">PDF Preview Ready to Compile</div>
              <p className="text-xs text-[#8c887e] leading-relaxed">
                Save your changes or click compile to generate the high-resolution vector PDF preview.
              </p>
              {onCompile && (
                <button
                  onClick={onCompile}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#c49f27] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-900/20 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Compile Document
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && pdfDoc && (
            <>
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                const textItems = pageTextItems.get(pageNum) || [];
                return (
                  <div
                    key={pageNum}
                    className="relative group bg-[#fdfbf7] shadow-2xl rounded-sm transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    <canvas
                      ref={(el) => {
                        if (el) canvasRefs.current.set(pageNum, el);
                        else canvasRefs.current.delete(pageNum);
                      }}
                      className="block rounded-sm bg-white"
                    />

                    {/* Clickable Interactive Text Overlay (Click on text to jump to code) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {textItems.map((item, idx) => (
                        <span
                          key={idx}
                          onClick={() => handleTextClick(item.str)}
                          className="absolute pointer-events-auto cursor-pointer hover:bg-amber-400/20 rounded-xs transition-colors"
                          style={{
                            left: `${item.left}px`,
                            top: `${item.top}px`,
                            width: `${Math.max(item.width, 10)}px`,
                            height: `${item.height}px`,
                          }}
                          title={`Click to jump to: "${item.str}" in code`}
                        />
                      ))}
                    </div>

                    {/* Subtle Page Number Badge */}
                    <div className="absolute -top-3 right-2 bg-[#1e1d1a]/90 backdrop-blur border border-[#3d3a33] text-[9px] font-mono text-[#8c887e] px-1.5 py-0.5 rounded shadow">
                      Page {pageNum} of {numPages}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Floating Bottom Navigation Pill (Matching the Prism Reference Design) */}
        {!isLoading && !error && numPages > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center bg-[#181714]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#33302a] shadow-2xl text-[11px] text-[#a8a49c] gap-2 select-none">
              {/* Recompile / Reload */}
              <button
                onClick={onCompile}
                className="p-1 hover:text-[#d4af37] text-[#8c887e] transition-colors rounded-full hover:bg-[#24221e] cursor-pointer"
                title="Recompile (Ctrl+S)"
              >
                <RotateCw className={`w-3.5 h-3.5 ${compileStatus === 'compiling' ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  if (pdfDoc) {
                    scrollToPage(currentPage);
                  }
                }}
                className="p-1 hover:text-[#d4af37] text-[#8c887e] transition-colors rounded-full hover:bg-[#24221e] cursor-pointer"
                title="Refresh View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <span className="text-[#3d3a33]">|</span>

              {/* Prev Page */}
              <button
                disabled={currentPage <= 1}
                onClick={() => scrollToPage(currentPage - 1)}
                className="p-1 hover:text-[#f4f2ec] disabled:text-[#3d3a33] text-[#8c887e] transition-colors rounded-full hover:bg-[#24221e] cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page Indicator / Go to PDF */}
              <span className="text-[10px] font-mono text-[#f4f2ec] px-1">
                Go to PDF <span className="text-[#8c887e]">({currentPage}/{numPages})</span>
              </span>

              {/* Next Page */}
              <button
                disabled={currentPage >= numPages}
                onClick={() => scrollToPage(currentPage + 1)}
                className="p-1 hover:text-[#f4f2ec] disabled:text-[#3d3a33] text-[#8c887e] transition-colors rounded-full hover:bg-[#24221e] cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
