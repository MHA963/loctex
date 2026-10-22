import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  Palette,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  BarChart2,
  X,
  Minus,
  Square,
} from 'lucide-react';
import { CompileStatus, FontFamily, ThemeName, WorkspaceMode } from '../types/index.ts';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  FontFamilyCommand,
  FontSizeCommand,
} from '../utils/latex-format.ts';
import {
  DocumentStatistics,
  computeDocumentStatistics,
  countWords,
} from '../utils/latex-stats.ts';

interface HeaderPillProps {
  compileStatus: CompileStatus;
  compileDurationMs?: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitWidth: () => void;
  onCompile: () => void;
  onOpenQwenAssistant?: () => void;
  fontFamily?: FontFamily;
  onFontFamilyChange?: (font: FontFamily) => void;
  fontSize?: string;
  onFontSizeChange?: (size: string) => void;
  fontFamilyCommand?: FontFamilyCommand;
  onApplyFontFamily?: (family: FontFamilyCommand) => void;
  fontSizeCommand?: FontSizeCommand;
  onApplyFontSize?: (size: FontSizeCommand) => void;
  documentStatistics?: DocumentStatistics;
  fileContent?: string;
  selectedText?: string;
  isBold: boolean;
  onToggleBold: () => void;
  isItalic: boolean;
  onToggleItalic: () => void;
  isUnderline: boolean;
  onToggleUnderline: () => void;
  isCode: boolean;
  onToggleCode: () => void;
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  mode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  activeFileName?: string;
  projectName?: string;
}

export const HeaderPill: React.FC<HeaderPillProps> = ({
  compileStatus,
  compileDurationMs,
  zoom,
  onZoomChange,
  onFitWidth,
  onCompile,
  onOpenQwenAssistant,
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
  fontFamilyCommand,
  onApplyFontFamily,
  fontSizeCommand,
  onApplyFontSize,
  documentStatistics,
  fileContent,
  selectedText,
  isBold,
  onToggleBold,
  isItalic,
  onToggleItalic,
  isUnderline,
  onToggleUnderline,
  theme,
  onThemeChange,
  mode,
  onModeChange,
  activeFileName = 'Methodology.tex',
  projectName = 'My Research',
}) => {
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const stats = useMemo(() => {
    return documentStatistics ?? computeDocumentStatistics(fileContent ?? '');
  }, [documentStatistics, fileContent]);

  const selectedWordCount = useMemo(() => {
    return selectedText ? countWords(selectedText) : 0;
  }, [selectedText]);

  const currentFontFamily = fontFamilyCommand ?? 'default';
  const currentFamilyOption =
    FONT_FAMILY_OPTIONS.find((f) => f.id === currentFontFamily) ?? FONT_FAMILY_OPTIONS[0];
  const currentFontSize = fontSizeCommand ?? 'normalsize';

  const academicFonts: { name: FontFamily; label: string; previewClass: string }[] = [
    { name: 'EB Garamond', label: 'EB Garamond (Classic Academic)', previewClass: 'font-serif' },
    { name: 'Computer Modern', label: 'Computer Modern (Standard LaTeX)', previewClass: 'font-serif' },
    { name: 'Source Serif 4', label: 'Source Serif 4 (Modern Journal)', previewClass: 'font-serif' },
    { name: 'Lora', label: 'Lora (Contemporary Book)', previewClass: 'font-serif' },
    { name: 'Merriweather', label: 'Merriweather (High Legibility)', previewClass: 'font-serif' },
    { name: 'Geist Mono', label: 'Geist Mono (Code / Technical)', previewClass: 'font-mono' },
  ];

  const themes: { name: ThemeName; label: string; dotColor: string }[] = [
    { name: 'dark-gold', label: 'Dark Gold', dotColor: '#d4af37' },
    { name: 'neon-green', label: 'Neon Green', dotColor: '#00ff88' },
    { name: 'charcoal', label: 'Charcoal Slate', dotColor: '#38bdf8' },
    { name: 'sepia', label: 'Warm Sepia Paper', dotColor: '#92400e' },
  ];

  return (
    <header 
      className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-color-subtle)] px-2.5 flex items-center justify-between select-none relative z-30 font-sans text-[var(--text-primary)] w-full overflow-hidden"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Window Controls & Qwen AI Shortcut */}
      <div className="flex items-center gap-2 flex-shrink-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="flex items-center gap-1.5 pl-0.5 group/traffic">
          <button
            onClick={() => window.electronAPI?.close()}
            className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:bg-[#e0443e] border border-[#e0443e] flex items-center justify-center shadow-sm cursor-pointer transition-all hover:scale-110 text-[#4c0000] opacity-85 hover:opacity-100"
            title="Close Window (Alt+F4)"
          >
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </button>
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] hover:bg-[#dea123] border border-[#dea123] flex items-center justify-center shadow-sm cursor-pointer transition-all hover:scale-110 text-[#593900] opacity-85 hover:opacity-100"
            title="Minimize Window"
          >
            <Minus className="w-2.5 h-2.5 stroke-[3]" />
          </button>
          <button
            onClick={() => window.electronAPI?.maximize()}
            className="w-3.5 h-3.5 rounded-full bg-[#27c93f] hover:bg-[#1aab29] border border-[#1aab29] flex items-center justify-center shadow-sm cursor-pointer transition-all hover:scale-110 text-[#003d13] opacity-85 hover:opacity-100"
            title="Maximize / Restore Window"
          >
            <Square className="w-2 h-2 stroke-[3]" />
          </button>
        </div>

        {onOpenQwenAssistant && (
          <button
            onClick={onOpenQwenAssistant}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 text-[10px] font-mono transition-colors shadow-sm"
            title="Open Qwen 2.5 Coder Fast-Edit & Diagnostics (Ctrl+K)"
          >
            <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
            <span className="hidden sm:inline">Qwen 2.5</span>
          </button>
        )}
      </div>

      {/* Floating Center Pill (Flexibly fits smaller windows without overflowing) */}
      <div className="flex items-center justify-center min-w-0 mx-1 flex-shrink" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="flex items-center bg-[var(--bg-surface)]/95 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full border border-[var(--border-color)] shadow-2xl text-[11px] text-[var(--text-secondary)] gap-1.5 sm:gap-2.5 max-w-full overflow-hidden">
          {/* Compile Status & Trigger */}
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-[var(--text-muted)]">[LocTex • v1.4</span>
            <span className="text-[var(--border-color-subtle)]">|</span>
            <span className="text-[var(--text-secondary)]">Status:</span>
            <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1">
              {compileStatus === 'compiling'
                ? 'Compiling...'
                : compileStatus === 'error'
                ? 'Failed'
                : compileStatus === 'idle'
                ? 'Idle'
                : 'Ready'}
              {compileDurationMs !== undefined && compileDurationMs > 0 && compileStatus === 'ready' && (
                <span className="text-[9px] text-emerald-500 font-mono">
                  ({(compileDurationMs / 1000).toFixed(1)}s)
                </span>
              )}
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  compileStatus === 'compiling'
                    ? 'bg-amber-400 animate-ping'
                    : compileStatus === 'error'
                    ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                    : compileStatus === 'idle'
                    ? 'bg-neutral-500'
                    : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                }`}
              />
            </span>
            <button
              onClick={onCompile}
              className="p-0.5 hover:text-[var(--accent-primary)] text-[var(--text-muted)] transition-colors"
              title="Compile (Ctrl+Enter / Cmd+Enter / Ctrl+S)"
            >
              <RotateCw className={`w-3 h-3 ${compileStatus === 'compiling' ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-[var(--text-muted)]">]</span>
          </div>

          <span className="text-[var(--border-color-subtle)]">•</span>

          {/* Zoom Controls & Fit Width */}
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <button
              onClick={() => onZoomChange(Math.max(40, zoom - 10))}
              className="p-0.5 hover:text-[var(--text-primary)] text-[var(--text-muted)]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[var(--text-primary)] font-semibold w-8 text-center">{zoom}%</span>
            <button
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="p-0.5 hover:text-[var(--text-primary)] text-[var(--text-muted)]"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={onFitWidth}
              className="ml-1 px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-hover)] text-[9px] text-[var(--text-primary)] border border-[var(--border-color-subtle)] flex items-center gap-1"
              title="Fit to Width"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              Fit
            </button>
          </div>

          <span className="text-[var(--border-color-subtle)]">•</span>

          {/* Academic Typography: Font Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFontMenuOpen(!fontMenuOpen)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-color-subtle)] transition-colors text-[11px]"
              title="Apply Font Family to highlighted text"
            >
              <span>{onApplyFontFamily ? currentFamilyOption.label : fontFamily}</span>
              <ChevronDown className="w-2.5 h-2.5 text-[var(--text-muted)]" />
            </button>

            {fontMenuOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-52 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  {onApplyFontFamily ? 'LaTeX Font Family' : 'Academic Fonts'}
                </div>
                {onApplyFontFamily
                  ? FONT_FAMILY_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onApplyFontFamily(f.id);
                          setFontMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[var(--bg-surface-hover)] text-[11px] flex items-center justify-between ${
                          currentFontFamily === f.id ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        <span>{f.label}</span>
                        {currentFontFamily === f.id && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
                      </button>
                    ))
                  : academicFonts.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => {
                          onFontFamilyChange?.(f.name);
                          setFontMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[var(--bg-surface-hover)] text-[11px] flex items-center justify-between ${
                          fontFamily === f.name ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        <span className={f.previewClass}>{f.name}</span>
                        {fontFamily === f.name && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
                      </button>
                    ))}
              </div>
            )}
          </div>

          {/* Style Buttons: B, I, U */}
          <div className="flex items-center bg-[var(--bg-secondary)] rounded border border-[var(--border-color-subtle)] overflow-hidden">
            <button
              onClick={onToggleBold}
              className={`px-1.5 py-0.5 font-serif font-bold text-[11px] transition-colors ${
                isBold ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Bold (\textbf)"
            >
              B
            </button>
            <button
              onClick={onToggleItalic}
              className={`px-1.5 py-0.5 font-serif italic text-[11px] border-l border-[var(--border-color-subtle)] transition-colors ${
                isItalic ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Italic (\textit)"
            >
              I
            </button>
            <button
              onClick={onToggleUnderline}
              className={`px-1.5 py-0.5 font-serif underline text-[11px] border-l border-[var(--border-color-subtle)] transition-colors ${
                isUnderline ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Underline (\underline)"
            >
              U
            </button>
          </div>

          {/* Font Size Selector */}
          <select
            value={onApplyFontSize ? currentFontSize : fontSize}
            onChange={(e) => {
              if (onApplyFontSize) {
                onApplyFontSize(e.target.value as FontSizeCommand);
              } else if (onFontSizeChange) {
                onFontSizeChange(e.target.value);
              }
            }}
            className="bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded px-1.5 py-0.5 text-[10px] font-mono border border-[var(--border-color-subtle)] focus:outline-none cursor-pointer"
            title="Apply Font Size to highlighted text"
          >
            {onApplyFontSize ? (
              FONT_SIZE_OPTIONS.map((size) => (
                <option key={size.id} value={size.id}>
                  \{size.id}
                </option>
              ))
            ) : (
              <>
                <option value="10pt">10pt</option>
                <option value="11pt">11pt</option>
                <option value="12pt">12pt</option>
              </>
            )}
          </select>

          <span className="text-[var(--border-color-subtle)]">•</span>

          {/* Document Statistics Summary Popover */}
          <div className="relative">
            <button
              onClick={() => setStatsOpen(!statsOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-color-subtle)] transition-colors text-[10px] font-mono cursor-pointer"
              title="View Document Statistics (Words, Headers, Figures, Math)"
            >
              <BarChart2 className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>{stats.words.toLocaleString()} words</span>
            </button>

            {statsOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-color-subtle)]">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text-primary)]">
                    <BarChart2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Document Statistics</span>
                  </div>
                  <button
                    onClick={() => setStatsOpen(false)}
                    className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[var(--bg-secondary)] font-medium">
                    <span className="text-[var(--text-primary)] font-semibold">Words</span>
                    <span className="font-mono font-bold text-[var(--accent-primary)] text-xs">
                      {stats.words.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[var(--bg-secondary)]/60">
                    <span className="text-[var(--text-secondary)]">Words in Text</span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {stats.wordsInText.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[var(--bg-secondary)]/60">
                    <span className="text-[var(--text-secondary)]">Words in Headers</span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {stats.wordsInHeaders.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[var(--bg-secondary)]/60">
                    <span className="text-[var(--text-secondary)]">Words outside text</span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {stats.wordsOutsideText.toLocaleString()}
                    </span>
                  </div>

                  <div className="my-1 border-t border-[var(--border-color-subtle)]" />

                  <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[var(--bg-secondary)]/60">
                    <span className="text-[var(--text-secondary)]">Number of headers</span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {stats.numberOfHeaders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[var(--bg-secondary)]/60">
                    <span className="text-[var(--text-secondary)]">Number of figures</span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {stats.numberOfFigures}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[var(--bg-secondary)]/60">
                    <span className="text-[var(--text-secondary)]">Number of math inlines</span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {stats.numberOfMathInlines}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-[var(--bg-secondary)]/60">
                    <span className="text-[var(--text-secondary)]">Number of math displayed</span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {stats.numberOfMathDisplayed}
                    </span>
                  </div>

                  {selectedWordCount > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-[var(--border-color-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                      <span>Selection</span>
                      <span className="font-mono font-semibold text-[var(--accent-primary)]">
                        {selectedWordCount} {selectedWordCount === 1 ? 'word' : 'words'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Title & Theme Switcher (Draggable background so empty space allows easy window dragging) */}
      <div className="flex items-center justify-end gap-2 flex-shrink-0 ml-auto pr-1">
        <span 
          className="text-[11px] text-[var(--text-muted)] truncate max-w-[160px] lg:max-w-xs pointer-events-none"
        >
          LocTex - {activeFileName} ({projectName})
        </span>

        {/* Theme Dot */}
        <div className="relative" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-1 rounded-full hover:bg-[var(--bg-surface-hover)] transition-colors"
            title="Switch Theme"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: themes.find((t) => t.name === theme)?.dotColor }}
            />
          </button>

          {themeMenuOpen && (
            <div className="absolute top-full mt-1 right-0 w-36 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-2xl py-1 z-50">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    onThemeChange(t.name);
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1 hover:bg-[var(--bg-surface-hover)] text-[11px] flex items-center gap-2 ${
                    theme === t.name ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.dotColor }} />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
