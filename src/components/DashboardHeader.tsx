import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Square, Palette, ChevronDown, Folder } from 'lucide-react';
import { ThemeName } from '../types/index.ts';

interface DashboardHeaderProps {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  theme,
  onThemeChange,
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const themes: { name: ThemeName; label: string; dotColor: string }[] = [
    { name: 'dark-gold', label: 'Dark Gold', dotColor: '#d4af37' },
    { name: 'neon-green', label: 'Neon Green', dotColor: '#00ff88' },
    { name: 'charcoal', label: 'Charcoal Slate', dotColor: '#38bdf8' },
    { name: 'sepia', label: 'Warm Sepia Paper', dotColor: '#92400e' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    if (themeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [themeMenuOpen]);

  return (
    <header
      className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-color-subtle)] px-2.5 flex items-center justify-between select-none relative z-30 font-sans text-[var(--text-primary)] w-full"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Window Controls & App Identity */}
      <div
        className="flex items-center gap-3 flex-shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
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

        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
          <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>LocTex</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color-subtle)]">
            Workspace Dashboard
          </span>
        </div>
      </div>

      {/* Draggable center area (large empty hit target for easy window dragging when not fullscreen) */}
      <div className="flex-1 h-full mx-4" />

      {/* Theme Switcher */}
      <div
        className="flex items-center justify-end gap-2 flex-shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shadow-xs"
            title="Change Appearance Theme"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: themes.find((t) => t.name === theme)?.dotColor }}
            />
            <span className="text-[11px] font-medium hidden sm:inline">Theme</span>
            <ChevronDown className="w-2.5 h-2.5 text-[var(--text-muted)]" />
          </button>

          {themeMenuOpen && (
            <div className="absolute top-full mt-1.5 right-0 w-44 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold border-b border-[var(--border-color-subtle)] mb-1">
                Color Themes
              </div>
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    onThemeChange(t.name);
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[var(--bg-surface-hover)] text-[11px] flex items-center justify-between transition-colors ${
                    theme === t.name
                      ? 'text-[var(--accent-primary)] font-semibold bg-[var(--bg-surface-hover)]/40'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: t.dotColor }} />
                    <span>{t.label}</span>
                  </div>
                  {theme === t.name && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
