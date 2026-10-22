export type ThemeName = 'dark-gold' | 'neon-green' | 'charcoal' | 'sepia';

export type WorkspaceMode = 'research-studio' | 'daily-journal';

export type FontFamily = 'EB Garamond' | 'Computer Modern' | 'Source Serif 4' | 'Lora' | 'Merriweather' | 'Geist Mono';

export type CompileStatus = 'ready' | 'compiling' | 'error' | 'idle';

export interface Project {
  id: string;
  name: string;
  root_path: string;
  active_file: string;
  settings: ProjectSettings;
  created_at: string;
  updated_at: string;
}

export interface ProjectSettings {
  theme?: ThemeName;
  fontFamily?: FontFamily;
  fontSize?: string;
  accentColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isCode?: boolean;
  zoom?: number;
}

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
  size?: number;
}

export interface DiagnosticQuickFix {
  label: string;
  action: 'insert_package' | 'replace' | 'wrap_math' | 'custom';
  payload: string;
  target?: string;
}

export interface DiagnosticError {
  id: string;
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
  excerpt?: string;
  suggestion?: string;
  quickFix?: DiagnosticQuickFix;
}

export interface VersionSnapshot {
  id: string;
  projectId: string;
  versionTag: string;
  summary: string;
  createdAt: string;
  fileTree?: string[];
}

export interface JournalEntry {
  id: string;
  dateStr: string;
  title: string;
  contentTex: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SyncTeXBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  file: string;
  line: number;
  column?: number;
  tag?: string;
}

export type QwenModelId = 'qwen2.5-coder:1.5b' | 'qwen2.5-coder:3b' | 'qwen2.5-coder:7b';

export interface QwenModelSpec {
  id: QwenModelId;
  name: string;
  parameters: string;
  quantization: string;
  vramGb: string;
  speedTokSec: string;
  contextWindow: string;
  description: string;
  installed: boolean;
}

export interface AIStatusResponse {
  ollamaAvailable: boolean;
  endpoint: string;
  activeModel: QwenModelId;
  installedModels: string[];
  models: QwenModelSpec[];
  fallbackEngine: string;
  installCommand: string;
}

export interface SearchReplacePatch {
  search: string;
  replace: string;
  explanation: string;
}

export interface AIFastEditRequest {
  instruction: string;
  selectedText?: string;
  fileContent: string;
  activeLine?: number;
  model?: QwenModelId;
}

export interface AIFastEditResponse {
  success: boolean;
  explanation: string;
  search: string;
  replace: string;
  patchedContent: string;
  modelUsed: string;
  latencyMs: number;
  usedFallback: boolean;
}

export interface AIDiagnosticFixRequest {
  diagnostic: DiagnosticError;
  fileContent: string;
  model?: QwenModelId;
}

export type AIChatIntent = 'ask' | 'rewrite' | 'format' | 'debug';

export interface ChatMessage {
  id: string;
  projectId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  intent?: AIChatIntent;
  createdAt: string;
}

export interface AIChatRequest {
  message: string;
  intent?: AIChatIntent;
  projectId?: string;
  fileContent?: string;
  selectedText?: string;
  activeLine?: number;
  model?: QwenModelId;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AIChatResponse {
  reply: string;
  model: string;
  intent: AIChatIntent;
  suggestedPatch?: {
    search: string;
    replace: string;
  };
  durationMs: number;
  usedFallback: boolean;
  messageId?: string;
}

export interface ElectronAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  getDataDir: () => Promise<string>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

