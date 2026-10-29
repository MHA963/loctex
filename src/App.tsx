import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderPill } from './components/HeaderPill.tsx';
import { DashboardHeader } from './components/DashboardHeader.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { EditorPane, EditorPaneRef } from './components/EditorPane.tsx';
import { AssetPreviewPane, isPreviewableAsset } from './components/AssetPreviewPane.tsx';
import { PdfCanvas, PdfCanvasRef } from './components/PdfCanvas.tsx';
import { DiagnosticDrawer } from './components/DiagnosticDrawer.tsx';
import { DailyJournalView } from './components/DailyJournalView.tsx';
import { ProjectsDashboard } from './components/ProjectsDashboard.tsx';
import { ImportZipModal, NewProjectModal } from './components/Modals.tsx';
import { api } from './services/api.ts';
import {
  AIFastEditResponse,
  CompileStatus,
  AIChatIntent,
  ChatMessage,
  DiagnosticError,
  FileItem,
  FontFamily,
  JournalEntry,
  Project,
  QwenModelId,
  ThemeName,
  VersionSnapshot,
  WorkspaceMode,
} from './types/index.ts';
import {
  FontFamilyCommand,
  FontSizeCommand,
  SelectionFormatState,
} from './utils/latex-format.ts';

export default function App() {
  const editorRef = useRef<EditorPaneRef | null>(null);
  const pdfCanvasRef = useRef<PdfCanvasRef | null>(null);

  // View State: 'dashboard' | 'studio' - always start on dashboard on launch
  const [currentView, setCurrentView] = useState<'dashboard' | 'studio'>('dashboard');

  // Theme & Mode State
  const [theme, setTheme] = useState<ThemeName>('dark-gold');
  const [mode, setMode] = useState<WorkspaceMode>('research-studio');

  // Typography Settings
  const [fontFamily, setFontFamily] = useState<FontFamily>('EB Garamond');
  const [fontSize, setFontSize] = useState('11pt');
  const [isCode, setIsCode] = useState(false);

  // Live formatting state derived from the CodeMirror selection (drives B / I / U / font / size toolbar)
  const [selectionFormat, setSelectionFormat] = useState<SelectionFormatState>({
    bold: false,
    italic: false,
    underline: false,
    fontFamily: 'default',
    fontSize: 'normalsize',
  });
  const [selectedText, setSelectedText] = useState('');
  const isBold = selectionFormat.bold;
  const isItalic = selectionFormat.italic;
  const isUnderline = selectionFormat.underline;

  const handleSelectionFormatChange = useCallback((formatState: SelectionFormatState, selection: string) => {
    setSelectionFormat((previous) =>
      previous.bold === formatState.bold &&
      previous.italic === formatState.italic &&
      previous.underline === formatState.underline &&
      previous.fontFamily === formatState.fontFamily &&
      previous.fontSize === formatState.fontSize
        ? previous
        : formatState
    );
    setSelectedText(selection);
  }, []);

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
  const [lastTexFile, setLastTexFile] = useState('main.tex');
  const [svgCodeMode, setSvgCodeMode] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [pdfVersion, setPdfVersion] = useState<number>(Date.now());
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticError[]>([]);

  // Journals State
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activeDate, setActiveDate] = useState('2026-10-11');

  // Modals & Drawers
  const [importZipOpen, setImportZipOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [activeAiModel, setActiveAiModel] = useState<QwenModelId>('qwen2.5-coder:1.5b');
  const [projectChats, setProjectChats] = useState<Record<string, ChatMessage[]>>({});
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Load and cache project chat messages
  const loadProjectChats = useCallback(async (projectId: string) => {
    try {
      const data = await api.getProjectChat(projectId);
      if (Array.isArray(data.messages)) {
        setProjectChats((prev) => ({ ...prev, [projectId]: data.messages }));
        try {
          localStorage.setItem(`loctex_chat_${projectId}`, JSON.stringify(data.messages));
        } catch {
          // ignore
        }
        return;
      }
    } catch {
      // fallback
    }

    try {
      const local = localStorage.getItem(`loctex_chat_${projectId}`);
      if (local) {
        setProjectChats((prev) => ({ ...prev, [projectId]: JSON.parse(local) }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (activeProject?.id) {
      loadProjectChats(activeProject.id);
    }
  }, [activeProject?.id, loadProjectChats]);

  const handleSendChatMessage = async (message: string, intent: AIChatIntent, model: QwenModelId) => {
    if (!activeProject) return;
    const projectId = activeProject.id;
    const userMsgId = `msg-${Date.now()}-u`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      projectId,
      role: 'user',
      content: message,
      model,
      intent,
      createdAt: new Date().toISOString(),
    };

    const currentHistory = projectChats[projectId] || [];
    const updatedWithUser = [...currentHistory, userMsg];
    setProjectChats((prev) => ({ ...prev, [projectId]: updatedWithUser }));
    setIsAiGenerating(true);

    try {
      const data = await api.sendChatMessage({
        projectId,
        message,
        intent,
        model,
        fileContent,
        selectedText,
        history: currentHistory.slice(-4).map((m) => ({ role: m.role, content: m.content })),
      });

      const asstMsg: ChatMessage = {
        id: data.messageId || `msg-${Date.now()}-a`,
        projectId,
        role: 'assistant',
        content: data.reply,
        model: data.model || model,
        intent: data.intent || intent,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...updatedWithUser, asstMsg];
      setProjectChats((prev) => ({ ...prev, [projectId]: finalMessages }));
      try {
        localStorage.setItem(`loctex_chat_${projectId}`, JSON.stringify(finalMessages));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleClearChatHistory = async () => {
    if (!activeProject) return;
    const projectId = activeProject.id;
    // Immediately clear state and local storage for immediate UI update
    setProjectChats((prev) => ({ ...prev, [projectId]: [] }));
    try {
      localStorage.removeItem(`loctex_chat_${projectId}`);
    } catch {
      // ignore
    }
    try {
      await api.clearProjectChat(projectId);
    } catch (err) {
      console.error('Failed to clear chat on server:', err);
    }
  };

  // Apply theme class to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'sepia') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Load projects on mount - keep initial view on dashboard
  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        if (!activeProject) {
          // Pre-load background files without leaving dashboard
          selectProject(data.projects[0], false, false);
        }
      } else {
        const newProj = await api.createProject('My Research Paper');
        setProjects([newProj]);
        selectProject(newProj, false, false);
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
      const result = await api.compile(projectId, contentToSave, targetFile);
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

  // Select project & load files (no auto-compile by default; compile only on user action or Ctrl+S)
  const selectProject = async (project: Project, autoCompile = false, navigateToStudio = true) => {
    setActiveProject(project);
    if (navigateToStudio) {
      setCurrentView('studio');
    }
    setPdfVersion(Date.now());
    try {
      const filesData = await api.getFiles(project.id);
      if (filesData.files) {
        setFiles(filesData.files);
      }

      const targetFile = project.active_file || 'main.tex';
      setActiveFile(targetFile);
      setLastTexFile(targetFile);
      setSvgCodeMode(false);
      const fileData = await api.getFile(project.id, targetFile);
      const content = fileData.content || '';
      setFileContent(content);

      const snapData = await api.getSnapshots(project.id);
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

  // Switch active file (supports .tex, .bib, and previewable assets: images, .pdf, .svg)
  const handleSelectFile = async (filePath: string) => {
    if (!activeProject) return;
    const ext = filePath.includes('.') ? filePath.slice(filePath.lastIndexOf('.')).toLowerCase() : '';
    if (ext === '.zip' || ext === '.gz') {
      return;
    }

    setActiveFile(filePath);
    setSvgCodeMode(false);

    if (ext === '.tex') {
      setLastTexFile(filePath);
    }

    // Binary previewable assets (.png, .jpg, .jpeg, .gif, .webp, .pdf, .ico, .bmp) are streamed directly by AssetPreviewPane
    if (isPreviewableAsset(filePath) && ext !== '.svg') {
      return;
    }

    try {
      const data = await api.getFile(activeProject.id, filePath);
      if (data.content !== undefined) {
        setFileContent(data.content);
      }
    } catch (e) {
      console.error('Failed to load file:', e);
    }
  };

  // Save & Compile (always compiles the active .tex file even if an image/asset is currently previewed)
  const triggerCompile = async (contentToSave = fileContent) => {
    if (!activeProject) return;
    const targetTex = activeFile.endsWith('.tex') ? activeFile : lastTexFile || 'main.tex';
    return triggerCompileForProject(activeProject.id, targetTex, contentToSave);
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
      }
      newContent = lines.join('\n');
    }

    setFileContent(newContent);
    const targetTex = activeFile.endsWith('.tex') ? activeFile : lastTexFile || 'main.tex';
    await api.saveFile(activeProject.id, targetTex, newContent);
    triggerCompile(newContent);
  };

  // Apply patched content from Qwen 2.5 Coder Fast-Edit or Diagnostic Repair
  const handleApplyPatchedContent = async (patchedContent: string) => {
    if (!activeProject) return;
    setFileContent(patchedContent);
    const targetTex = activeFile.endsWith('.tex') ? activeFile : lastTexFile || 'main.tex';
    await api.saveFile(activeProject.id, targetTex, patchedContent);
    triggerCompile(patchedContent);
  };

  const handleAiFixDiagnostic = async (diagnostic: DiagnosticError) => {
    if (!activeProject) return;
    try {
      const data = await api.fixError(diagnostic, fileContent);
      if (data.success && data.patchedContent) {
        await handleApplyPatchedContent(data.patchedContent);
      }
    } catch (e) {
      console.error('Qwen diagnostic repair failed:', e);
    }
  };

  // Debounced background file save on editor content change (does NOT auto-compile; skips binary assets)
  useEffect(() => {
    if (!activeProject || !fileContent) return;
    if (isPreviewableAsset(activeFile) && !svgCodeMode) return;
    const timer = setTimeout(() => {
      api.saveFile(activeProject.id, activeFile, fileContent).catch((err) =>
        console.error('Failed to auto-save file:', err)
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [fileContent, activeProject, activeFile, svgCodeMode]);

  // Global Shortcuts: Ctrl+S, Ctrl+Enter / Cmd+Enter (Save & Compile), and Ctrl+K (Qwen Fast-Edit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key === 'Enter')) {
        e.preventDefault();
        triggerCompile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setChatDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileContent, activeProject, activeFile]);

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
  // B / I / U wrap the selection on first click and unwrap the enclosing macro on second click
  const handleToggleBold = () => editorRef.current?.toggleInlineFormat('bold');
  const handleToggleItalic = () => editorRef.current?.toggleInlineFormat('italic');
  const handleToggleUnderline = () => editorRef.current?.toggleInlineFormat('underline');
  const handleApplyFontFamily = (family: FontFamilyCommand) => editorRef.current?.applyFontFamily(family);
  const handleApplyFontSize = (size: FontSizeCommand) => editorRef.current?.applyFontSize(size);

  const handleToggleCode = () => {
    setIsCode(!isCode);
    editorRef.current?.wrapSelection('\\texttt{', '}');
  };

  // Intelligent Fit calculation: toggles between Fit Width and Fit Page
  const handleFitWidth = () => {
    if (pdfCanvasRef.current) {
      const fitWidthZoom = pdfCanvasRef.current.calculateFitWidth();
      const fitPageZoom = pdfCanvasRef.current.calculateFitPage?.() ?? 75;
      if (Math.abs(zoom - fitWidthZoom) <= 5) {
        setZoom(fitPageZoom);
      } else {
        setZoom(fitWidthZoom);
      }
    }
  };

  // File CRUD & Asset Uploads
  const refreshProjectFiles = async (projectId: string) => {
    try {
      const filesData = await api.getFiles(projectId);
      setFiles(filesData.files || []);
    } catch (e) {
      console.error('Failed to refresh project files:', e);
    }
  };

  const handleUploadAsset = async (fileName: string, base64Data: string) => {
    if (!activeProject) return;
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = cleanName.includes('/') ? cleanName : `figures/${cleanName}`;
    try {
      const data = await api.uploadAsset(activeProject.id, { path: targetPath, base64Data });
      if (data.success && data.path) {
        await refreshProjectFiles(activeProject.id);
        await handleSelectFile(data.path);
      }
    } catch (e) {
      console.error('Failed to upload asset:', e);
    }
  };

  const handlePasteAssetInEditor = async (payload: {
    fileName: string;
    base64Data?: string;
    svgContent?: string;
  }): Promise<string | null> => {
    if (!activeProject) return null;
    try {
      const data = await api.uploadAsset(activeProject.id, {
        path: payload.fileName,
        base64Data: payload.base64Data,
        svgContent: payload.svgContent,
      });
      if (data.success && data.path) {
        await refreshProjectFiles(activeProject.id);
        return data.path;
      }
    } catch (e) {
      console.error('Failed to import pasted asset:', e);
    }
    return null;
  };

  const handleCreateNewFile = async (requestedName?: string, kind: 'tex' | 'bib' = 'tex') => {
    if (!activeProject) return;
    const fileName = requestedName?.trim();
    if (!fileName) return;
    try {
      await api.createFile(activeProject.id, fileName);
      await refreshProjectFiles(activeProject.id);
      await handleSelectFile(fileName);
    } catch (e) {
      console.error(`Failed to create ${kind} file:`, e);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!activeProject) return;
    try {
      await api.deleteFile(activeProject.id, filePath);
      await refreshProjectFiles(activeProject.id);
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
      const getData = await api.getFile(activeProject.id, oldPath);
      await api.createFile(activeProject.id, newName, getData.content || '');
      await api.deleteFile(activeProject.id, oldPath);
      await refreshProjectFiles(activeProject.id);
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
      const data = await api.importZip(projectName, base64Zip);
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
      await api.deleteProject(id);
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
      await api.renameProject(id, newName);
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
      {/* Topbar: Minimal Clean Header on Dashboard; Full Tool HeaderPill in Studio */}
      {currentView === 'dashboard' ? (
        <DashboardHeader theme={theme} onThemeChange={setTheme} />
      ) : (
        <HeaderPill
          compileStatus={compileStatus}
          compileDurationMs={compileDurationMs}
          zoom={zoom}
          onZoomChange={setZoom}
          onFitWidth={handleFitWidth}
          onCompile={() => triggerCompile()}
          onOpenQwenAssistant={() => setChatDrawerOpen((prev) => !prev)}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          fontFamilyCommand={selectionFormat.fontFamily}
          onApplyFontFamily={handleApplyFontFamily}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          fontSizeCommand={selectionFormat.fontSize}
          onApplyFontSize={handleApplyFontSize}
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
          fileContent={fileContent}
          selectedText={selectedText}
          activeFileName={activeFile}
          projectName={activeProject?.name || 'My Research'}
        />
      )}

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
            onNewFile={() => handleCreateNewFile('section.tex', 'tex')}
            onCreateFile={handleCreateNewFile}
            onUploadAsset={handleUploadAsset}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
          />

          {/* Center LaTeX Code Editor or Asset Preview Pane (Adjustable Width) */}
          <div style={{ width: `${editorWidthPercent}%` }} className="h-full flex flex-col">
            {activeProject && isPreviewableAsset(activeFile) && !svgCodeMode ? (
              <AssetPreviewPane
                projectId={activeProject.id}
                filePath={activeFile}
                svgSourceContent={fileContent}
                onEditSvgSource={
                  activeFile.toLowerCase().endsWith('.svg')
                    ? () => setSvgCodeMode(true)
                    : undefined
                }
                onBackToTex={() => handleSelectFile(lastTexFile || 'main.tex')}
              />
            ) : (
              <EditorPane
                ref={editorRef}
                content={fileContent}
                onChange={setFileContent}
                diagnostics={diagnostics}
                activeLine={activeLine}
                onCompile={() => triggerCompile()}
                onPasteAsset={handlePasteAssetInEditor}
                onSelectionFormatChange={handleSelectionFormatChange}
                chatDrawerOpen={chatDrawerOpen}
                onToggleChatDrawer={() => setChatDrawerOpen(!chatDrawerOpen)}
                chatMessages={activeProject ? projectChats[activeProject.id] || [] : []}
                onSendChatMessage={handleSendChatMessage}
                onClearChatHistory={handleClearChatHistory}
                activeAiModel={activeAiModel}
                onSelectAiModel={setActiveAiModel}
                isAiGenerating={isAiGenerating}
              />
            )}
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
              texContent={fileContent}
              onJumpToSource={(line) => {
                if (isPreviewableAsset(activeFile)) {
                  setActiveFile(lastTexFile || 'main.tex');
                  setSvgCodeMode(false);
                }
                setActiveLine(line);
                setTimeout(() => editorRef.current?.jumpToLine(line), 20);
              }}
            />
          </div>

          {/* Bottom Diagnostic Drawer */}
          <DiagnosticDrawer
            diagnostics={diagnostics}
            onJumpToLine={(line) => {
              if (isPreviewableAsset(activeFile)) {
                setActiveFile(lastTexFile || 'main.tex');
                setSvgCodeMode(false);
              }
              setActiveLine(line);
              setTimeout(() => editorRef.current?.jumpToLine(line), 20);
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
            const newProj = await api.createProject(name, template);
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
    </div>
  );
}
