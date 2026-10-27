import {
  AIChatIntent,
  AIChatRequest,
  AIChatResponse,
  ChatMessage,
  CompileStatus,
  DiagnosticError,
  FileItem,
  Project,
  QwenModelId,
  VersionSnapshot,
} from '../types/index.ts';

export interface CompileResult {
  success: boolean;
  diagnostics: DiagnosticError[];
  durationMs?: number;
}

export interface FileData {
  content: string;
}

export const api = {
  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error(`Failed to load projects: ${res.statusText}`);
    return res.json();
  },

  async createProject(name: string, template?: string): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, template }),
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.statusText}`);
    return res.json();
  },

  async renameProject(id: string, name: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to rename project: ${res.statusText}`);
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.statusText}`);
  },

  async importZip(name: string, base64Zip: string): Promise<any> {
    const res = await fetch('/api/projects/import-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, base64Zip }),
    });
    if (!res.ok) throw new Error(`Failed to import zip: ${res.statusText}`);
    return res.json();
  },

  // Project Files
  async getFiles(projectId: string): Promise<{ files: FileItem[] }> {
    const res = await fetch(`/api/projects/${projectId}/files`);
    if (!res.ok) throw new Error(`Failed to load project files: ${res.statusText}`);
    return res.json();
  },

  async getFile(projectId: string, filePath: string): Promise<FileData> {
    const res = await fetch(`/api/projects/${projectId}/file?path=${encodeURIComponent(filePath)}`);
    if (!res.ok) throw new Error(`Failed to read file ${filePath}: ${res.statusText}`);
    return res.json();
  },

  async saveFile(projectId: string, filePath: string, content: string): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content }),
    });
    if (!res.ok) throw new Error(`Failed to save file ${filePath}: ${res.statusText}`);
  },

  async createFile(projectId: string, filePath: string, initialContent = ''): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}/file/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, initialContent }),
    });
    if (!res.ok) throw new Error(`Failed to create file ${filePath}: ${res.statusText}`);
  },

  async deleteFile(projectId: string, filePath: string): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}/file?path=${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete file ${filePath}: ${res.statusText}`);
  },

  async uploadAsset(projectId: string, payload: { path: string; base64Data?: string; svgContent?: string }): Promise<{ success: boolean; path: string }> {
    const res = await fetch(`/api/projects/${projectId}/asset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to upload asset: ${res.statusText}`);
    return res.json();
  },

  async getSnapshots(projectId: string): Promise<{ snapshots: VersionSnapshot[] }> {
    const res = await fetch(`/api/projects/${projectId}/snapshots`);
    if (!res.ok) throw new Error(`Failed to load snapshots: ${res.statusText}`);
    return res.json();
  },

  // Compilation
  async compile(projectId: string, contentToSave: string, targetFile: string): Promise<CompileResult> {
    const res = await fetch(`/api/projects/${projectId}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: contentToSave, activeFile: targetFile }),
    });
    if (!res.ok) throw new Error(`Compilation failed: ${res.statusText}`);
    return res.json();
  },

  // AI Chat & Persistence
  async getProjectChat(projectId: string): Promise<{ messages: ChatMessage[] }> {
    const res = await fetch(`/api/projects/${projectId}/chat`);
    if (!res.ok) throw new Error(`Failed to load chat: ${res.statusText}`);
    return res.json();
  },

  async clearProjectChat(projectId: string): Promise<void> {
    const res = await fetch(`/api/projects/${projectId}/chat`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to clear chat: ${res.statusText}`);
  },

  async sendChatMessage(req: AIChatRequest): Promise<AIChatResponse> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Failed to generate AI response: ${res.statusText}`);
    return res.json();
  },
};
