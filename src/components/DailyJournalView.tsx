import React, { useState } from 'react';
import { Calendar, Plus, Tag, Search, Share2, Settings as SettingsIcon, Check, Clock } from 'lucide-react';
import katex from 'katex';
import { JournalEntry } from '../types/index.ts';

interface DailyJournalViewProps {
  journals: JournalEntry[];
  activeDate: string;
  onSelectDate: (dateStr: string) => void;
  onSaveJournal: (dateStr: string, title: string, contentTex: string, tags: string[]) => void;
}

export const DailyJournalView: React.FC<DailyJournalViewProps> = ({
  journals,
  activeDate,
  onSelectDate,
  onSaveJournal,
}) => {
  const currentJournal = journals.find((j) => j.dateStr === activeDate) || {
    id: `jour-${activeDate}`,
    dateStr: activeDate,
    title: 'Daily Research Log',
    contentTex: `• Reflecting on quantum field theories, specifically path integrals:
  $$\\int \\mathcal{D}\\phi \\, e^{\\frac{i}{\\hbar} S[\\phi]}$$
  Exploring constraints on $\\mathcal{L}_{\\text{int}}$.

• The relationship between entanglement and spacetime geometry:
  $$S_A = \\frac{\\text{Area}(\\gamma_A)}{4 G_N}$$
  Need to read Maldacena et al.

• Key items for today:
  - Verify SyncTeX coordinate parser output.
  - Review literature citations for quantum optics benchmark.`,
    tags: ['Literature', 'Ideas', 'Physics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [title, setTitle] = useState(currentJournal.title);
  const [contentTex, setContentTex] = useState(currentJournal.contentTex);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Render markdown-like bullets + math with KaTeX
  const renderJournalHtml = (tex: string) => {
    // Replace display math $$...$$
    let formatted = tex.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-3 text-center">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch (e) {
        return `<div>${math}</div>`;
      }
    });

    // Replace inline math $...$
    formatted = formatted.replace(/\$([^\$\n]+)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return math;
      }
    });

    // Convert bullet points
    formatted = formatted.replace(/^• (.+)$/gm, '<li class="my-1.5 list-disc ml-5">$1</li>');
    formatted = formatted.replace(/^- (.+)$/gm, '<li class="my-1 list-circle ml-8">$1</li>');

    return formatted;
  };

  const allTags = ['Literature', 'Ideas', 'Personal Log', 'Experiments'];

  return (
    <div className="flex-1 h-full flex bg-[#0e0d0b] text-[#f4f2ec] overflow-hidden select-none">
      {/* Left Journal Sidebar: Calendar & Date Log */}
      <aside className="w-72 border-r border-[var(--border-color-subtle)] bg-[var(--bg-secondary)] flex flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-serif text-sm font-semibold tracking-wide uppercase text-[var(--accent-primary)]">
              LocTex Journal
            </span>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onSelectDate(today);
              }}
              className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Today"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Calendar Heatmap Placeholder */}
          <div className="bg-[var(--bg-surface)]/60 rounded-xl p-3 border border-[var(--border-color-subtle)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
              <span>October 2026</span>
              <div className="flex gap-1 text-[10px]">
                <button className="px-1 hover:text-[var(--accent-primary)]">&lt;</button>
                <button className="px-1 hover:text-[var(--accent-primary)]">&gt;</button>
              </div>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--text-muted)] pt-1">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>

              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isSelected = day === 7;
                return (
                  <button
                    key={day}
                    onClick={() => onSelectDate(`2026-10-${day < 10 ? '0' + day : day}`)}
                    className={`h-6 rounded flex items-center justify-center font-mono transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent-primary)] text-black font-bold shadow-sm'
                        : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Past Entries List */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium px-1">
              Recent Logs
            </div>

            <div
              onClick={() => onSelectDate('2026-10-07')}
              className="p-2.5 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-color)] cursor-pointer text-xs space-y-1"
            >
              <div className="font-medium text-[var(--accent-primary)]">Oct 7: Quantum field notes</div>
              <div className="text-[11px] text-[var(--text-muted)] line-clamp-1">Path integrals and $S[\phi]$ constraints...</div>
            </div>

            <div
              onClick={() => onSelectDate('2026-10-06')}
              className="p-2.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color-subtle)] cursor-pointer text-xs space-y-1"
            >
              <div className="font-medium text-[var(--text-primary)]">Oct 6: Entanglement geometry</div>
              <div className="text-[11px] text-[var(--text-muted)] line-clamp-1">Holographic Ryu-Takayanagi notes...</div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium px-1 flex items-center justify-between">
              <span>Tags</span>
              <Tag className="w-3 h-3" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                    activeTagFilter === tag
                      ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Snapshot scrubber hint */}
        <div className="pt-3 border-t border-[var(--border-color-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Auto-synced
          </span>
          <span>100% Offline</span>
        </div>
      </aside>

      {/* Main Journal Canvas (Warm Minimalist Single-Column) */}
      <main className="flex-1 h-full overflow-y-auto bg-[#fdfbf7] text-[#1c1917] p-12 flex justify-center font-serif">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1c1917]">October 7, 2026</h1>
              <div className="text-xs text-[#78716c] mt-1 italic">Last edited 10:45 AM • Local Workspace</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-lg border border-[#d6d3d1] text-xs font-sans hover:bg-[#f4efe6] text-[#44403c] transition-colors"
              >
                {isEditing ? 'Preview Layout' : 'Edit Text'}
              </button>
              <button
                onClick={() => onSaveJournal(activeDate, title, contentTex, currentJournal.tags)}
                className="px-3 py-1.5 rounded-lg bg-[#92400e] text-white text-xs font-sans font-medium hover:bg-[#78350f] transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Entry
              </button>
            </div>
          </div>

          {/* Journal Body */}
          {isEditing ? (
            <textarea
              value={contentTex}
              onChange={(e) => setContentTex(e.target.value)}
              rows={16}
              className="w-full bg-white border border-[#d6d3d1] rounded-xl p-4 font-mono text-sm leading-relaxed text-[#1c1917] focus:outline-none focus:border-[#92400e]"
            />
          ) : (
            <div
              className="text-base leading-relaxed text-[#292524] space-y-4"
              dangerouslySetInnerHTML={{ __html: renderJournalHtml(contentTex) }}
            />
          )}
        </div>
      </main>
    </div>
  );
};
