import React, { useState } from 'react';
import { Folder, Plus, UploadCloud, Trash2, Edit2, FileText, Clock, ArrowRight } from 'lucide-react';
import { Project } from '../types/index.ts';

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
        <div className="flex items-center justify-between border-b border-[var(--border-color-subtle)] pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
              <Folder className="w-6 h-6 text-[var(--accent-primary)]" />
              Projects Workspace
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Local research papers, journal notebooks, and imported Overleaf packages stored on your machine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onImportZip}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-primary)] font-medium border border-[var(--border-color)] transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-[var(--accent-primary)]" />
              Import ZIP
            </button>

            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-[var(--bg-primary)] font-semibold text-xs transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Document
            </button>
          </div>
        </div>

        {/* Projects Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span>Recent LaTeX Documents</span>
            <span className="text-xs text-[var(--text-muted)] font-normal font-mono">({projects.length} local repos)</span>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-surface)] space-y-4">
            <Folder className="w-12 h-12 text-[var(--text-muted)] mx-auto" />
            <div className="text-sm text-[var(--text-primary)] font-medium">No projects created yet</div>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Create a new LaTeX document or import an existing ZIP archive from Overleaf or Prism to get started.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onNewProject}
                className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-[var(--bg-primary)] text-xs font-semibold"
              >
                Create Project
              </button>
              <button
                onClick={onImportZip}
                className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border-color)]"
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
                className="bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color-subtle)] hover:border-[var(--accent-primary)]/60 rounded-2xl p-5 cursor-pointer flex flex-col justify-between transition-all group shadow-lg hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-primary)] group-hover:scale-105 transition-transform border border-[var(--border-color-subtle)]">
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(project.id);
                          setRenameValue(project.name);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
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
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-rose-400"
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
                      className="w-full bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded-lg px-2 py-1 text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                  )}

                  <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                    <span>Active file:</span>
                    <span className="text-[var(--text-secondary)]">{project.active_file || 'main.tex'}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border-color-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(project.updated_at || project.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[var(--accent-primary)] font-medium group-hover:translate-x-0.5 transition-transform">
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
