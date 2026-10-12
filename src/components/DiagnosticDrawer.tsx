import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  Wrench,
  Copy,
  Check,
} from 'lucide-react';
import { DiagnosticError } from '../types/index.ts';

interface DiagnosticDrawerProps {
  diagnostics: DiagnosticError[];
  onJumpToLine: (line: number, file: string) => void;
  onApplyQuickFix?: (diagnostic: DiagnosticError) => void;
}

export const DiagnosticDrawer: React.FC<DiagnosticDrawerProps> = ({
  diagnostics,
  onJumpToLine,
  onApplyQuickFix,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'errors' | 'warnings'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');

  const filteredItems = diagnostics.filter((d) => {
    if (activeFilter === 'errors') return d.severity === 'error';
    if (activeFilter === 'warnings') return d.severity === 'warning';
    return true;
  });

  const handleCopy = (item: DiagnosticError, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `[${item.severity.toUpperCase()}] ${item.file}:${item.line} - ${item.message}\n${
      item.suggestion ? `Suggestion: ${item.suggestion}` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="absolute bottom-0 right-0 z-40 select-none font-sans">
      {/* Collapsed Pill Badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="m-2 px-3 py-1 rounded-md bg-[#1e1d1a]/95 backdrop-blur-md border border-[#33302a] text-[11px] text-[#a8a49c] hover:text-[#f4f2ec] hover:bg-[#262420] shadow-xl flex items-center gap-2 transition-all hover:border-[#d4af37]/40"
        >
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                errors.length > 0 ? 'bg-rose-500 animate-pulse' : warnings.length > 0 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            />
            {errors.length} Errors, {warnings.length} Warnings
          </span>
        </button>
      )}

      {/* Expanded Diagnostic Drawer */}
      {isOpen && (
        <div className="w-[580px] max-h-96 bg-[#181714]/98 backdrop-blur-2xl border border-[#3d3a33] rounded-tl-2xl shadow-2xl flex flex-col overflow-hidden m-0">
          {/* Header */}
          <div className="px-4 py-2 border-b border-[#2e2c26] flex items-center justify-between bg-[#12110f] text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#f4f2ec]">LaTeX Compiler Diagnostics</span>
              {/* Filter Tabs */}
              <div className="flex items-center bg-[#1e1d1a] rounded-lg border border-[#33302a] p-0.5 text-[10px]">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-[#2d2a23] text-[#d4af37] font-semibold'
                      : 'text-[#8c887e] hover:text-[#f4f2ec]'
                  }`}
                >
                  All ({diagnostics.length})
                </button>
                <button
                  onClick={() => setActiveFilter('errors')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeFilter === 'errors'
                      ? 'bg-rose-950/60 text-rose-300 font-semibold'
                      : 'text-[#8c887e] hover:text-[#f4f2ec]'
                  }`}
                >
                  Errors ({errors.length})
                </button>
                <button
                  onClick={() => setActiveFilter('warnings')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeFilter === 'warnings'
                      ? 'bg-amber-950/60 text-amber-300 font-semibold'
                      : 'text-[#8c887e] hover:text-[#f4f2ec]'
                  }`}
                >
                  Warnings ({warnings.length})
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-[#262420] text-[#8c887e] hover:text-[#f4f2ec] transition-colors"
              title="Close Drawer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Diagnostics List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-[#78746c] italic text-[11px] space-y-1">
                <div className="text-emerald-400 font-medium">✓ Zero compilation defects reported.</div>
                <div>All cross-references and syntax passes verified clean.</div>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onJumpToLine(item.line, item.file)}
                  className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer group transition-all shadow-sm ${
                    item.severity === 'error'
                      ? 'bg-rose-950/15 border-rose-900/40 hover:border-rose-700/60'
                      : 'bg-amber-950/15 border-amber-900/40 hover:border-amber-700/60'
                  }`}
                >
                  {/* Top Bar: Severity & Line Jump */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 overflow-hidden">
                      {item.severity === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-mono text-[11px] font-semibold text-[#f4f2ec]">
                          <span className="text-[#a8a49c]">{item.file}:</span> Line {item.line}
                        </div>
                        <p className="text-xs text-[#dedbd2] mt-0.5 leading-snug">{item.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleCopy(item, e)}
                        className="p-1 rounded hover:bg-[#262420] text-[#8c887e] hover:text-[#f4f2ec]"
                        title="Copy diagnostic details"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <div className="flex items-center gap-1 text-[10px] text-[#d4af37] group-hover:underline">
                        <span>Jump</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Excerpt Snippet */}
                  {item.excerpt && (
                    <div className="bg-[#100f0d] border border-[#262420] rounded-lg px-2.5 py-1 font-mono text-[11px] text-[#e5c158] overflow-x-auto">
                      <code>{item.excerpt}</code>
                    </div>
                  )}

                  {/* Smart Fixing Suggestion & Quick Fix Action */}
                  {item.suggestion && (
                    <div className="bg-[#1e1c18] border border-[#3a352a] rounded-lg p-2 flex items-start justify-between gap-2 text-[11px]">
                      <div className="flex items-start gap-1.5 text-[#dcd7cb]">
                        <Lightbulb className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{item.suggestion}</span>
                      </div>

                      {item.quickFix && onApplyQuickFix && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyQuickFix(item);
                          }}
                          className="px-2.5 py-1 rounded bg-[#d4af37] hover:bg-[#e5c158] text-black font-semibold text-[10px] shrink-0 flex items-center gap-1 transition-colors shadow-sm"
                          title={item.quickFix.label}
                        >
                          <Wrench className="w-3 h-3" />
                          <span>{item.quickFix.label}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
