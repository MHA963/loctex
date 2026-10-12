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
    if (fileName.endsWith('.tex')) return <FileText className="w-3.5 h-3.5 text-[#d4af37]" />;
    if (fileName.endsWith('.bib')) return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    return <FileText className="w-3.5 h-3.5 text-[#78746c]" />;
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
              className="flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-[#1a1916] text-xs text-[#a8a49c] hover:text-[#f4f2ec] cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <ChevronDown className={`w-3 h-3 text-[#78746c] transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                <Folder className="w-3.5 h-3.5 text-[#78746c]" />
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
              ? 'bg-[#262420] text-[#f4f2ec] font-medium shadow-sm border-l-2 border-[#d4af37]'
              : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
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
              className="p-0.5 hover:text-[#d4af37] text-[#78746c]"
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
              className="p-0.5 hover:text-rose-400 text-[#78746c]"
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
    <aside className="w-60 bg-[#12110f] border-r border-[#24221e] flex flex-col justify-between select-none h-full z-20 text-[#a8a49c] font-sans">
      {/* Top Header: All Projects Dashboard Button + New File */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-[#24221e]/60">
        <button
          onClick={onOpenDashboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1e1d1a] hover:bg-[#2a2824] text-[11px] text-[#f4f2ec] font-medium border border-[#33302a] transition-colors"
          title="Return to Projects Dashboard"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>All Projects</span>
        </button>

        <button
          onClick={onNewFile}
          className="flex items-center gap-1 p-1 rounded-md hover:bg-[#1e1d1a] text-[#8c887e] hover:text-[#f4f2ec] transition-colors text-[11px]"
          title="New File in Project"
        >
          <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>New</span>
        </button>
      </div>

      {/* Main File Tree */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        <div className="space-y-1">
          {/* Active Project Root */}
          <div className="flex items-center gap-1.5 py-1 text-xs font-semibold text-[#f4f2ec] truncate">
            <Folder className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="truncate">{activeProject?.name || 'My Research'}</span>
          </div>

          {/* Dynamic Real File Tree */}
          <div className="space-y-0.5 pt-1">
            {files.length === 0 ? (
              <div className="text-[11px] text-[#78746c] italic py-2 pl-2">No files found</div>
            ) : (
              renderTree(files)
            )}
          </div>
        </div>

        {/* History Timeline */}
        <div className="pt-3 border-t border-[#24221e]/80">
          <div className="text-[11px] font-medium text-[#f4f2ec] mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#78746c]" />
            <span>History Timeline</span>
          </div>

          <div className="pl-1 relative space-y-2 text-xs">
            <div className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-[#33302a]" />

            {snapshots.length === 0 ? (
              <div className="text-[11px] text-[#78746c] italic pl-3">Auto-records on compile</div>
            ) : (
              snapshots.map((snap, i) => (
                <div
                  key={snap.id}
                  onClick={() => onSelectSnapshot(snap)}
                  className="flex items-center gap-2.5 relative z-10 cursor-pointer group"
                >
                  <span
                    className={`w-2 h-2 rounded-full border border-[#12110f] ${
                      i === 0 ? 'bg-[#f4f2ec]' : 'bg-[#78746c] group-hover:bg-[#f4f2ec]'
                    }`}
                  />
                  <span className="text-[#a8a49c] group-hover:text-[#f4f2ec] text-[11px] truncate">
                    {snap.versionTag}: {snap.summary}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions: [ Import ZIP ] [ Export Menu ] */}
      <div className="p-3 border-t border-[#24221e] grid grid-cols-2 gap-2 bg-[#12110f] relative" ref={exportMenuRef}>
        <button
          onClick={onImportZip}
          className="px-3 py-1.5 rounded-lg bg-[#24221e] hover:bg-[#33302a] text-[#f4f2ec] text-xs font-medium transition-colors text-center border border-[#33302a]/60 shadow-sm"
        >
          Import ZIP
        </button>

        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-center border shadow-sm flex items-center justify-center gap-1.5 ${
              isExportMenuOpen
                ? 'bg-[#33302a] text-[#d4af37] border-[#d4af37]/60 shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                : 'bg-[#24221e] hover:bg-[#33302a] text-[#f4f2ec] border-[#33302a]/60'
            }`}
          >
            <span>Export</span>
            <ChevronUp className={`w-3 h-3 text-[#a8a49c] transition-transform duration-150 ${isExportMenuOpen ? 'rotate-180 text-[#d4af37]' : ''}`} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute bottom-full mb-2 right-0 w-52 bg-[#181714] border border-[#38352d] rounded-xl shadow-2xl overflow-hidden z-50 p-1 space-y-0.5">
              <div className="px-2.5 py-1.5 border-b border-[#24221e] text-[10px] font-semibold text-[#8c887e] uppercase tracking-wider flex items-center justify-between">
                <span>Export Project</span>
                <Download className="w-3 h-3 text-[#d4af37]" />
              </div>

              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onExportPdf();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[#24221e] text-xs text-[#f4f2ec] transition-colors rounded-lg group"
              >
                <div className="p-1 rounded bg-[#24221e] group-hover:bg-[#2e2c26] text-[#d4af37]">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[11px] text-[#f4f2ec] group-hover:text-[#d4af37]">Export as PDF</div>
                  <div className="text-[10px] text-[#78746c]">Compiled document (.pdf)</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onExportZip();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[#24221e] text-xs text-[#f4f2ec] transition-colors rounded-lg group"
              >
                <div className="p-1 rounded bg-[#24221e] group-hover:bg-[#2e2c26] text-blue-400">
                  <Archive className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[11px] text-[#f4f2ec] group-hover:text-blue-400">Export as ZIP</div>
                  <div className="text-[10px] text-[#78746c]">Full project archive (.zip)</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
