import React, { useState, useEffect } from 'react';
import { HeaderPill } from './components/HeaderPill.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { EditorPane } from './components/EditorPane.tsx';
import { PdfCanvas } from './components/PdfCanvas.tsx';
import { DiagnosticDrawer } from './components/DiagnosticDrawer.tsx';
import { DailyJournalView } from './components/DailyJournalView.tsx';
import { ImportZipModal, NewProjectModal } from './components/Modals.tsx';
import {
  CompileStatus,
  DiagnosticError,
  FileItem,
  FontFamily,
  JournalEntry,
  Project,
  SyncTeXBox,
  ThemeName,
  VersionSnapshot,
  WorkspaceMode,
} from './types/index.ts';

export default function App() {
  // Theme & Mode State
  const [theme, setTheme] = useState<ThemeName>('dark-gold');
  const [mode, setMode] = useState<WorkspaceMode>('research-studio');

  // Typography Settings
  const [fontFamily, setFontFamily] = useState<FontFamily>('Serif');
  const [fontSize, setFontSize] = useState('11pt');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);

  // Compilation & Zoom State
  const [compileStatus, setCompileStatus] = useState<CompileStatus>('ready');
  const [zoom, setZoom] = useState(100);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Projects & Files State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState('main.tex');
  const [fileContent, setFileContent] = useState('');
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticError[]>([]);
  const [synctexBoxes, setSynctexBoxes] = useState<SyncTeXBox[]>([]);

  // Journals State
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activeDate, setActiveDate] = useState('2026-10-07');

  // Modals
  const [importZipOpen, setImportZipOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  // Apply theme class to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial mock data & API fetch
  useEffect(() => {
    const defaultProj: Project = {
      id: 'proj-default',
      name: 'Quantum Optics Paper',
      root_path: '/data/projects/quantum_optics',
      active_file: 'main.tex',
      settings: { theme: 'dark-gold', fontFamily: 'Serif', fontSize: '11pt' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProjects([defaultProj]);
    setActiveProject(defaultProj);

    setFiles([
      { name: 'main.tex', path: 'main.tex', isDirectory: false },
      { name: 'introduction.tex', path: 'introduction.tex', isDirectory: false },
      { name: 'methodology.tex', path: 'methodology.tex', isDirectory: false },
      { name: 'results.tex', path: 'results.tex', isDirectory: false },
      { name: 'discussion.tex', path: 'discussion.tex', isDirectory: false },
      { name: 'appendix.tex', path: 'appendix.tex', isDirectory: false },
      { name: 'bibliography.bib', path: 'bibliography.bib', isDirectory: false },
      {
        name: 'Figures',
        path: 'Figures',
        isDirectory: true,
        children: [
          { name: 'flowchart.png', path: 'Figures/flowchart.png', isDirectory: false },
          { name: 'plot.pdf', path: 'Figures/plot.pdf', isDirectory: false },
        ],
      },
    ]);

    setSnapshots([
      { id: 's4', projectId: 'proj-default', versionTag: 'v1.4', summary: 'Finalized Ch3', createdAt: '10 mins ago' },
      { id: 's3', projectId: 'proj-default', versionTag: 'v1.3', summary: 'Edited abstract', createdAt: '2 hours ago' },
      { id: 's2', projectId: 'proj-default', versionTag: 'v1.2', summary: 'Added math equations', createdAt: 'Yesterday' },
      { id: 's1', projectId: 'proj-default', versionTag: 'v1.0', summary: 'Initial setup', createdAt: '2 days ago' },
    ]);

    const defaultCode = `\\documentclass[11pt]{article}
\\usepackage{graphicx}
\\usepackage{amsmath,amssymb}

\\begin{document}

\\title{A Novel Approach to LaTeX Workflows}
\\author{LocTex Research Group}
\\date{October 2026}
\\maketitle

\\begin{abstract}
This paper presents LocTex, an autonomous personal research environment that merges instant local compilation, bidirectional visual PDF text manipulation, and frictionless daily journaling.
\\end{abstract}

\\section{Introduction}
Modern academic authoring has historically suffered from cloud lag, multi-tenant bloat, and rigid split-pane barriers. By coupling the Tectonic incremental compiler with local SyncTeX coordinate mapping, users can directly manipulate their compiled documents visually.

\\section{Methodology}
This section details the approach used to derive the fundamental equation \\eqref{eq:main}.

\\begin{equation}
\\label{eq:main}
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\end{equation}

\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.7\\linewidth]{Figures/flowchart.png}
  \\caption{Bidirectional SyncTeX Architecture}
  \\label{fig:arch}
\\end{figure}

The primary results from this analysis (see Figure 2) demonstrate sub-second updates.

\\end{document}
`;
    setFileContent(defaultCode);
  }, []);

  // Keyboard shortcut for compilation (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        triggerCompile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerCompile = async () => {
    setCompileStatus('compiling');
    setTimeout(() => {
      setCompileStatus('ready');
      setDiagnostics([]);
    }, 450);
  };

  // Direct In-PDF Edit Handler
  const handleDirectPdfEdit = (newText: string, targetLine: number) => {
    const lines = fileContent.split('\n');
    if (targetLine <= lines.length) {
      // Update line in editor
      lines[targetLine - 1] = newText;
      setFileContent(lines.join('\n'));
      triggerCompile();
    }
  };

  // Semantic Block Reorder Handler
  const handleBlockReorder = (sourceId: string, targetId: string) => {
    // Reorder AST blocks and recompile
    triggerCompile();
  };

  // File selection
  const handleSelectFile = (path: string) => {
    setActiveFile(path);
  };

  // Export PDF
  const handleExportPdf = () => {
    if (activeProject) {
      window.open(`/api/projects/${activeProject.id}/export-pdf`, '_blank');
    }
  };

  // Export ZIP
  const handleExportZip = () => {
    if (activeProject) {
      window.open(`/api/projects/${activeProject.id}/export-zip`, '_blank');
    }
  };

  // Import ZIP
  const handleImportZip = async (projectName: string, base64Zip: string) => {
    try {
      const res = await fetch('/api/projects/import-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, base64Zip }),
      });
      const data = await res.json();
      if (data.id) {
        const newProj: Project = {
          id: data.id,
          name: data.name,
          root_path: data.root_path,
          active_file: data.mainFile || 'main.tex',
          settings: { theme, fontFamily, fontSize },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProjects((prev) => [newProj, ...prev]);
        setActiveProject(newProj);
        setActiveFile(data.mainFile || 'main.tex');
        triggerCompile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Topbar / Floating Header Pill */}
      <HeaderPill
        compileStatus={compileStatus}
        zoom={zoom}
        onZoomChange={setZoom}
        onCompile={triggerCompile}
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        isBold={isBold}
        onToggleBold={() => setIsBold(!isBold)}
        isItalic={isItalic}
        onToggleItalic={() => setIsItalic(!isItalic)}
        isUnderline={isUnderline}
        onToggleUnderline={() => setIsUnderline(!isUnderline)}
        isCode={isCode}
        onToggleCode={() => setIsCode(!isCode)}
        theme={theme}
        onThemeChange={setTheme}
        mode={mode}
        onModeChange={setMode}
      />

      {/* Main Workspace Area */}
      {mode === 'daily-journal' ? (
        <DailyJournalView
          journals={journals}
          activeDate={activeDate}
          onSelectDate={setActiveDate}
          onSaveJournal={(dateStr, title, contentTex, tags) => {
            const entry: JournalEntry = {
              id: `jour-${dateStr}`,
              dateStr,
              title,
              contentTex,
              tags,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setJournals((prev) => [entry, ...prev.filter((j) => j.dateStr !== dateStr)]);
          }}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left File Tree & Snapshot Sidebar */}
          <Sidebar
            projects={projects}
            activeProject={activeProject}
            onSelectProject={(id) => {
              const p = projects.find((proj) => proj.id === id);
              if (p) setActiveProject(p);
            }}
            files={files}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            snapshots={snapshots}
            onSelectSnapshot={(snap) => {
              alert(`Restoring snapshot: ${snap.versionTag} (${snap.summary})`);
            }}
            onImportZip={() => setImportZipOpen(true)}
            onExportZip={handleExportZip}
            onExportPdf={handleExportPdf}
            onNewFile={() => {
              const name = prompt('Enter new filename (e.g. results.tex):');
              if (name) {
                setFiles((prev) => [...prev, { name, path: name, isDirectory: false }]);
              }
            }}
            onNewProject={() => setNewProjectOpen(true)}
            onDeleteProject={(id) => {
              setProjects((prev) => prev.filter((p) => p.id !== id));
              if (activeProject?.id === id && projects.length > 1) {
                setActiveProject(projects.find((p) => p.id !== id) || null);
              }
            }}
            onRenameProject={(id, newName) => {
              setProjects((prev) =>
                prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
              );
              if (activeProject?.id === id) {
                setActiveProject((prev) => (prev ? { ...prev, name: newName } : null));
              }
            }}
            onDeleteFile={(filePath) => {
              setFiles((prev) => prev.filter((f) => f.path !== filePath));
            }}
            onRenameFile={(filePath, newName) => {
              setFiles((prev) =>
                prev.map((f) => (f.path === filePath ? { ...f, name: newName, path: newName } : f))
              );
            }}
          />

          {/* Center LaTeX Editor Pane */}
          <EditorPane
            content={fileContent}
            onChange={setFileContent}
            diagnostics={diagnostics}
            activeLine={activeLine}
          />

          {/* Right Interactive PDF Canvas Pane */}
          <PdfCanvas
            zoom={zoom}
            synctexBoxes={synctexBoxes}
            onDirectEdit={handleDirectPdfEdit}
            onBlockReorder={handleBlockReorder}
            onJumpToSource={(line) => setActiveLine(line)}
          />

          {/* Bottom Error & Warning Diagnostic Drawer */}
          <DiagnosticDrawer
            diagnostics={diagnostics}
            onJumpToLine={(line) => setActiveLine(line)}
          />
        </div>
      )}

      {/* Modals */}
      <ImportZipModal
        isOpen={importZipOpen}
        onClose={() => setImportZipOpen(false)}
        onImport={handleImportZip}
      />

      <NewProjectModal
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={(name) => {
          const newProj: Project = {
            id: `proj-${Date.now()}`,
            name,
            root_path: `/data/projects/${name.toLowerCase().replace(/\s+/g, '_')}`,
            active_file: 'main.tex',
            settings: { theme, fontFamily, fontSize },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProjects((prev) => [newProj, ...prev]);
          setActiveProject(newProj);
        }}
      />
    </div>
  );
}
