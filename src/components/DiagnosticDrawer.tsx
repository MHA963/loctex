import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { DiagnosticError } from '../types/index.ts';

interface DiagnosticDrawerProps {
  diagnostics: DiagnosticError[];
  onJumpToLine: (line: number, file: string) => void;
}

export const DiagnosticDrawer: React.FC<DiagnosticDrawerProps> = ({ diagnostics, onJumpToLine }) => {
  const [isOpen, setIsOpen] = useState(false);

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');

  return (
    <div className="absolute bottom-0 right-0 z-40 select-none font-sans">
      {/* Collapsed Pill Badge (Matching Mockup: '0 Errors, 0 Warnings' in bottom right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="m-2 px-3 py-1 rounded-md bg-[#1e1d1a]/90 backdrop-blur-md border border-[#33302a] text-[11px] text-[#a8a49c] hover:text-[#f4f2ec] hover:bg-[#262420] shadow-xl flex items-center gap-1.5 transition-colors"
        >
          <span>
            {errors.length} Errors, {warnings.length} Warnings
          </span>
        </button>
      )}

      {/* Expanded Diagnostic Drawer */}
      {isOpen && (
        <div className="w-[520px] max-h-72 bg-[#1e1d1a]/95 backdrop-blur-xl border border-[#3d3a33] rounded-tl-xl shadow-2xl flex flex-col overflow-hidden m-0">
          {/* Header */}
          <div className="px-3.5 py-1.5 border-b border-[#2e2c26] flex items-center justify-between bg-[#141311] text-xs">
            <div className="flex items-center gap-2 font-medium text-[#f4f2ec]">
              <span>Errors and Warnings</span>
              <span className="text-[10px] text-[#8c887e]">
                ({errors.length} errors, {warnings.length} warnings)
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-[#262420] text-[#8c887e] hover:text-[#f4f2ec]"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Diagnostics List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {diagnostics.length === 0 ? (
              <div className="py-3 text-center text-[#78746c] italic text-[11px]">
                0 Errors, 0 Warnings. Ready to compile.
              </div>
            ) : (
              diagnostics.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onJumpToLine(item.line, item.file)}
                  className={`p-2 rounded-lg border flex items-start justify-between gap-3 cursor-pointer group transition-colors ${
                    item.severity === 'error'
                      ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                      : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2 overflow-hidden">
                    {item.severity === 'error' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-mono text-[11px] font-semibold text-[#f4f2ec]">
                        Line {item.line}: {item.message}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-[#d4af37] group-hover:underline shrink-0">
                    <span>[jump to Line {item.line}]</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
