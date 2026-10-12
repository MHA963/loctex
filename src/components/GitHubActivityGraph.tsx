import React, { useState, useMemo } from 'react';
import { GitCommit, GitPullRequest, GitBranch, CheckCircle2, Flame, Award, Calendar, ExternalLink } from 'lucide-react';

export interface GitHubActivityItem {
  id: string;
  type: 'commit' | 'pull_request' | 'release';
  title: string;
  hash: string;
  branch: string;
  message: string;
  author: string;
  additions: number;
  deletions: number;
  timestamp: string;
  verified: boolean;
}

export const GITHUB_ACTIVITIES_MOCK: GitHubActivityItem[] = [
  {
    id: 'act-1',
    type: 'commit',
    title: 'feat(compiler): intelligent LaTeX diagnostic error parser & automated quick-fix suggestions',
    hash: 'a8f9c12',
    branch: 'main',
    message: 'Add regex word-boundary macro analyzer, missing package auto-injector, and math mode repair suggestions.',
    author: 'LocTex Engine',
    additions: 154,
    deletions: 12,
    timestamp: 'Today, 04:40 AM',
    verified: true,
  },
  {
    id: 'act-2',
    type: 'commit',
    title: 'feat(ui): interactive GitHub contribution graph, activity feed & keyboard shortcuts',
    hash: 'b3e4d91',
    branch: 'main',
    message: 'Implement 52-week contribution heatmap matrix, 5 GitHub activity cards, and Ctrl+Enter hotkey binding.',
    author: 'LocTex Frontend',
    additions: 320,
    deletions: 18,
    timestamp: 'Yesterday, 11:15 PM',
    verified: true,
  },
  {
    id: 'act-3',
    type: 'commit',
    title: 'feat(editor): CodeMirror gutter diagnostic markers & instant hotkeys',
    hash: 'c5d7a88',
    branch: 'main',
    message: 'Wire line numbers with error badges, selection-aware typography formatting, and quick-fix dispatchers.',
    author: 'LocTex Editor',
    additions: 95,
    deletions: 8,
    timestamp: 'Oct 11, 2026',
    verified: true,
  },
  {
    id: 'act-4',
    type: 'pull_request',
    title: 'feat(core): starter templates, export popover, vector PDF sync, and security hardening',
    hash: '0efb086',
    branch: 'main',
    message: 'PR #1: Integrate IEEEtran & Beamer templates, containment path-traversal guards, and SyncTeX coordinate mapper.',
    author: 'MHA963',
    additions: 420,
    deletions: 35,
    timestamp: 'Oct 10, 2026',
    verified: true,
  },
  {
    id: 'act-5',
    type: 'commit',
    title: 'feat(ai-engine): local Ollama & Qwen-Coder offline fast-edit and diagnostics specification',
    hash: '690a461',
    branch: 'main',
    message: 'Author architecture blueprint for streaming diff patches, latency benchmarks, and local model inference.',
    author: 'LocTex Core',
    additions: 210,
    deletions: 14,
    timestamp: 'Oct 9, 2026',
    verified: true,
  },
];

interface GitHubActivityGraphProps {
  onSelectActivity?: (activity: GitHubActivityItem) => void;
}

export const GitHubActivityGraph: React.FC<GitHubActivityGraphProps> = ({ onSelectActivity }) => {
  const [selectedDay, setSelectedDay] = useState<{ date: string; count: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'activities'>('graph');

  // Generate 26 weeks of contribution history (last ~6 months)
  const weeks = useMemo(() => {
    const totalWeeks = 28;
    const daysPerWeek = 7;
    const generated: { date: string; level: number; count: number }[][] = [];

    const now = new Date('2026-10-12T04:00:00');
    // Start totalWeeks ago
    const start = new Date(now);
    start.setDate(start.getDate() - totalWeeks * 7);

    for (let w = 0; w < totalWeeks; w++) {
      const weekDays: { date: string; level: number; count: number }[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + (w * 7 + d));
        const dateStr = currentDate.toISOString().split('T')[0];

        // Pseudo-random realistic distribution with active peaks
        const daySeed = (w * 13 + d * 7 + 19) % 17;
        let count = 0;
        let level = 0;

        if (daySeed > 12) {
          count = daySeed - 8;
          level = 4;
        } else if (daySeed > 8) {
          count = daySeed - 5;
          level = 3;
        } else if (daySeed > 4) {
          count = daySeed - 2;
          level = 2;
        } else if (daySeed > 2) {
          count = 1;
          level = 1;
        }

        // Make today and recent days very active
        if (w === totalWeeks - 1) {
          level = Math.max(level, 3);
          count = Math.max(count, 5);
        }

        weekDays.push({ date: dateStr, level, count });
      }
      generated.push(weekDays);
    }
    return generated;
  }, []);

  // GitHub level color mapper (GitHub Dark Palette)
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-[#0e4429] hover:ring-1 hover:ring-[#26a641]';
      case 2:
        return 'bg-[#006d32] hover:ring-1 hover:ring-[#39d353]';
      case 3:
        return 'bg-[#26a641] hover:ring-1 hover:ring-[#39d353]';
      case 4:
        return 'bg-[#39d353] hover:ring-1 hover:ring-white';
      default:
        return 'bg-[#161b22] hover:bg-[#21262d]';
    }
  };

  const totalContributions = useMemo(() => {
    return weeks.flat().reduce((sum, d) => sum + d.count, 0) + 42;
  }, [weeks]);

  return (
    <div className="w-full bg-[#12110f] border border-[#262420] rounded-2xl p-5 shadow-xl select-none font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#24221e] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1e1d1a] border border-[#33302a] flex items-center justify-center text-[#d4af37]">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#f4f2ec]">GitHub Contribution Activities</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                Active Repository
              </span>
            </div>
            <p className="text-[11px] text-[#8c887e]">
              Continuous integration, compile iterations, snapshots, and version control telemetry.
            </p>
          </div>
        </div>

        {/* View Toggle & Streaks */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-[#181714] px-3 py-1.5 rounded-xl border border-[#2a2824]">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
              <span>14 Day Streak</span>
            </div>
            <span className="text-[#3a3832]">|</span>
            <div className="flex items-center gap-1.5 text-[#a8a49c]">
              <Award className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{totalContributions} Contributions</span>
            </div>
          </div>

          <div className="flex items-center bg-[#181714] rounded-lg border border-[#2a2824] p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'graph' ? 'bg-[#2a2824] text-[#f4f2ec] font-medium shadow-sm' : 'text-[#8c887e] hover:text-[#f4f2ec]'
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'activities' ? 'bg-[#2a2824] text-[#f4f2ec] font-medium shadow-sm' : 'text-[#8c887e] hover:text-[#f4f2ec]'
              }`}
            >
              <span>5 Activities</span>
              <span className="w-4 h-4 rounded-full bg-[#d4af37] text-black text-[9px] font-bold flex items-center justify-center">
                5
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'graph' ? (
        <div className="pt-4 space-y-3">
          {/* Contribution Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[650px] flex gap-1 justify-center sm:justify-start">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <button
                      key={dIdx}
                      onClick={() => setSelectedDay(day)}
                      onMouseEnter={() => setSelectedDay(day)}
                      title={`${day.count} contributions on ${day.date}`}
                      className={`w-3 h-3 rounded-[2.5px] transition-all cursor-pointer ${getLevelColor(
                        day.level
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Legend & Selected Day Info */}
          <div className="flex items-center justify-between text-[11px] text-[#78746c] pt-2 border-t border-[#1c1b18]">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              {selectedDay ? (
                <span className="font-mono text-[#f4f2ec]">
                  <strong className="text-[#39d353]">{selectedDay.count}</strong> contributions on {selectedDay.date}
                </span>
              ) : (
                <span>Hover or click a day cell to inspect contribution density.</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#161b22]" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0e4429]" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#006d32]" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#26a641]" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#39d353]" />
              <span>More</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* 5 GitHub Activities List */}
      <div className={`mt-4 pt-4 border-t border-[#24221e] ${activeTab === 'graph' ? 'block' : 'block'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-[#f4f2ec] flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Latest 5 GitHub Activities</span>
          </div>
          <span className="text-[10px] font-mono text-[#8c887e]">Synced with origin/main</span>
        </div>

        <div className="space-y-2.5">
          {GITHUB_ACTIVITIES_MOCK.map((act) => (
            <div
              key={act.id}
              onClick={() => onSelectActivity?.(act)}
              className="p-3 rounded-xl bg-[#171614] hover:bg-[#1f1d19] border border-[#262420] hover:border-[#d4af37]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#22201b] border border-[#33302a] flex items-center justify-center shrink-0 mt-0.5">
                  {act.type === 'pull_request' ? (
                    <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#f4f2ec] group-hover:text-[#d4af37] transition-colors">
                      {act.title}
                    </span>
                    {act.verified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8c887e] line-clamp-1">{act.message}</p>
                </div>
              </div>

              {/* Badges & Meta */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#24221e] text-[#c7c3b8] border border-[#33302a]">
                  {act.hash}
                </span>
                <span className="text-emerald-400 font-semibold">+{act.additions}</span>
                <span className="text-rose-400 font-semibold">-{act.deletions}</span>
                <span className="text-[#6d6a62]">{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
