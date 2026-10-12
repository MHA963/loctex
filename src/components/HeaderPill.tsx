import React, { useState } from 'react';
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
  GitCommit,
} from 'lucide-react';
import { CompileStatus, FontFamily, ThemeName, WorkspaceMode } from '../types/index.ts';

interface HeaderPillProps {
  compileStatus: CompileStatus;
  compileDurationMs?: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitWidth: () => void;
  onCompile: () => void;
  onOpenGitHubActivity?: () => void;
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
  onOpenGitHubActivity,
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
  theme,
  onThemeChange,
  mode,
  onModeChange,
  activeFileName = 'Methodology.tex',
  projectName = 'My Research',
}) => {
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

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
    <header className="h-10 bg-[#141311] border-b border-[#24221e] px-3 flex items-center justify-between select-none relative z-30 font-sans">
      {/* Window Controls & GitHub Activity Shortcut */}
      <div className="flex items-center gap-3 w-1/4">
        <div className="flex items-center gap-1.5 pl-1">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-sm" />
        </div>

        {onOpenGitHubActivity && (
          <button
            onClick={onOpenGitHubActivity}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1e1d1a] hover:bg-[#282622] text-[#8c887e] hover:text-[#f4f2ec] border border-[#33302a] text-[10px] font-mono transition-colors"
            title="Inspect 5 GitHub activities & contribution graph"
          >
            <GitCommit className="w-3 h-3 text-emerald-400" />
            <span className="hidden md:inline">Activities</span>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] flex items-center justify-center font-bold">
              5
            </span>
          </button>
        )}
      </div>

      {/* Floating Center Pill */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-[#1e1d1a]/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-[#33302a] shadow-2xl text-[11px] text-[#a8a49c] gap-2.5">
          {/* Compile Status & Trigger */}
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-[#8c887e]">[LocTex • v1.4</span>
            <span className="text-[#4a4740]">|</span>
            <span className="text-[#c7c3b8]">Status:</span>
            <span className="text-[#f4f2ec] font-semibold flex items-center gap-1">
              {compileStatus === 'compiling' ? 'Compiling...' : 'Ready'}
              {compileDurationMs !== undefined && compileDurationMs > 0 && compileStatus === 'ready' && (
                <span className="text-[9px] text-emerald-400 font-mono">
                  ({(compileDurationMs / 1000).toFixed(1)}s)
                </span>
              )}
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  compileStatus === 'compiling'
                    ? 'bg-amber-400 animate-ping'
                    : compileStatus === 'error'
                    ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                    : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                }`}
              />
            </span>
            <button
              onClick={onCompile}
              className="p-0.5 hover:text-[#d4af37] text-[#8c887e] transition-colors"
              title="Compile (Ctrl+Enter / Cmd+Enter / Ctrl+S)"
            >
              <RotateCw className={`w-3 h-3 ${compileStatus === 'compiling' ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-[#8c887e]">]</span>
          </div>

          <span className="text-[#4a4740]">•</span>

          {/* Zoom Controls & Fit Width */}
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <button
              onClick={() => onZoomChange(Math.max(40, zoom - 10))}
              className="p-0.5 hover:text-[#f4f2ec] text-[#8c887e]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[#f4f2ec] font-semibold w-8 text-center">{zoom}%</span>
            <button
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="p-0.5 hover:text-[#f4f2ec] text-[#8c887e]"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={onFitWidth}
              className="ml-1 px-1.5 py-0.5 rounded bg-[#2a2824] hover:bg-[#383530] text-[9px] text-[#f4f2ec] border border-[#3d3a33] flex items-center gap-1"
              title="Fit to Width"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              Fit
            </button>
          </div>

          <span className="text-[#4a4740]">•</span>

          {/* Academic Typography: Font Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFontMenuOpen(!fontMenuOpen)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2a2824] hover:bg-[#383530] text-[#f4f2ec] border border-[#3d3a33] transition-colors"
            >
              <span>{fontFamily}</span>
              <ChevronDown className="w-2.5 h-2.5 text-[#8c887e]" />
            </button>

            {fontMenuOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-52 bg-[#1e1d1a] border border-[#3d3a33] rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[#8c887e] font-semibold">
                  Academic Fonts
                </div>
                {academicFonts.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => {
                      onFontFamilyChange(f.name);
                      setFontMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#2a2824] text-[11px] flex items-center justify-between ${
                      fontFamily === f.name ? 'text-[#d4af37] font-semibold' : 'text-[#f4f2ec]'
                    }`}
                  >
                    <span className={f.previewClass}>{f.name}</span>
                    {fontFamily === f.name && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Style Buttons: B, I, U */}
          <div className="flex items-center bg-[#2a2824] rounded border border-[#3d3a33] overflow-hidden">
            <button
              onClick={onToggleBold}
              className={`px-1.5 py-0.5 font-serif font-bold text-[11px] transition-colors ${
                isBold ? 'bg-[#d4af37] text-black' : 'text-[#a8a49c] hover:text-[#f4f2ec]'
              }`}
              title="Bold (\textbf)"
            >
              B
            </button>
            <button
              onClick={onToggleItalic}
              className={`px-1.5 py-0.5 font-serif italic text-[11px] border-l border-[#3d3a33] transition-colors ${
                isItalic ? 'bg-[#d4af37] text-black' : 'text-[#a8a49c] hover:text-[#f4f2ec]'
              }`}
              title="Italic (\textit)"
            >
              I
            </button>
            <button
              onClick={onToggleUnderline}
              className={`px-1.5 py-0.5 font-serif underline text-[11px] border-l border-[#3d3a33] transition-colors ${
                isUnderline ? 'bg-[#d4af37] text-black' : 'text-[#a8a49c] hover:text-[#f4f2ec]'
              }`}
              title="Underline (\underline)"
            >
              U
            </button>
          </div>

          {/* Font Size Selector */}
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(e.target.value)}
            className="bg-[#2a2824] text-[#f4f2ec] rounded px-1.5 py-0.5 text-[10px] font-mono border border-[#3d3a33] focus:outline-none cursor-pointer"
          >
            <option value="10pt">10pt</option>
            <option value="11pt">11pt</option>
            <option value="12pt">12pt</option>
          </select>
        </div>
      </div>

      {/* Right Title & Theme Switcher */}
      <div className="flex items-center justify-end gap-2.5 w-1/4">
        <span className="text-[11px] text-[#78746c] truncate">
          LocTex - {activeFileName} ({projectName})
        </span>

        {/* Theme Dot */}
        <div className="relative">
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-1 rounded-full hover:bg-[#24221e] transition-colors"
            title="Switch Theme"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: themes.find((t) => t.name === theme)?.dotColor }}
            />
          </button>

          {themeMenuOpen && (
            <div className="absolute top-full mt-1 right-0 w-36 bg-[#1e1d1a] border border-[#3d3a33] rounded-lg shadow-2xl py-1 z-50">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    onThemeChange(t.name);
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1 hover:bg-[#2a2824] text-[11px] flex items-center gap-2 ${
                    theme === t.name ? 'text-[#d4af37] font-semibold' : 'text-[#f4f2ec]'
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
