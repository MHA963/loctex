import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronUp, ChevronDown, ExternalLink, X } from 'lucide-react';
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
    <div className="absolute bottom-0 right-0 z-40 select-none">
      {/* Collapsed Pill Badge (As shown in approved mockup) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`m-3 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs flex items-center gap-2 shadow-2xl transition-all ${
            errors.length > 0
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-200 hover:bg-rose-900/80'
              : warnings.length > 0
              ? 'bg-amber-950/80 border-amber-500/40 text-amber-200 hover:bg-amber-900/80'
              : 'bg-[var(--bg-surface)]/90 border-[var(--border-color-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          {errors.length > 0 ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {errors.length} {errors.length === 1 ? 'Error' : 'Errors'}, {warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}
          </span>
          <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" />
        </button>
      )}

      {/* Expanded Diagnostic Drawer */}
      {isOpen && (
        <div className="w-[580px] max-h-72 bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-tl-xl shadow-2xl flex flex-col overflow-hidden m-0">
          {/* Header */}
          <div className="px-3.5 py-2 border-b border-[var(--border-color-subtle)] flex items-center justify-between bg-[var(--bg-primary)]/80 text-xs">
            <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
              <span>Errors and Warnings</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                ({errors.length} errors, {warnings.length} warnings)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List of Diagnostics */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
            {diagnostics.length === 0 ? (
              <div className="py-4 text-center text-[var(--text-muted)] italic">No syntax errors found. Compilation clean!</div>
            ) : (
              diagnostics.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onJumpToLine(item.line, item.file)}
                  className={`p-2 rounded-lg border flex items-start justify-between gap-3 cursor-pointer group transition-colors ${
                    item.severity === 'error'
                      ? 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/40 text-rose-200'
                      : 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2 overflow-hidden">
                    {item.severity === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <div className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">
                        Line {item.line}: {item.message}
                      </div>
                      {item.excerpt && (
                        <div className="mt-1 font-mono text-[10px] text-[var(--text-muted)] bg-black/40 px-1.5 py-0.5 rounded inline-block">
                          {item.excerpt}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-[var(--accent-primary)] group-hover:underline shrink-0">
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
