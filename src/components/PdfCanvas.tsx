import React, { useState } from 'react';
import { SyncTeXBox } from '../types/index.ts';
import { GripVertical, Move, Check, Sparkles } from 'lucide-react';

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
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Dynamic editable sections
  const [title, setTitle] = useState('A Novel Approach to LaTeX Workflows');
  const [abstract, setAbstract] = useState(
    'This paper presents LocTex, an autonomous personal research environment that merges instant local compilation, bidirectional visual PDF text manipulation, and frictionless daily journaling.'
  );
  const [introText, setIntroText] = useState(
    'Modern academic authoring has historically suffered from cloud lag, multi-tenant bloat, and rigid split-pane barriers. By coupling the Tectonic incremental compiler with local SyncTeX coordinate mapping, users can directly manipulate their compiled documents visually.'
  );
  const [methodText, setMethodText] = useState(
    'We define a deterministic bidirectional mapping between the compiled PostScript coordinate bounding boxes and the underlying LaTeX Abstract Syntax Tree tokens.'
  );
  const [resultsText, setResultsText] = useState(
    'The primary results from this analysis (see Figure 2) demonstrate sub-300ms roundtrip updates with zero layout shift.'
  );

  const scale = zoom / 100;
  const paperWidth = 612 * scale;
  const paperHeight = 792 * scale;

  const handleSaveEdit = (key: string, line: number) => {
    if (key === 'title') setTitle(editText);
    if (key === 'abstract') setAbstract(editText);
    if (key === 'intro') setIntroText(editText);
    if (key === 'method') setMethodText(editText);
    if (key === 'results') setResultsText(editText);

    onDirectEdit(editText, line);
    setEditingKey(null);
  };

  return (
    <div className="flex-1 h-full bg-[#11100e] overflow-auto flex items-start justify-center p-8 select-none relative">
      {/* Paper Canvas */}
      <div
        style={{
          width: `${paperWidth}px`,
          minHeight: `${paperHeight}px`,
          transformOrigin: 'top center',
        }}
        className="bg-[#fdfbf7] text-[#1c1917] shadow-2xl rounded-sm p-12 relative flex flex-col justify-between transition-all duration-150 font-serif"
      >
        {/* Paper Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="relative group">
            {editingKey === 'title' ? (
              <input
                type="text"
                value={editText}
                autoFocus
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleSaveEdit('title', 14)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit('title', 14);
                }}
                className="bg-white border-2 border-amber-500 rounded px-2 py-1 text-center w-full text-2xl font-bold font-serif focus:outline-none shadow-md"
              />
            ) : (
              <h1
                onClick={() => {
                  setEditingKey('title');
                  setEditText(title);
                  onJumpToSource(14);
                }}
                className="text-2xl font-bold tracking-tight text-[#1c1917] cursor-text hover:bg-amber-100/60 rounded px-1.5 py-0.5 transition-colors"
                title="Click to edit title"
              >
                {title}
              </h1>
            )}
          </div>

          <div className="text-sm italic text-[#57534e]">Authors: LocTex Research Group</div>
          <div className="text-xs text-[#78716c]">October 2026</div>
        </div>

        {/* Abstract Box */}
        <div className="my-3 px-6 text-center">
          <div className="text-xs font-bold uppercase tracking-wider mb-1">Abstract</div>
          {editingKey === 'abstract' ? (
            <textarea
              value={editText}
              autoFocus
              rows={3}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => handleSaveEdit('abstract', 18)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) handleSaveEdit('abstract', 18);
              }}
              className="w-full bg-white border-2 border-amber-500 rounded p-2 text-xs leading-relaxed text-[#1c1917] font-serif focus:outline-none shadow-md"
            />
          ) : (
            <p
              onClick={() => {
                setEditingKey('abstract');
                setEditText(abstract);
                onJumpToSource(18);
              }}
              className="text-xs leading-relaxed text-[#44403c] text-justify cursor-text hover:bg-amber-100/60 rounded p-1.5 transition-colors"
              title="Click to edit abstract"
            >
              {abstract}
            </p>
          )}
        </div>

        {/* Two-Column Body Layout */}
        <div className="grid grid-cols-2 gap-6 my-4 text-xs leading-relaxed text-[#292524] text-justify">
          {/* Column 1: Introduction & Method */}
          <div className="space-y-3">
            <h2
              onClick={() => onJumpToSource(22)}
              className="text-sm font-bold border-b border-[#d6d3d1] pb-1 cursor-pointer hover:text-amber-700"
            >
              1. Introduction
            </h2>

            {editingKey === 'intro' ? (
              <textarea
                value={editText}
                autoFocus
                rows={4}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleSaveEdit('intro', 24)}
                className="w-full bg-white border-2 border-amber-500 rounded p-1.5 text-xs text-[#1c1917] font-serif focus:outline-none shadow-md"
              />
            ) : (
              <p
                onClick={() => {
                  setEditingKey('intro');
                  setEditText(introText);
                  onJumpToSource(24);
                }}
                className="cursor-text hover:bg-amber-100/60 rounded p-1 transition-colors"
                title="Click to edit introduction"
              >
                {introText}
              </p>
            )}

            <h2
              onClick={() => onJumpToSource(30)}
              className="text-sm font-bold border-b border-[#d6d3d1] pb-1 pt-2 cursor-pointer hover:text-amber-700"
            >
              2. Methodology
            </h2>

            {editingKey === 'method' ? (
              <textarea
                value={editText}
                autoFocus
                rows={3}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleSaveEdit('method', 32)}
                className="w-full bg-white border-2 border-amber-500 rounded p-1.5 text-xs text-[#1c1917] font-serif focus:outline-none shadow-md"
              />
            ) : (
              <p
                onClick={() => {
                  setEditingKey('method');
                  setEditText(methodText);
                  onJumpToSource(32);
                }}
                className="cursor-text hover:bg-amber-100/60 rounded p-1 transition-colors"
                title="Click to edit methodology"
              >
                {methodText}
              </p>
            )}
          </div>

          {/* Column 2: Figure with Semantic Drag & Drop Guide */}
          <div className="space-y-4">
            {editingKey === 'results' ? (
              <textarea
                value={editText}
                autoFocus
                rows={3}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleSaveEdit('results', 42)}
                className="w-full bg-white border-2 border-amber-500 rounded p-1.5 text-xs text-[#1c1917] font-serif focus:outline-none shadow-md"
              />
            ) : (
              <p
                onClick={() => {
                  setEditingKey('results');
                  setEditText(resultsText);
                  onJumpToSource(42);
                }}
                className="cursor-text hover:bg-amber-100/60 rounded p-1 transition-colors"
                title="Click to edit results"
              >
                {resultsText}
              </p>
            )}

            {/* Semantic Draggable Figure */}
            <div
              draggable
              onDragStart={() => setDraggedBlock('figure-2')}
              onDragEnd={() => {
                setDraggedBlock(null);
                setDropTarget(null);
                onBlockReorder('figure-2', 'after-results');
              }}
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center relative group cursor-grab active:cursor-grabbing transition-all shadow-sm ${
                draggedBlock === 'figure-2'
                  ? 'border-amber-500 bg-amber-50/60 scale-95 opacity-80'
                  : 'border-sky-400 bg-sky-50/40 hover:border-sky-600'
              }`}
            >
              {/* Drag Handle Floating Badge */}
              <div className="absolute -top-3 right-3 bg-sky-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-2.5 h-2.5" />
                <span>Drag Figure</span>
              </div>

              {/* Flowchart Diagram Graphic */}
              <div className="w-full space-y-2 py-2 flex flex-col items-center select-none">
                <div className="w-24 h-6 border border-zinc-700 rounded bg-white flex items-center justify-center text-[10px] shadow-sm">
                  Source (.tex)
                </div>
                <div className="w-px h-3 bg-zinc-700" />
                <div className="w-28 h-8 border-2 border-sky-500 rounded bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-900 shadow-sm">
                  SyncTeX Bridge
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

            {/* Inline Text Edit Highlight Cursor */}
            <div
              onClick={() => {
                setEditingKey('results');
                setEditText(resultsText);
                onJumpToSource(42);
              }}
              className="bg-amber-200/50 border border-amber-400/80 rounded px-2 py-1 text-xs cursor-text flex items-center gap-1"
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
