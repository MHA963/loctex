import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Bold,
  Italic,
  Underline,
  Code,
  ChevronDown,
  Palette,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { CompileStatus, FontFamily, ThemeName, WorkspaceMode } from '../types/index.ts';

interface HeaderPillProps {
  compileStatus: CompileStatus;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onCompile: () => void;
  fontFamily: FontFamily;
  onFontFamilyChange: (font: FontFamily) => void;
  fontSize: string;
  onFontSizeChange: (size: string) => void;
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
}

export const HeaderPill: React.FC<HeaderPillProps> = ({
  compileStatus,
  zoom,
  onZoomChange,
  onCompile,
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
  isBold,
  onToggleBold,
  isItalic,
  onToggleItalic,
  isUnderline,
  onToggleUnderline,
  isCode,
  onToggleCode,
  theme,
  onThemeChange,
  mode,
  onModeChange,
}) => {
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const fonts: FontFamily[] = ['Computer Modern', 'Serif', 'Inter', 'Garamond', 'Geist Mono'];
  const themes: { name: ThemeName; label: string; dotColor: string }[] = [
    { name: 'dark-gold', label: 'Dark Gold', dotColor: '#d4af37' },
    { name: 'neon-green', label: 'Neon Green', dotColor: '#00ff88' },
    { name: 'charcoal', label: 'Charcoal Slate', dotColor: '#38bdf8' },
    { name: 'sepia', label: 'Warm Sepia Paper', dotColor: '#92400e' },
  ];

  return (
    <header className="h-14 border-b border-[var(--border-color-subtle)] bg-[var(--bg-primary)] px-4 flex items-center justify-between select-none relative z-30">
      {/* Left branding & Mode Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-primary)]/40 flex items-center justify-center font-bold text-black text-xs">
            LT
          </div>
          <span className="font-semibold text-sm tracking-wide text-[var(--text-primary)]">LocTex</span>
        </div>

        <div className="h-4 w-px bg-[var(--border-color-subtle)] mx-1" />

        {/* Mode Switcher */}
        <div className="flex bg-[var(--bg-surface)] p-0.5 rounded-lg border border-[var(--border-color-subtle)] text-xs">
          <button
            onClick={() => onModeChange('research-studio')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              mode === 'research-studio'
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-primary)] font-medium shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Research Studio
          </button>
          <button
            onClick={() => onModeChange('daily-journal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              mode === 'daily-journal'
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-primary)] font-medium shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Daily Journal
          </button>
        </div>
      </div>

      {/* Floating Center Pill (Compile Status, Zoom, Typography) */}
      <div className="flex items-center bg-[var(--bg-surface)]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[var(--border-color)] shadow-lg shadow-black/20 gap-3.5 text-xs text-[var(--text-secondary)]">
        {/* Compile Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                compileStatus === 'ready'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : compileStatus === 'compiling'
                  ? 'bg-amber-400 animate-ping'
                  : compileStatus === 'error'
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="font-medium capitalize text-[var(--text-primary)]">
              {compileStatus === 'compiling' ? 'Compiling...' : compileStatus}
            </span>
          </div>

          <button
            onClick={onCompile}
            disabled={compileStatus === 'compiling'}
            title="Compile Document (Ctrl+S / Cmd+S)"
            className="p-1 rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${compileStatus === 'compiling' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="h-3.5 w-px bg-[var(--border-color-subtle)]" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center font-mono text-[11px] text-[var(--text-primary)]">{zoom}%</span>
          <button
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-3.5 w-px bg-[var(--border-color-subtle)]" />

        {/* Typography Formatting Controls */}
        <div className="flex items-center gap-2">
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFontMenuOpen(!fontMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-surface-hover)] text-[var(--text-primary)] hover:border-[var(--border-color)] border border-transparent transition-all"
            >
              <span>{fontFamily}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>

            {fontMenuOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-36 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 z-50">
                {fonts.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      onFontFamilyChange(f);
                      setFontMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[var(--bg-surface-hover)] text-xs flex items-center justify-between ${
                      fontFamily === f ? 'text-[var(--accent-primary)] font-medium' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Style Buttons (Bold, Italic, Underline, Code) */}
          <div className="flex items-center bg-[var(--bg-surface-hover)] rounded p-0.5 border border-[var(--border-color-subtle)]">
            <button
              onClick={onToggleBold}
              className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                isBold ? 'bg-[var(--accent-primary)] text-black font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Bold"
            >
              <Bold className="w-3 h-3" />
            </button>
            <button
              onClick={onToggleItalic}
              className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                isItalic ? 'bg-[var(--accent-primary)] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Italic"
            >
              <Italic className="w-3 h-3" />
            </button>
            <button
              onClick={onToggleUnderline}
              className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                isUnderline ? 'bg-[var(--accent-primary)] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Underline"
            >
              <Underline className="w-3 h-3" />
            </button>
            <button
              onClick={onToggleCode}
              className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                isCode ? 'bg-[var(--accent-primary)] text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Monospace Code"
            >
              <Code className="w-3 h-3" />
            </button>
          </div>

          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(e.target.value)}
            className="bg-[var(--bg-surface-hover)] text-[var(--text-primary)] rounded px-1.5 py-0.5 text-xs border border-[var(--border-color-subtle)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
          >
            <option value="10pt">10pt</option>
            <option value="11pt">11pt</option>
            <option value="12pt">12pt</option>
          </select>
        </div>
      </div>

      {/* Right Actions: Theme Selector & User Settings */}
      <div className="flex items-center gap-3">
        {/* Theme Picker */}
        <div className="relative">
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color-subtle)] text-xs text-[var(--text-secondary)] transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: themes.find((t) => t.name === theme)?.dotColor }}
            />
            <span className="capitalize">{theme.replace('-', ' ')}</span>
            <Palette className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>

          {themeMenuOpen && (
            <div className="absolute top-full mt-1.5 right-0 w-44 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 z-50">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    onThemeChange(t.name);
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[var(--bg-surface-hover)] text-xs flex items-center gap-2 ${
                    theme === t.name ? 'text-[var(--accent-primary)] font-medium' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.dotColor }} />
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
