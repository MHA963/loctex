import React, { useState, useEffect, useRef } from 'react';
import { HeaderPill } from './components/HeaderPill.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { EditorPane, EditorPaneRef } from './components/EditorPane.tsx';
import { PdfCanvas, PdfCanvasRef } from './components/PdfCanvas.tsx';
import { DiagnosticDrawer } from './components/DiagnosticDrawer.tsx';
import { DailyJournalView } from './components/DailyJournalView.tsx';
import { ProjectsDashboard } from './components/ProjectsDashboard.tsx';
import { ImportZipModal, NewProjectModal } from './components/Modals.tsx';
import { QwenAssistantModal } from './components/QwenAssistantModal.tsx';
import {
  AIFastEditResponse,
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
  const editorRef = useRef<EditorPaneRef | null>(null);
  const pdfCanvasRef = useRef<PdfCanvasRef | null>(null);

  // View State: 'dashboard' | 'studio'
  const [currentView, setCurrentView] = useState<'dashboard' | 'studio'>('studio');

  // Theme & Mode State
  const [theme, setTheme] = useState<ThemeName>('dark-gold');
  const [mode, setMode] = useState<WorkspaceMode>('research-studio');

  // Typography Settings
  const [fontFamily, setFontFamily] = useState<FontFamily>('EB Garamond');
  const [fontSize, setFontSize] = useState('11pt');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);

  // Compilation & Zoom State
  const [compileStatus, setCompileStatus] = useState<CompileStatus>('ready');
  const [compileDurationMs, setCompileDurationMs] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState(100);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Split-Pane Resizable Width (Percentage of main editor width)
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(50);
  const isDraggingSplit = useRef(false);

  // Projects & Files State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState('main.tex');
  const [fileContent, setFileContent] = useState('');
  const [pdfVersion, setPdfVersion] = useState<number>(Date.now());
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticError[]>([]);
  const [synctexBoxes, setSynctexBoxes] = useState<SyncTeXBox[]>([]);

  // Journals State
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activeDate, setActiveDate] = useState('2026-10-11');

  // Modals
  const [importZipOpen, setImportZipOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [qwenModalOpen, setQwenModalOpen] = useState(false);

  // Apply theme class to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'sepia') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Load projects on mount
  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        if (!activeProject) {
          selectProject(data.projects[0], true);
        }
      } else {
        const createRes = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Research Paper' }),
        });
        const newProj = await createRes.json();
        setProjects([newProj]);
        selectProject(newProj, true);
      }
    } catch (e) {
      console.error('Failed to load projects from server:', e);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Save & Compile implementation supporting explicit targets
  const triggerCompileForProject = async (projectId: string, targetFile: string, contentToSave: string) => {
    setCompileStatus('compiling');
    try {
      const res = await fetch(`/api/projects/${projectId}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave, activeFile: targetFile }),
      });
      const result = await res.json();
      setCompileStatus(result.success ? 'ready' : 'error');
      setDiagnostics(result.diagnostics || []);
      if (result.durationMs !== undefined) {
        setCompileDurationMs(result.durationMs);
      }
      if (result.success) {
        setPdfVersion(Date.now());
      }
    } catch (e) {
      setCompileStatus('error');
    }
  };

  // Select project & load files
  const selectProject = async (project: Project, autoCompile = true) => {
    setActiveProject(project);
    setCurrentView('studio');
    setPdfVersion(Date.now());
    try {
      const filesRes = await fetch(`/api/projects/${project.id}/files`);
      const filesData = await filesRes.json();
      if (filesData.files) {
        setFiles(filesData.files);
      }

      const targetFile = project.active_file || 'main.tex';
      setActiveFile(targetFile);
      const fileRes = await fetch(`/api/projects/${project.id}/file?path=${encodeURIComponent(targetFile)}`);
      const fileData = await fileRes.json();
      const content = fileData.content || '';
      setFileContent(content);

      const snapRes = await fetch(`/api/projects/${project.id}/snapshots`);
      const snapData = await snapRes.json();
      if (snapData.snapshots) {
        setSnapshots(snapData.snapshots);
      }

      if (autoCompile) {
        triggerCompileForProject(project.id, targetFile, content);
      } else {
        setCompileStatus('ready');
      }
    } catch (e) {
      console.error('Failed to load project details:', e);
      setCompileStatus('error');
    }
  };

  // Switch active file
  const handleSelectFile = async (filePath: string) => {
    if (!activeProject) return;
    const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.gz', '.ico'];
    if (binaryExtensions.includes(ext)) {
      return;
    }
    setActiveFile(filePath);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setFileContent(data.content);
      }
    } catch (e) {
      console.error('Failed to load file:', e);
    }
  };

  // Save & Compile
  const triggerCompile = async (contentToSave = fileContent) => {
    if (!activeProject) return;
    return triggerCompileForProject(activeProject.id, activeFile, contentToSave);
  };

  // Automated Quick-Fix Handler
  const handleApplyQuickFix = async (diagnostic: DiagnosticError) => {
    if (!diagnostic.quickFix || !activeProject) return;
    const { action, payload, target } = diagnostic.quickFix;

    let newContent = fileContent;

    if (action === 'insert_package') {
      const docClassRegex = /(\\documentclass(?:\[[^\]]*\])?\{[^}]+\})/;
      if (docClassRegex.test(newContent)) {
        newContent = newContent.replace(docClassRegex, `$1\n${payload}`);
      } else {
        newContent = `${payload}\n${newContent}`;
      }
    } else if (action === 'replace') {
      const lines = newContent.split('\n');
      const lineIdx = diagnostic.line - 1;
      if (lineIdx >= 0 && lineIdx < lines.length) {
        if (target && lines[lineIdx].includes(target)) {
          lines[lineIdx] = lines[lineIdx].replace(target, payload);
        } else {
          lines[lineIdx] = `${lines[lineIdx]} % ${payload}`;
        }
        newContent = lines.join('\n');
      }
    } else if (action === 'wrap_math') {
      const lines = newContent.split('\n');
      const lineIdx = diagnostic.line - 1;
      if (lineIdx >= 0 && lineIdx < lines.length) {
        lines[lineIdx] = `$${lines[lineIdx].trim()}$`;
        newContent = lines.join('\n');
      }
    }

    setFileContent(newContent);
    await fetch(`/api/projects/${activeProject.id}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: activeFile, content: newContent }),
    });
    triggerCompile(newContent);
  };

  // Apply patched content from Qwen 2.5 Coder Fast-Edit or Diagnostic Repair
  const handleApplyPatchedContent = async (patchedContent: string) => {
    if (!activeProject) return;
    setFileContent(patchedContent);
    await fetch(`/api/projects/${activeProject.id}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: activeFile, content: patchedContent }),
    });
    triggerCompile(patchedContent);
  };

  const handleAiFixDiagnostic = async (diagnostic: DiagnosticError) => {
    if (!activeProject) return;
    try {
      const res = await fetch('/api/ai/fix-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnostic,
          fileContent,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as AIFastEditResponse;
        if (data.success && data.patchedContent) {
          await handleApplyPatchedContent(data.patchedContent);
        }
      }
    } catch (e) {
      console.error('Qwen diagnostic repair failed:', e);
    }
  };

  // Debounced auto-save & compile on editor content change
  useEffect(() => {
    if (!activeProject || !fileContent) return;
    const timer = setTimeout(() => {
      fetch(`/api/projects/${activeProject.id}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeFile, content: fileContent }),
      }).then(() => {
        triggerCompile(fileContent);
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [fileContent]);

  // Global Shortcuts: Ctrl+S, Ctrl+Enter / Cmd+Enter, and Ctrl+K (Qwen Fast-Edit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'Enter')) {
        e.preventDefault();
        triggerCompile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQwenModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileContent, activeProject]);

  // Split-Pane Mouse Dragging Handlers
  const handleMouseDownSplit = () => {
    isDraggingSplit.current = true;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplit.current) return;
      const totalWidth = window.innerWidth - 240; // minus sidebar width (240px)
      if (totalWidth > 0) {
        const offset = e.clientX - 240;
        const newPercent = Math.max(20, Math.min(80, (offset / totalWidth) * 100));
        setEditorWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSplit.current) {
        isDraggingSplit.current = false;
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Topbar Typography Format Actions
  const handleToggleBold = () => {
    setIsBold(!isBold);
    editorRef.current?.wrapSelection('\\textbf{', '}');
  };

  const handleToggleItalic = () => {
    setIsItalic(!isItalic);
    editorRef.current?.wrapSelection('\\textit{', '}');
  };

  const handleToggleUnderline = () => {
    setIsUnderline(!isUnderline);
    editorRef.current?.wrapSelection('\\underline{', '}');
  };

  const handleToggleCode = () => {
    setIsCode(!isCode);
    editorRef.current?.wrapSelection('\\texttt{', '}');
  };

  // Fit Width Calculation
  const handleFitWidth = () => {
    if (pdfCanvasRef.current) {
      const fitZoom = pdfCanvasRef.current.calculateFitWidth();
      setZoom(fitZoom);
    }
  };

  // Direct In-PDF Edit Handler
  const handleDirectPdfEdit = (newText: string, targetLine: number) => {
    const lines = fileContent.split('\n');
    if (targetLine <= lines.length) {
      lines[targetLine - 1] = newText;
      const updated = lines.join('\n');
      setFileContent(updated);
      triggerCompile(updated);
    }
  };

  // File CRUD
  const handleCreateNewFile = async () => {
    if (!activeProject) return;
    const fileName = prompt('Enter new filename (e.g. results.tex or references.bib):');
    if (fileName) {
      try {
        await fetch(`/api/projects/${activeProject.id}/file/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: fileName }),
        });
        const filesRes = await fetch(`/api/projects/${activeProject.id}/files`);
        const filesData = await filesRes.json();
        setFiles(filesData.files || []);
        handleSelectFile(fileName);
      } catch (e) {
        console.error('Failed to create file:', e);
      }
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!activeProject) return;
    try {
      await fetch(`/api/projects/${activeProject.id}/file?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });
      const filesRes = await fetch(`/api/projects/${activeProject.id}/files`);
      const filesData = await filesRes.json();
      setFiles(filesData.files || []);
      if (activeFile === filePath) {
        handleSelectFile('main.tex');
      }
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
  };

  const handleRenameFile = async (oldPath: string, newName: string) => {
    if (!activeProject) return;
    try {
      const getRes = await fetch(`/api/projects/${activeProject.id}/file?path=${encodeURIComponent(oldPath)}`);
      const getData = await getRes.json();
      await fetch(`/api/projects/${activeProject.id}/file/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newName, initialContent: getData.content || '' }),
      });
      await fetch(`/api/projects/${activeProject.id}/file?path=${encodeURIComponent(oldPath)}`, {
        method: 'DELETE',
      });
      const filesRes = await fetch(`/api/projects/${activeProject.id}/files`);
      const filesData = await filesRes.json();
      setFiles(filesData.files || []);
      handleSelectFile(newName);
    } catch (e) {
      console.error('Failed to rename file:', e);
    }
  };

  const handleExportPdf = () => {
    if (activeProject) {
      window.open(`/api/projects/${activeProject.id}/export-pdf`, '_blank');
    }
  };

  const handleExportZip = () => {
    if (activeProject) {
      window.open(`/api/projects/${activeProject.id}/export-zip`, '_blank');
    }
  };

  const handleImportZip = async (projectName: string, base64Zip: string) => {
    try {
      setCompileStatus('compiling');
      const res = await fetch('/api/projects/import-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, base64Zip }),
      });
      const data = await res.json();
      if (data.id) {
        const targetActiveFile = data.active_file || data.mainFile || 'main.tex';
        const newProj: Project = {
          id: data.id,
          name: data.name,
          root_path: data.root_path,
          active_file: targetActiveFile,
          settings: { theme, fontFamily, fontSize },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProjects((prev) => [newProj, ...prev]);
        await selectProject(newProj, true);
      }
    } catch (e) {
      console.error(e);
      setCompileStatus('error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProject?.id === id) {
        const remaining = projects.filter((p) => p.id !== id);
        if (remaining.length > 0) selectProject(remaining[0]);
        else setActiveProject(null);
      }
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
  };

  const handleRenameProject = async (id: string, newName: string) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
      if (activeProject?.id === id) {
        setActiveProject((prev) => (prev ? { ...prev, name: newName } : null));
      }
    } catch (e) {
      console.error('Failed to rename project:', e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Topbar / Floating Header Pill */}
      <HeaderPill
        compileStatus={compileStatus}
        compileDurationMs={compileDurationMs}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitWidth={handleFitWidth}
        onCompile={() => triggerCompile()}
        onOpenQwenAssistant={() => setQwenModalOpen(true)}
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        isBold={isBold}
        onToggleBold={handleToggleBold}
        isItalic={isItalic}
        onToggleItalic={handleToggleItalic}
        isUnderline={isUnderline}
        onToggleUnderline={handleToggleUnderline}
        isCode={isCode}
        onToggleCode={handleToggleCode}
        theme={theme}
        onThemeChange={setTheme}
        mode={mode}
        onModeChange={setMode}
        activeFileName={activeFile}
        projectName={activeProject?.name || 'My Research'}
      />

      {/* Main Content Area */}
      {currentView === 'dashboard' ? (
        <ProjectsDashboard
          projects={projects}
          onOpenProject={(id) => {
            const p = projects.find((proj) => proj.id === id);
            if (p) selectProject(p);
          }}
          onNewProject={() => setNewProjectOpen(true)}
          onImportZip={() => setImportZipOpen(true)}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
        />
      ) : mode === 'daily-journal' ? (
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
          {/* Left File Tree Sidebar */}
          <Sidebar
            activeProject={activeProject}
            onOpenDashboard={() => setCurrentView('dashboard')}
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
            onNewFile={handleCreateNewFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
          />

          {/* Center LaTeX Code Editor Pane (Adjustable Width) */}
          <div style={{ width: `${editorWidthPercent}%` }} className="h-full flex flex-col">
            <EditorPane
              ref={editorRef}
              content={fileContent}
              onChange={setFileContent}
              diagnostics={diagnostics}
              activeLine={activeLine}
              onCompile={() => triggerCompile()}
            />
          </div>

          {/* Draggable Horizontal Splitter Bar */}
          <div
            onMouseDown={handleMouseDownSplit}
            className="w-1.5 bg-[#1a1916] hover:bg-[#d4af37] cursor-col-resize flex items-center justify-center transition-colors z-20 select-none group"
            title="Drag to resize Editor / PDF view"
          >
            <div className="w-0.5 h-6 bg-[#3d3a33] group-hover:bg-black rounded-full" />
          </div>

          {/* Right Interactive PDF Canvas Pane (Adjustable Width) */}
          <div style={{ width: `${100 - editorWidthPercent}%` }} className="h-full flex flex-col">
            <PdfCanvas
              ref={pdfCanvasRef}
              projectId={activeProject?.id || null}
              pdfVersion={pdfVersion}
              zoom={zoom}
              onZoomChange={setZoom}
              compileStatus={compileStatus}
              onCompile={() => triggerCompile()}
              fontFamily={fontFamily}
              texContent={fileContent}
              synctexBoxes={synctexBoxes}
              onJumpToSource={(line) => {
                setActiveLine(line);
                editorRef.current?.jumpToLine(line);
              }}
            />
          </div>

          {/* Bottom Diagnostic Drawer */}
          <DiagnosticDrawer
            diagnostics={diagnostics}
            onJumpToLine={(line) => {
              setActiveLine(line);
              editorRef.current?.jumpToLine(line);
            }}
            onApplyQuickFix={handleApplyQuickFix}
            onAiFixDiagnostic={handleAiFixDiagnostic}
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
        onCreate={async (name, template) => {
          try {
            setCompileStatus('compiling');
            const res = await fetch('/api/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, template }),
            });
            const newProj = await res.json();
            setProjects((prev) => [newProj, ...prev]);
            await selectProject(newProj);
            setPdfVersion(Date.now());
            setCompileStatus('ready');
          } catch (e) {
            console.error(e);
            setCompileStatus('error');
          }
        }}
      />

      <QwenAssistantModal
        isOpen={qwenModalOpen}
        onClose={() => setQwenModalOpen(false)}
        fileContent={fileContent}
        activeLine={activeLine}
        onApplyPatchedContent={handleApplyPatchedContent}
      />
    </div>
  );
}
