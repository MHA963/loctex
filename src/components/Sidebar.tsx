import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FileText,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileCode,
  Image as ImageIcon,
  LayoutGrid,
  FilePlus,
  FolderPlus,
  Download,
  Archive,
} from 'lucide-react';
import { FileItem, Project, VersionSnapshot } from '../types/index.ts';

interface SidebarProps {
  activeProject: Project | null;
  onOpenDashboard: () => void;
  files: FileItem[];
  activeFile: string;
  onSelectFile: (filePath: string) => void;
  snapshots: VersionSnapshot[];
  onSelectSnapshot: (snap: VersionSnapshot) => void;
  onImportZip: () => void;
  onExportZip: () => void;
  onExportPdf: () => void;
  onNewFile: () => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (path: string, newName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeProject,
  onOpenDashboard,
  files,
  activeFile,
  onSelectFile,
  snapshots,
  onSelectSnapshot,
  onImportZip,
  onExportZip,
  onExportPdf,
  onNewFile,
  onDeleteFile,
  onRenameFile,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ Figures: true, Chapters: true });
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.tex')) return <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />;
    if (lower.endsWith('.bib')) return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    if (lower.endsWith('.svg')) return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.endsWith('.pdf')) return <FileText className="w-3.5 h-3.5 text-rose-400" />;
    if (/\.(png|jpg|jpeg|gif|webp|ico|bmp)$/.test(lower)) {
      return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />;
  };

  const renderTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const isSelected = activeFile === item.path;

      if (item.isDirectory) {
        const isExpanded = expandedFolders[item.path] ?? true;
        return (
          <div key={item.path} className="select-none">
            <div
              onClick={() => toggleFolder(item.path)}
              style={{ paddingLeft: `${depth * 10 + 6}px` }}
              className="flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                <Folder className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="truncate">{item.name}</span>
              </div>
            </div>
            {isExpanded && item.children && renderTree(item.children, depth + 1)}
          </div>
        );
      }

      return (
        <div
          key={item.path}
          onClick={() => onSelectFile(item.path)}
          style={{ paddingLeft: `${depth * 10 + 16}px` }}
          className={`flex items-center justify-between py-1 px-2 rounded-md text-xs cursor-pointer group transition-colors ${
            isSelected
              ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium shadow-sm border-l-2 border-[var(--accent-primary)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {getFileIcon(item.name)}
            <span className="truncate">{item.name}</span>
            {item.name.endsWith('.bib') && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)] inline-block" />
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newName = prompt('Enter new filename:', item.name);
                if (newName && newName !== item.name) {
                  onRenameFile(item.path, newName);
                }
              }}
              className="p-0.5 hover:text-[var(--accent-primary)] text-[var(--text-muted)]"
              title="Rename"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete '${item.name}'?`)) {
                  onDeleteFile(item.path);
                }
              }}
              className="p-0.5 hover:text-rose-400 text-[var(--text-muted)]"
              title="Delete"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <aside className="w-60 bg-[var(--bg-secondary)] border-r border-[var(--border-color-subtle)] flex flex-col justify-between select-none h-full z-20 text-[var(--text-secondary)] font-sans">
      {/* Top Header: All Projects Dashboard Button + New File */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-[var(--border-color-subtle)]">
        <button
          onClick={onOpenDashboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[11px] text-[var(--text-primary)] font-medium border border-[var(--border-color)] transition-colors shadow-sm"
          title="Return to Projects Dashboard"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>All Projects</span>
        </button>

        <button
          onClick={onNewFile}
          className="flex items-center gap-1 p-1 rounded-md hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-[11px]"
          title="New File in Project"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>New</span>
        </button>
      </div>

      {/* Main File Tree */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        <div className="space-y-1">
          {/* Active Project Root */}
          <div className="flex items-center gap-1.5 py-1 text-xs font-semibold text-[var(--text-primary)] truncate">
            <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="truncate">{activeProject?.name || 'My Research'}</span>
          </div>

          {/* Dynamic Real File Tree */}
          <div className="space-y-0.5 pt-1">
            {files.length === 0 ? (
              <div className="text-[11px] text-[var(--text-muted)] italic py-2 pl-2">No files found</div>
            ) : (
              renderTree(files)
            )}
          </div>
        </div>

        {/* History Timeline */}
        <div className="pt-3 border-t border-[var(--border-color-subtle)]">
          <div className="text-[11px] font-medium text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
            <span>History Timeline</span>
          </div>

          <div className="pl-1 relative space-y-2 text-xs">
            <div className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-[var(--border-color-subtle)]" />

            {snapshots.length === 0 ? (
              <div className="text-[11px] text-[var(--text-muted)] italic pl-3">Auto-records on compile</div>
            ) : (
              snapshots.map((snap, i) => (
                <div
                  key={snap.id}
                  onClick={() => onSelectSnapshot(snap)}
                  className="flex items-center gap-2.5 relative z-10 cursor-pointer group"
                >
                  <span
                    className={`w-2 h-2 rounded-full border border-[var(--bg-secondary)] ${
                      i === 0 ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-muted)] group-hover:bg-[var(--text-primary)]'
                    }`}
                  />
                  <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] text-[11px] truncate">
                    {snap.versionTag}: {snap.summary}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions: [ Import ZIP ] [ Export Menu ] */}
      <div className="p-3 border-t border-[var(--border-color-subtle)] grid grid-cols-2 gap-2 bg-[var(--bg-secondary)] relative" ref={exportMenuRef}>
        <button
          onClick={onImportZip}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors text-center border border-[var(--border-color)] shadow-sm"
        >
          Import ZIP
        </button>

        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-center border shadow-sm flex items-center justify-center gap-1.5 ${
              isExportMenuOpen
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-primary)] border-[var(--accent-primary)]/60 shadow-[0_0_8px_var(--accent-glow)]'
                : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border-[var(--border-color)]'
            }`}
          >
            <span>Export</span>
            <ChevronUp className={`w-3 h-3 text-[var(--text-secondary)] transition-transform duration-150 ${isExportMenuOpen ? 'rotate-180 text-[var(--accent-primary)]' : ''}`} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute bottom-full mb-2 right-0 w-52 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50 p-1 space-y-0.5">
              <div className="px-2.5 py-1.5 border-b border-[var(--border-color-subtle)] text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                <span>Export Project</span>
                <Download className="w-3 h-3 text-[var(--accent-primary)]" />
              </div>

              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onExportPdf();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] transition-colors rounded-lg group"
              >
                <div className="p-1 rounded bg-[var(--bg-secondary)] group-hover:bg-[var(--bg-surface)] text-[var(--accent-primary)]">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[11px] text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">Export as PDF</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Compiled document (.pdf)</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onExportZip();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] transition-colors rounded-lg group"
              >
                <div className="p-1 rounded bg-[var(--bg-secondary)] group-hover:bg-[var(--bg-surface)] text-blue-400">
                  <Archive className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[11px] text-[var(--text-primary)] group-hover:text-blue-400">Export as ZIP</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Full project archive (.zip)</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
