import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { RotateCcw, RotateCw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { CompileStatus } from '../types/index.ts';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PdfCanvasRef {
  calculateFitWidth: () => number;
  calculateFitPage: () => number;
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
  texContent?: string;
  onJumpToSource: (line: number) => void;
}

export function matchPdfTextToTexLine(textStr: string, texContent: string): number {
  const cleanTarget = textStr.trim();
  if (!cleanTarget || cleanTarget.length < 2 || !texContent) return -1;

  const lines = texContent.split('\n');

  // Helper to strip common LaTeX inline formatting commands so PDF text matches raw source
  const stripInlineLatex = (line: string): string =>
    line
      .replace(/\\(?:textbf|textit|underline|texttt|emph|textrm|textsf|section\*?|subsection\*?|subsubsection\*?|title|author|caption)\{([^}]*)\}/g, '$1')
      .replace(/\\[a-zA-Z]+\*?/g, ' ')
      .replace(/[{}~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // 1. Exact substring match in raw source
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(cleanTarget)) {
      return i + 1;
    }
  }

  // 2. Match against macro-stripped source line
  const normalizedTarget = cleanTarget.replace(/\s+/g, ' ');
  for (let i = 0; i < lines.length; i++) {
    const stripped = stripInlineLatex(lines[i]);
    if (stripped && stripped.toLowerCase().includes(normalizedTarget.toLowerCase())) {
      return i + 1;
    }
  }

  // 3. Multi-word token score match (handles hyphenation or LaTeX macros splitting words)
  const words = cleanTarget
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((w) => w.length > 3);

  if (words.length > 0) {
    let bestLine = -1;
    let bestScore = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('%')) continue;
      const score = words.filter((word) => lines[i].toLowerCase().includes(word.toLowerCase())).length;
      if (score > bestScore) {
        bestScore = score;
        bestLine = i + 1;
      }
    }
    if (bestLine > 0) return bestLine;
  }

  return -1;
}

export function clampTextItemToViewport(
  rawLeft: number,
  rawTop: number,
  rawWidth: number,
  rawHeight: number,
  pageWidth: number,
  pageHeight: number
): { left: number; top: number; width: number; height: number } | null {
  if (pageWidth <= 0 || pageHeight <= 0) return null;
  if (!Number.isFinite(rawLeft) || !Number.isFinite(rawTop) || !Number.isFinite(rawWidth) || !Number.isFinite(rawHeight)) {
    return null;
  }

  const clampedLeft = Math.max(0, Math.min(pageWidth, rawLeft));
  const clampedTop = Math.max(0, Math.min(pageHeight, rawTop));
  const maxWidth = Math.max(0, pageWidth - clampedLeft);
  const maxHeight = Math.max(0, pageHeight - clampedTop);

  const clampedWidth = Math.max(0, Math.min(Math.max(rawWidth, 10), maxWidth));
  const clampedHeight = Math.max(0, Math.min(rawHeight, maxHeight));

  if (clampedWidth < 2 || clampedHeight < 2) {
    return null;
  }

  return {
    left: Math.round(clampedLeft * 100) / 100,
    top: Math.round(clampedTop * 100) / 100,
    width: Math.round(clampedWidth * 100) / 100,
    height: Math.round(clampedHeight * 100) / 100,
  };
}

export const PdfCanvas = forwardRef<PdfCanvasRef, PdfCanvasProps>(
  (
    { projectId, pdfVersion, zoom, onZoomChange, compileStatus, onCompile, texContent = '', onJumpToSource },
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
    const [renderedPageSizes, setRenderedPageSizes] = useState<Map<number, { width: number; height: number }>>(new Map());
    const [pageTextItems, setPageTextItems] = useState<Map<number, TextItemInfo[]>>(new Map());

    // Expose calculateFitWidth and calculateFitPage to parent
    useImperativeHandle(ref, () => ({
      calculateFitWidth: () => {
        const dims = pageDimensions || { width: 595.28, height: 841.89 };
        const container = containerRef.current;
        if (!container) return 100;
        const availableWidth = Math.max(160, container.clientWidth - 32);
        const calculatedZoom = Math.round((availableWidth / dims.width) * 100);
        return Math.max(40, Math.min(250, calculatedZoom));
      },
      calculateFitPage: () => {
        const dims = pageDimensions || { width: 595.28, height: 841.89 };
        const container = containerRef.current;
        if (!container) return 80;
        const availableHeight = Math.max(200, container.clientHeight - 48);
        const calculatedZoom = Math.round((availableHeight / dims.height) * 100);
        return Math.max(40, Math.min(250, calculatedZoom));
      },
    }));

    // Auto-clamp zoom to fit container width when PDF page dimensions first load if 100% would overflow the pane
    useEffect(() => {
      if (!containerRef.current || !pageDimensions) return;
      const availableWidth = containerRef.current.clientWidth - 48;
      if (availableWidth > 160 && pageDimensions.width * (zoom / 100) > availableWidth) {
        const safeZoom = Math.max(40, Math.min(100, Math.floor((availableWidth / pageDimensions.width) * 100)));
        if (safeZoom < zoom) {
          onZoomChange(safeZoom);
        }
      }
    }, [pageDimensions]);

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
      const newSizesMap = new Map<number, { width: number; height: number }>();

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

          const pageCssWidth = Math.floor(viewport.width);
          const pageCssHeight = Math.floor(viewport.height);

          // HiDPI / Retina Crisp rendering
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${pageCssWidth}px`;
          canvas.style.height = `${pageCssHeight}px`;

          newSizesMap.set(pageNum, { width: pageCssWidth, height: pageCssHeight });
          setRenderedPageSizes(new Map(newSizesMap));

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

          // Extract text content for click-to-code navigation, strictly clamped to page bounds
          try {
            const textContent = await page.getTextContent();
            const items: TextItemInfo[] = [];

            for (const item of textContent.items as any[]) {
              if (!item.str || !item.str.trim()) continue;
              const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
              const fontHeight = Math.max(Math.hypot(tx[2], tx[3]), (item.height || 10) * scale, 10 * scale);
              const rawLeft = tx[4];
              const rawTop = tx[5] - fontHeight;
              const rawWidth = (item.width || 0) * scale;

              const clamped = clampTextItemToViewport(
                rawLeft,
                rawTop,
                rawWidth,
                fontHeight,
                pageCssWidth,
                pageCssHeight
              );

              if (clamped) {
                items.push({
                  str: item.str,
                  left: clamped.left,
                  top: clamped.top,
                  width: clamped.width,
                  height: clamped.height,
                });
              }
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
      const matchedLine = matchPdfTextToTexLine(textStr, texContent);
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
      <div className="flex-1 h-full bg-[var(--bg-primary)] relative overflow-hidden flex flex-col">
        {/* Scrollable PDF Pages Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto flex flex-col items-center py-6 px-4 gap-6 select-none"
        >
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
              <RotateCw className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
              <span className="text-xs font-mono text-[var(--text-secondary)]">Rendering high-resolution vector PDF...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] gap-3 p-6 text-center max-w-md">
              {compileStatus === 'error' ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-1">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">LaTeX Compilation Failed</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    The compiler encountered syntax or package errors. Use the diagnostic drawer below or press recompile to try again.
                  </p>
                  {onCompile && (
                    <button
                      onClick={onCompile}
                      className="mt-2 px-3.5 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:brightness-110 text-[var(--bg-primary)] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Recompile Document
                    </button>
                  )}
                </>
              ) : (
                <>
                  <FileText className="w-10 h-10 text-[var(--text-muted)]" />
                  <div className="text-sm font-semibold text-[var(--text-primary)]">PDF Preview Ready to Compile</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Save your changes or click compile to generate the high-resolution vector PDF preview.
                  </p>
                  {onCompile && (
                    <button
                      onClick={onCompile}
                      className="mt-2 px-3.5 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:brightness-110 text-[var(--bg-primary)] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Compile Document
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {!isLoading && !error && pdfDoc && (
            <>
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                const textItems = pageTextItems.get(pageNum) || [];
                const pageSize = renderedPageSizes.get(pageNum);
                return (
                  <div
                    key={pageNum}
                    style={
                      pageSize
                        ? { width: `${pageSize.width}px`, height: `${pageSize.height}px` }
                        : undefined
                    }
                    className="relative group bg-[#fdfbf7] shadow-2xl rounded-sm overflow-hidden shrink-0 transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  >
                    <canvas
                      ref={(el) => {
                        if (el) canvasRefs.current.set(pageNum, el);
                        else canvasRefs.current.delete(pageNum);
                      }}
                      className="block rounded-sm bg-white"
                    />

                    {/* Clickable Interactive Text Overlay (Strictly Clamped to Page Bounds) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {textItems.map((item, idx) => (
                        <span
                          key={idx}
                          onClick={() => handleTextClick(item.str)}
                          className="absolute pointer-events-auto cursor-pointer hover:bg-amber-400/20 rounded-xs transition-colors"
                          style={{
                            left: `${item.left}px`,
                            top: `${item.top}px`,
                            width: `${item.width}px`,
                            height: `${item.height}px`,
                          }}
                          title={`Click to jump to: "${item.str}" in code`}
                        />
                      ))}
                    </div>

                    {/* Subtle Page Number Badge (Inside Page Bounds) */}
                    <div className="absolute top-2 right-2 bg-[var(--bg-surface)]/90 backdrop-blur border border-[var(--border-color-subtle)] text-[9px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded shadow pointer-events-none">
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
            <div className="flex items-center bg-[var(--bg-surface)]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-2xl text-[11px] text-[var(--text-secondary)] gap-2 select-none">
              {/* Recompile / Reload */}
              <button
                onClick={onCompile}
                className="p-1 hover:text-[var(--accent-primary)] text-[var(--text-muted)] transition-colors rounded-full hover:bg-[var(--bg-surface-hover)] cursor-pointer"
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
                className="p-1 hover:text-[var(--accent-primary)] text-[var(--text-muted)] transition-colors rounded-full hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                title="Refresh View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <span className="text-[var(--border-color-subtle)]">|</span>

              {/* Prev Page */}
              <button
                disabled={currentPage <= 1}
                onClick={() => scrollToPage(currentPage - 1)}
                className="p-1 hover:text-[var(--text-primary)] disabled:text-[var(--text-muted)]/40 text-[var(--text-muted)] transition-colors rounded-full hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page Indicator / Go to PDF */}
              <span className="text-[10px] font-mono text-[var(--text-primary)] px-1">
                Go to PDF <span className="text-[var(--text-muted)]">({currentPage}/{numPages})</span>
              </span>

              {/* Next Page */}
              <button
                disabled={currentPage >= numPages}
                onClick={() => scrollToPage(currentPage + 1)}
                className="p-1 hover:text-[var(--text-primary)] disabled:text-[var(--text-muted)]/40 text-[var(--text-muted)] transition-colors rounded-full hover:bg-[var(--bg-surface-hover)] cursor-pointer"
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
