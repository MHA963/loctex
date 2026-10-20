import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FileText,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  FileCode,
  Image as ImageIcon,
  LayoutGrid,
  Download,
  Archive,
  Upload,
  Check,
  X,
} from 'lucide-react';
import { FileItem, Project, VersionSnapshot } from '../types/index.ts';

export function normalizeNewFileName(rawName: string, kind: 'tex' | 'bib'): string {
  const trimmed = rawName.trim().replace(/\\/g, '/').replace(/^\/+/, '');
  if (!trimmed) {
    return kind === 'tex' ? 'section.tex' : 'references.bib';
  }
  const expectedExt = `.${kind}`;
  if (trimmed.toLowerCase().endsWith(expectedExt)) {
    return trimmed;
  }
  return `${trimmed}${expectedExt}`;
}

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
  onNewFile?: () => void;
  onCreateFile?: (fileName: string, kind: 'tex' | 'bib') => Promise<void> | void;
  onUploadAsset?: (fileName: string, base64Data: string) => Promise<void> | void;
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
  onCreateFile,
  onUploadAsset,
  onDeleteFile,
  onRenameFile,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    figures: true,
    Figures: true,
    Chapters: true,
  });
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [composerKind, setComposerKind] = useState<'tex' | 'bib' | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    if (isExportMenuOpen || isNewMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen, isNewMenuOpen]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const openFileComposer = (kind: 'tex' | 'bib') => {
    setIsNewMenuOpen(false);
    setComposerKind(kind);
    setComposerValue(kind === 'tex' ? 'section.tex' : 'references.bib');
  };

  const handleConfirmComposer = async () => {
    if (!composerKind) return;
    const finalName = normalizeNewFileName(composerValue, composerKind);
    setComposerKind(null);
    setComposerValue('');
    if (onCreateFile) {
      await onCreateFile(finalName, composerKind);
    } else if (onNewFile) {
      onNewFile();
    }
  };

  const handleTriggerUploadPicker = () => {
    setIsNewMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0 || !onUploadAsset) return;

    for (const file of Array.from(selectedFiles)) {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          resolve(result);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      await onUploadAsset(file.name, base64Data);
    }

    e.target.value = '';
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

      if (renamingPath === item.path) {
        return (
          <div
            key={item.path}
            style={{ paddingLeft: `${depth * 10 + 12}px` }}
            className="flex items-center gap-1 py-1 px-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--accent-primary)]/40"
          >
            <input
              type="text"
              value={renameValue}
              autoFocus
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && renameValue.trim()) {
                  onRenameFile(item.path, renameValue.trim());
                  setRenamingPath(null);
                } else if (e.key === 'Escape') {
                  setRenamingPath(null);
                }
              }}
              className="flex-1 min-w-0 bg-transparent text-[11px] font-mono text-[var(--text-primary)] focus:outline-none"
            />
            <button
              onClick={() => {
                if (renameValue.trim()) {
                  onRenameFile(item.path, renameValue.trim());
                }
                setRenamingPath(null);
              }}
              className="p-0.5 text-emerald-400 hover:text-emerald-300 cursor-pointer"
              title="Save filename"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setRenamingPath(null)}
              className="p-0.5 text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
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
                setRenamingPath(item.path);
                setRenameValue(item.name);
              }}
              className="p-0.5 hover:text-[var(--accent-primary)] text-[var(--text-muted)]"
              title="Rename"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(item.path);
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
      {/* Hidden Multi-File Upload Input for Images, SVGs, and PDFs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.pdf,.ico,.bmp"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Top Header: All Projects Dashboard Button + "+ New" Dropdown Menu */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-[var(--border-color-subtle)] relative" ref={newMenuRef}>
        <button
          onClick={onOpenDashboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[11px] text-[var(--text-primary)] font-medium border border-[var(--border-color)] transition-colors shadow-sm cursor-pointer"
          title="Return to Projects Dashboard"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>All Projects</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNewMenuOpen((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-colors text-[11px] cursor-pointer ${
              isNewMenuOpen
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent-primary)] border-[var(--accent-primary)]/50'
                : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color-subtle)]'
            }`}
            title="Create new .tex, .bib, or upload image"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>New</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isNewMenuOpen ? 'rotate-180 text-[var(--accent-primary)]' : ''}`} />
          </button>

          {isNewMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50 p-1 space-y-0.5">
              <div className="px-2.5 py-1 border-b border-[var(--border-color-subtle)] text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Add to Project
              </div>

              <button
                onClick={() => openFileComposer('tex')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] transition-colors rounded-lg group cursor-pointer"
              >
                <div className="p-1 rounded bg-[var(--bg-secondary)] text-[var(--accent-primary)]">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[11px] group-hover:text-[var(--accent-primary)]">New .tex File</div>
                  <div className="text-[9px] text-[var(--text-muted)]">LaTeX chapter or section</div>
                </div>
              </button>

              <button
                onClick={() => openFileComposer('bib')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] transition-colors rounded-lg group cursor-pointer"
              >
                <div className="p-1 rounded bg-[var(--bg-secondary)] text-blue-400">
                  <FileCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[11px] group-hover:text-blue-400">New .bib File</div>
                  <div className="text-[9px] text-[var(--text-muted)]">BibTeX bibliography</div>
                </div>
              </button>

              <button
                onClick={handleTriggerUploadPicker}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] transition-colors rounded-lg group cursor-pointer"
              >
                <div className="p-1 rounded bg-[var(--bg-secondary)] text-emerald-400">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[11px] group-hover:text-emerald-400">Upload Image</div>
                  <div className="text-[9px] text-[var(--text-muted)]">PNG, JPG, SVG, or PDF</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Filename Composer (for New .tex or New .bib) */}
      {composerKind && (
        <div className="px-3 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-color-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
            <span>{composerKind === 'tex' ? 'Create .tex file:' : 'Create .bib file:'}</span>
            <button
              onClick={() => setComposerKind(null)}
              className="text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={composerValue}
              autoFocus
              placeholder={composerKind === 'tex' ? 'chapter1.tex' : 'references.bib'}
              onChange={(e) => setComposerValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmComposer();
                } else if (e.key === 'Escape') {
                  setComposerKind(null);
                }
              }}
              className="flex-1 min-w-0 px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
            <button
              onClick={handleConfirmComposer}
              className="px-2 py-1 rounded bg-[var(--accent-primary)] text-[var(--bg-primary)] font-semibold text-[11px] hover:brightness-110 transition-colors cursor-pointer"
            >
              Create
            </button>
          </div>
        </div>
      )}

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
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors text-center border border-[var(--border-color)] shadow-sm cursor-pointer"
        >
          Import ZIP
        </button>

        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-center border shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
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
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] transition-colors rounded-lg group cursor-pointer"
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
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] transition-colors rounded-lg group cursor-pointer"
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
