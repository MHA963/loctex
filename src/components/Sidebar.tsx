import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  FileCode,
  ArrowUpDown,
  Sidebar as SidebarIcon,
  Bell,
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
  const [folderExpanded, setFolderExpanded] = useState(true);
  const [figuresExpanded, setFiguresExpanded] = useState(false);

  return (
    <aside className="w-60 bg-[#12110f] border-r border-[#24221e] flex flex-col justify-between select-none h-full z-20 text-[#a8a49c] font-sans">
      {/* Top Header Icons (Layout toggle, notifications, new file) */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-[#24221e]/60">
        <button className="p-1 rounded hover:bg-[#1e1d1a] text-[#8c887e] hover:text-[#f4f2ec] transition-colors">
          <SidebarIcon className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-[#1e1d1a] text-[#8c887e] hover:text-[#f4f2ec] transition-colors">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNewFile}
            className="p-1 rounded hover:bg-[#1e1d1a] text-[#8c887e] hover:text-[#f4f2ec] transition-colors"
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main File Tree Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Project Tree */}
        <div className="space-y-1">
          {/* Root Project */}
          <div className="flex items-center gap-1.5 py-1 text-xs font-medium text-[#f4f2ec]">
            <Folder className="w-3.5 h-3.5 text-[#8c887e]" />
            <span>{activeProject?.name || 'My Research'}</span>
          </div>

          {/* Subfolder */}
          <div className="pl-3 space-y-0.5">
            <div
              onClick={() => setFolderExpanded(!folderExpanded)}
              className="flex items-center gap-1 py-1 text-xs text-[#a8a49c] hover:text-[#f4f2ec] cursor-pointer"
            >
              <ChevronDown className={`w-3 h-3 text-[#78746c] transition-transform ${folderExpanded ? '' : '-rotate-90'}`} />
              <Folder className="w-3.5 h-3.5 text-[#78746c]" />
              <span>Folder</span>
            </div>

            {folderExpanded && (
              <div className="pl-4 space-y-0.5 text-xs">
                {/* Introduction.tex */}
                <div
                  onClick={() => onSelectFile('Introduction.tex')}
                  className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors ${
                    activeFile === 'Introduction.tex'
                      ? 'bg-[#262420] text-[#f4f2ec] font-medium'
                      : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#78746c]" />
                    <span>Introduction.tex</span>
                  </div>
                </div>

                {/* Literature.tex */}
                <div
                  onClick={() => onSelectFile('Literature.tex')}
                  className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors ${
                    activeFile === 'Literature.tex'
                      ? 'bg-[#262420] text-[#f4f2ec] font-medium'
                      : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#78746c]" />
                    <span>Literature.tex</span>
                  </div>
                </div>

                {/* Methodology.tex (Active as shown in mockup) */}
                <div
                  onClick={() => onSelectFile('Methodology.tex')}
                  className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer group transition-colors ${
                    activeFile === 'Methodology.tex' || activeFile === 'main.tex'
                      ? 'bg-[#262420] text-[#f4f2ec] font-medium shadow-sm'
                      : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Methodology.tex</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-2.5 h-2.5 text-[#8c887e] hover:text-[#d4af37]" />
                    <ArrowUpDown className="w-2.5 h-2.5 text-[#8c887e] hover:text-[#d4af37]" />
                    <Trash2 className="w-2.5 h-2.5 text-[#8c887e] hover:text-rose-400" />
                  </div>
                </div>

                {/* Results.tex */}
                <div
                  onClick={() => onSelectFile('Results.tex')}
                  className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors ${
                    activeFile === 'Results.tex'
                      ? 'bg-[#262420] text-[#f4f2ec] font-medium'
                      : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#78746c]" />
                    <span>Results.tex</span>
                  </div>
                </div>

                {/* Discussion.tex */}
                <div
                  onClick={() => onSelectFile('Discussion.tex')}
                  className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors ${
                    activeFile === 'Discussion.tex'
                      ? 'bg-[#262420] text-[#f4f2ec] font-medium'
                      : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#78746c]" />
                    <span>Discussion.tex</span>
                  </div>
                </div>

                {/* Appendix.tex */}
                <div
                  onClick={() => onSelectFile('Appendix.tex')}
                  className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors ${
                    activeFile === 'Appendix.tex'
                      ? 'bg-[#262420] text-[#f4f2ec] font-medium'
                      : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#78746c]" />
                    <span>Appendix.tex</span>
                  </div>
                </div>

                {/* Bibliography.bib (with blue dot indicator) */}
                <div
                  onClick={() => onSelectFile('Bibliography.bib')}
                  className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors ${
                    activeFile === 'Bibliography.bib'
                      ? 'bg-[#262420] text-[#f4f2ec] font-medium'
                      : 'text-[#a8a49c] hover:bg-[#1a1916] hover:text-[#f4f2ec]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-[#78746c]" />
                    <span>Bibliography.bib</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)] inline-block" />
                </div>
              </div>
            )}
          </div>

          {/* Figures Accordion */}
          <div
            onClick={() => setFiguresExpanded(!figuresExpanded)}
            className="flex items-center gap-1.5 py-1 text-xs text-[#a8a49c] hover:text-[#f4f2ec] cursor-pointer"
          >
            <ChevronRight className={`w-3 h-3 text-[#78746c] transition-transform ${figuresExpanded ? 'rotate-90' : ''}`} />
            <Folder className="w-3.5 h-3.5 text-[#78746c]" />
            <span>Figures</span>
          </div>
        </div>

        {/* History Timeline (Matching Mockup with vertical connected track) */}
        <div className="pt-3 border-t border-[#24221e]/80">
          <div className="text-[11px] font-medium text-[#f4f2ec] mb-2">History Timeline</div>

          <div className="pl-1 relative space-y-2 text-xs">
            {/* Vertical Timeline Track Line */}
            <div className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-[#33302a]" />

            {/* Version 1.4 */}
            <div className="flex items-center gap-2.5 relative z-10 cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-[#f4f2ec] border border-[#12110f]" />
              <span className="text-[#f4f2ec] font-medium text-[11px]">Version 1.4: Finalized Ch3</span>
            </div>

            {/* v1.3 */}
            <div className="flex items-center gap-2.5 relative z-10 cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-[#78746c] border border-[#12110f] group-hover:bg-[#f4f2ec]" />
              <span className="text-[#a8a49c] group-hover:text-[#f4f2ec] text-[11px]">v1.3: Edited abstract</span>
            </div>

            {/* v1.2 */}
            <div className="flex items-center gap-2.5 relative z-10 cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-[#524f48] border border-[#12110f] group-hover:bg-[#f4f2ec]" />
              <span className="text-[#78746c] group-hover:text-[#f4f2ec] text-[11px]">v1.2</span>
            </div>

            {/* v1.1 */}
            <div className="flex items-center gap-2.5 relative z-10 cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-[#524f48] border border-[#12110f] group-hover:bg-[#f4f2ec]" />
              <span className="text-[#78746c] group-hover:text-[#f4f2ec] text-[11px]">v1.1</span>
            </div>

            {/* v1.0 */}
            <div className="flex items-center gap-2.5 relative z-10 cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-[#524f48] border border-[#12110f] group-hover:bg-[#f4f2ec]" />
              <span className="text-[#78746c] group-hover:text-[#f4f2ec] text-[11px]">v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons: [ Import ZIP ] [ Export ] */}
      <div className="p-3 border-t border-[#24221e] grid grid-cols-2 gap-2 bg-[#12110f]">
        <button
          onClick={onImportZip}
          className="px-3 py-1.5 rounded-lg bg-[#24221e] hover:bg-[#33302a] text-[#f4f2ec] text-xs font-medium transition-colors text-center border border-[#33302a]/60 shadow-sm"
        >
          Import ZIP
        </button>

        <button
          onClick={onExportZip}
          className="px-3 py-1.5 rounded-lg bg-[#24221e] hover:bg-[#33302a] text-[#f4f2ec] text-xs font-medium transition-colors text-center border border-[#33302a]/60 shadow-sm"
        >
          Export
        </button>
      </div>
    </aside>
  );
};
