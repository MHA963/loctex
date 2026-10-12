import React, { useState } from 'react';
import { Folder, Plus, UploadCloud, Trash2, Edit2, FileText, Clock, ArrowRight } from 'lucide-react';
import { Project } from '../types/index.ts';
import { GitHubActivityGraph } from './GitHubActivityGraph.tsx';

interface ProjectsDashboardProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onImportZip: () => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onImportZip,
  onDeleteProject,
  onRenameProject,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[var(--bg-primary)] p-10 flex flex-col items-center select-none font-sans">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header Title & Actions */}
        <div className="flex items-center justify-between border-b border-[#24221e] pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f4f2ec] flex items-center gap-2.5">
              <Folder className="w-6 h-6 text-[#d4af37]" />
              Projects Workspace
            </h1>
            <p className="text-xs text-[#8c887e] mt-1">
              Local research papers, journal notebooks, and imported Overleaf packages stored on your machine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onImportZip}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#24221e] hover:bg-[#33302a] text-xs text-[#f4f2ec] font-medium border border-[#3d3a33] transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-[#d4af37]" />
              Import ZIP
            </button>

            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#e5c158] transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Document
            </button>
          </div>
        </div>

        {/* GitHub Contribution Graph & Activities */}
        <GitHubActivityGraph />

        {/* Projects Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-semibold text-[#f4f2ec] flex items-center gap-2">
            <span>Recent LaTeX Documents</span>
            <span className="text-xs text-[#8c887e] font-normal font-mono">({projects.length} local repos)</span>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#33302a] rounded-2xl bg-[#141311] space-y-4">
            <Folder className="w-12 h-12 text-[#525048] mx-auto" />
            <div className="text-sm text-[#f4f2ec] font-medium">No projects created yet</div>
            <p className="text-xs text-[#8c887e] max-w-sm mx-auto">
              Create a new LaTeX document or import an existing ZIP archive from Overleaf or Prism to get started.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onNewProject}
                className="px-4 py-2 rounded-lg bg-[#d4af37] text-black text-xs font-semibold"
              >
                Create Project
              </button>
              <button
                onClick={onImportZip}
                className="px-4 py-2 rounded-lg bg-[#24221e] text-[#f4f2ec] text-xs font-medium border border-[#3d3a33]"
              >
                Import ZIP
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="bg-[#141311] hover:bg-[#1c1b18] border border-[#24221e] hover:border-[#d4af37]/60 rounded-2xl p-5 cursor-pointer flex flex-col justify-between transition-all group shadow-lg hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#24221e] flex items-center justify-center text-[#d4af37] group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(project.id);
                          setRenameValue(project.name);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#2e2c26] text-[#8c887e] hover:text-[#d4af37]"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete project '${project.name}'?`)) {
                            onDeleteProject(project.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#2e2c26] text-[#8c887e] hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {renamingId === project.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onRenameProject(project.id, renameValue);
                          setRenamingId(null);
                        } else if (e.key === 'Escape') {
                          setRenamingId(null);
                        }
                      }}
                      className="w-full bg-[#0e0d0b] border border-[#d4af37] rounded-lg px-2 py-1 text-sm font-semibold text-[#f4f2ec] focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-base font-semibold text-[#f4f2ec] group-hover:text-[#d4af37] transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                  )}

                  <div className="text-xs text-[#8c887e] flex items-center gap-1 font-mono">
                    <span>Active file:</span>
                    <span className="text-[#c7c3b8]">{project.active_file || 'main.tex'}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#24221e]/80 flex items-center justify-between text-[11px] text-[#78746c]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(project.updated_at || project.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#d4af37] font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
