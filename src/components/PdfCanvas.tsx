import React, { useState } from 'react';
import { SyncTeXBox } from '../types/index.ts';
import { Move, GripVertical, CheckCircle2 } from 'lucide-react';

interface PdfCanvasProps {
  zoom: number;
  pdfUrl?: string | null;
  synctexBoxes: SyncTeXBox[];
  onDirectEdit: (newText: string, targetLine: number) => void;
  onBlockReorder: (sourceBlockId: string, targetBlockId: string) => void;
  onJumpToSource: (line: number) => void;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({
  zoom,
  pdfUrl,
  synctexBoxes,
  onDirectEdit,
  onBlockReorder,
  onJumpToSource,
}) => {
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  // Scaled dimensions based on 8.5 x 11 inch paper at 72dpi = 612 x 792 pt
  const scale = zoom / 100;
  const paperWidth = 612 * scale;
  const paperHeight = 792 * scale;

  return (
    <div className="flex-1 h-full bg-[#11100e] overflow-auto flex items-start justify-center p-8 select-none relative">
      {/* Paper Canvas (Rendered PDF Layout) */}
      <div
        style={{
          width: `${paperWidth}px`,
          minHeight: `${paperHeight}px`,
          transformOrigin: 'top center',
        }}
        className="bg-[#fdfbf7] text-[#1c1917] shadow-2xl rounded-sm p-12 relative flex flex-col justify-between transition-all duration-150 font-serif"
      >
        {/* Academic Paper Header */}
        <div className="text-center space-y-3 mb-6">
          <h1
            onClick={() => {
              setEditingLine(14);
              setEditText('A Novel Approach to LaTeX Workflows');
              onJumpToSource(14);
            }}
            className="text-2xl font-bold tracking-tight text-[#1c1917] cursor-text hover:bg-amber-100/60 rounded px-1 transition-colors relative"
          >
            {editingLine === 14 ? (
              <input
                type="text"
                value={editText}
                autoFocus
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => {
                  onDirectEdit(editText, 14);
                  setEditingLine(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onDirectEdit(editText, 14);
                    setEditingLine(null);
                  }
                }}
                className="bg-white border border-amber-500 rounded px-1 text-center w-full text-2xl font-bold font-serif focus:outline-none"
              />
            ) : (
              'A Novel Approach to LaTeX Workflows'
            )}
          </h1>

          <div className="text-sm italic text-[#57534e]">Authors: LocTex Research Group</div>
          <div className="text-xs text-[#78716c]">October 2026</div>
        </div>

        {/* Abstract Box */}
        <div className="my-4 px-6 text-center">
          <div className="text-xs font-bold uppercase tracking-wider mb-1">Abstract</div>
          <p
            onClick={() => {
              setEditingLine(18);
              setEditText(
                'This paper presents LocTex, an autonomous personal research environment that merges instant local compilation, bidirectional visual PDF text manipulation, and frictionless daily journaling.'
              );
              onJumpToSource(18);
            }}
            className="text-xs leading-relaxed text-[#44403c] text-justify cursor-text hover:bg-amber-100/60 rounded p-1 transition-colors"
          >
            This paper presents LocTex, an autonomous personal research environment that merges instant local compilation, bidirectional visual PDF text manipulation, and frictionless daily journaling.
          </p>
        </div>

        {/* Two-Column Body Layout */}
        <div className="grid grid-cols-2 gap-6 my-4 text-xs leading-relaxed text-[#292524] text-justify">
          {/* Column 1: Introduction */}
          <div className="space-y-3">
            <h2
              onClick={() => onJumpToSource(22)}
              className="text-sm font-bold border-b border-[#d6d3d1] pb-1 cursor-pointer hover:text-amber-700"
            >
              1. Introduction
            </h2>
            <p
              onClick={() => {
                setEditingLine(24);
                setEditText('Modern academic authoring has historically suffered from cloud lag, multi-tenant bloat, and rigid split-pane barriers.');
                onJumpToSource(24);
              }}
              className="cursor-text hover:bg-amber-100/60 rounded p-0.5"
            >
              Modern academic authoring has historically suffered from cloud lag, multi-tenant bloat, and rigid split-pane barriers. By coupling the Tectonic incremental compiler with local SyncTeX coordinate mapping, users can directly manipulate their compiled documents visually.
            </p>

            <h2
              onClick={() => onJumpToSource(30)}
              className="text-sm font-bold border-b border-[#d6d3d1] pb-1 pt-2 cursor-pointer hover:text-amber-700"
            >
              2. Methodology
            </h2>
            <p className="cursor-text hover:bg-amber-100/60 rounded p-0.5">
              We define a deterministic bidirectional mapping between the compiled PostScript coordinate bounding boxes and the underlying LaTeX Abstract Syntax Tree tokens.
            </p>
          </div>

          {/* Column 2: Figure with Semantic Drag & Drop Guide (As shown in mockup) */}
          <div className="space-y-4">
            <p className="cursor-text hover:bg-amber-100/60 rounded p-0.5">
              The primary results from this analysis are highlighted in Figure 2, demonstrating sub-300ms roundtrip updates with zero layout shift.
            </p>

            {/* Semantic Draggable Figure with Dashed Boundary Guides */}
            <div
              draggable
              onDragStart={() => setDraggedBlock('figure-2')}
              onDragEnd={() => setDraggedBlock(null)}
              className="border-2 border-dashed border-sky-400 bg-sky-50/40 p-4 rounded-lg flex flex-col items-center justify-center relative group cursor-grab active:cursor-grabbing hover:border-sky-600 transition-all shadow-sm"
            >
              {/* Drag Handle Floating Badge */}
              <div className="absolute -top-3 right-3 bg-sky-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-2.5 h-2.5" />
                <span>Drag to Reorder</span>
              </div>

              {/* Diagram Flowchart Graphic */}
              <div className="w-full space-y-2 py-2 flex flex-col items-center">
                <div className="w-24 h-6 border border-zinc-700 rounded bg-white flex items-center justify-center text-[10px] shadow-sm">
                  Source (.tex)
                </div>
                <div className="w-px h-3 bg-zinc-700" />
                <div className="w-28 h-8 border-2 border-sky-500 rounded bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-900 shadow-sm">
                  SyncTeX AST Bridge
                </div>
                <div className="w-px h-3 bg-zinc-700" />
                <div className="w-24 h-6 border border-zinc-700 rounded bg-white flex items-center justify-center text-[10px] shadow-sm">
                  Compiled PDF
                </div>
              </div>

              <div className="text-[10px] font-semibold text-zinc-700 mt-2 text-center">
                Figure 2: Bidirectional SyncTeX Architecture
              </div>
            </div>

            {/* Interactive Inline Text Edit Highlight (As shown in mockup) */}
            <div
              onClick={() => {
                setEditingLine(45);
                setEditText('The primary results from this analysis confirm sub-second latency.');
                onJumpToSource(45);
              }}
              className="bg-amber-200/50 border border-amber-400/80 rounded px-1.5 py-1 text-xs cursor-text flex items-center gap-1"
            >
              <span>... The primary <span className="underline decoration-amber-600 font-medium">results from</span> this analysis (see Figure 2).</span>
              <span className="w-0.5 h-3.5 bg-black animate-pulse" />
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="border-t border-[#e7e5e4] pt-3 flex items-center justify-between text-[10px] text-[#78716c]">
          <span>LocTex Research Workspace</span>
          <span className="font-mono">Page 1</span>
        </div>
      </div>
    </div>
  );
};
