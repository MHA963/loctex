import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Clock,
  UploadCloud,
  Download,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  FileCode,
  Image,
  ArrowUpDown,
} from 'lucide-react';
import { FileItem, Project, VersionSnapshot } from '../types/index.ts';

interface SidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string) => void;
  files: FileItem[];
  activeFile: string;
  onSelectFile: (filePath: string) => void;
  snapshots: VersionSnapshot[];
  onSelectSnapshot: (snap: VersionSnapshot) => void;
  onImportZip: () => void;
  onExportZip: () => void;
  onExportPdf: () => void;
  onNewFile: () => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (path: string, newName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  files,
  activeFile,
  onSelectFile,
  snapshots,
  onSelectSnapshot,
  onImportZip,
  onExportZip,
  onExportPdf,
  onNewFile,
  onNewProject,
  onDeleteProject,
  onRenameProject,
  onDeleteFile,
  onRenameFile,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'name' | 'date'>('name');
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ Figures: true, Chapters: true });

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tex')) return <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />;
    if (fileName.endsWith('.bib')) return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    if (fileName.match(/\.(png|jpg|jpeg|svg|pdf)$/i)) return <Image className="w-3.5 h-3.5 text-amber-400" />;
    return <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />;
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const isSelected = activeFile === item.path;
      if (item.isDirectory) {
        const isExpanded = expandedFolders[item.path] ?? true;
        return (
          <div key={item.path} className="select-none">
            <div
              onClick={() => toggleFolder(item.path)}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                {isExpanded ? <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />}
                <Folder className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                <span className="truncate">{item.name}</span>
              </div>
            </div>
            {isExpanded && item.children && renderFileTree(item.children, depth + 1)}
          </div>
        );
      }

      return (
        <div
          key={item.path}
          onClick={() => onSelectFile(item.path)}
          style={{ paddingLeft: `${depth * 12 + 16}px` }}
          className={`flex items-center justify-between py-1 px-2 rounded-md text-xs cursor-pointer group transition-colors ${
            isSelected
              ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-primary)] font-medium border-l-2 border-[var(--accent-primary)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {getFileIcon(item.name)}
            <span className="truncate">{item.name}</span>
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
              title="Rename File"
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
              title="Delete File"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color-subtle)] flex flex-col justify-between select-none h-full z-20">
      {/* Top Project Selector */}
      <div className="p-3 border-b border-[var(--border-color-subtle)]">
        <div className="relative">
          <button
            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded-lg border border-[var(--border-color-subtle)] text-xs text-[var(--text-primary)] font-medium transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              <span className="truncate">{activeProject?.name || 'Select Project'}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
          </button>

          {projectMenuOpen && (
            <div className="absolute top-full mt-1 left-0 w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-2xl py-1 z-50 max-h-60 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                <span>Projects</span>
                <button
                  onClick={() => {
                    onNewProject();
                    setProjectMenuOpen(false);
                  }}
                  className="hover:text-[var(--accent-primary)] flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    setProjectMenuOpen(false);
                  }}
                  className={`px-2.5 py-1.5 text-xs hover:bg-[var(--bg-surface-hover)] cursor-pointer flex items-center justify-between group ${
                    activeProject?.id === p.id ? 'text-[var(--accent-primary)] font-medium' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {renamingProjectId === p.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onRenameProject(p.id, renameValue);
                          setRenamingProjectId(null);
                        } else if (e.key === 'Escape') {
                          setRenamingProjectId(null);
                        }
                      }}
                      className="bg-[var(--bg-primary)] px-1 rounded text-xs w-full text-[var(--text-primary)]"
                    />
                  ) : (
                    <span className="truncate">{p.name}</span>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingProjectId(p.id);
                        setRenameValue(p.name);
                      }}
                      className="p-1 hover:text-[var(--accent-primary)] text-[var(--text-muted)]"
                      title="Rename"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project '${p.name}'?`)) {
                          onDeleteProject(p.id);
                        }
                      }}
                      className="p-1 hover:text-rose-400 text-[var(--text-muted)]"
                      title="Delete"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Section: Files Tree & Snapshots */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Project Files Header */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            <span>Files</span>
            <button
              onClick={onNewFile}
              className="p-1 rounded hover:bg-[var(--bg-surface)] hover:text-[var(--accent-primary)] transition-colors"
              title="New File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-1 space-y-0.5">{renderFileTree(sortedFiles)}</div>
        </div>

        {/* History Timeline */}
        <div className="pt-2 border-t border-[var(--border-color-subtle)]">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> History Timeline
            </span>
          </div>

          <div className="mt-1.5 space-y-1.5 px-2">
            {snapshots.length === 0 ? (
              <div className="text-[11px] text-[var(--text-muted)] italic py-1">No snapshots recorded yet</div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  onClick={() => onSelectSnapshot(snap)}
                  className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] cursor-pointer group py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)] group-hover:bg-[var(--accent-primary)] transition-colors" />
                  <span className="font-mono text-[11px] text-[var(--text-primary)]">{snap.versionTag}</span>
                  <span className="text-[11px] text-[var(--text-muted)] truncate">{snap.summary}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar: Import ZIP & Export Project */}
      <div className="p-3 border-t border-[var(--border-color-subtle)] bg-[var(--bg-primary)]/60 space-y-2">
        <button
          onClick={onImportZip}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color-subtle)] hover:border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium transition-all shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          Import ZIP
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onExportZip}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Download className="w-3 h-3" />
            ZIP Export
          </button>
          <button
            onClick={onExportPdf}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary)]/80 text-black font-semibold text-[11px] hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download className="w-3 h-3" />
            PDF Export
          </button>
        </div>
      </div>
    </aside>
  );
};
