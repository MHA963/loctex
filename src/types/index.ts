export type ThemeName = 'dark-gold' | 'neon-green' | 'charcoal' | 'sepia';

export type WorkspaceMode = 'research-studio' | 'daily-journal';

export type FontFamily = 'Computer Modern' | 'Serif' | 'Inter' | 'Garamond' | 'Geist Mono';

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

export interface DiagnosticError {
  id: string;
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
  excerpt?: string;
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
