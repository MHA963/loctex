export interface ProjectRecord {
  id: string;
  name: string;
  root_path: string;
  active_file: string;
  settings_json: string;
  created_at: string;
  updated_at: string;
}

export interface SnapshotRecord {
  id: string;
  project_id: string;
  version_tag: string;
  summary: string;
  file_tree_json: string;
  created_at: string;
}

export interface JournalRecord {
  id: string;
  date_str: string;
  title: string;
  content_tex: string;
  tags_json: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectChatRecord {
  id: string;
  project_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  intent?: string;
  created_at: string;
}

export const INITIAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  root_path TEXT NOT NULL,
  active_file TEXT NOT NULL DEFAULT 'main.tex',
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  version_tag TEXT NOT NULL,
  summary TEXT,
  file_tree_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journals (
  id TEXT PRIMARY KEY,
  date_str TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content_tex TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_chats (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  intent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_snapshots_project ON snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals(date_str);
CREATE INDEX IF NOT EXISTS idx_project_chats_project ON project_chats(project_id, created_at ASC);
`;
