import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import {
  INITIAL_SCHEMA_SQL,
  ProjectRecord,
  SnapshotRecord,
  JournalRecord,
  ProjectChatRecord,
} from './schema.ts';

export class LocTexDatabase {
  private db: sqlite3.Database;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath || path.resolve(process.cwd(), 'loctex_data', 'loctex.db');
    const dbDir = path.dirname(resolvedPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(resolvedPath);
    this.initSchema();
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private initSchema() {
    this.db.serialize(() => {
      this.db.run('PRAGMA foreign_keys = ON;');
      this.db.run('PRAGMA journal_mode = WAL;');
      this.db.exec(INITIAL_SCHEMA_SQL, (err) => {
        if (err) {
          console.error('Failed to initialize SQLite schema:', err);
        }
      });
    });
  }

  public run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  public get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  public all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  // --- Project Management CRUD ---
  public async listProjects(): Promise<ProjectRecord[]> {
    return this.all<ProjectRecord>('SELECT * FROM projects ORDER BY updated_at DESC');
  }

  public async getProject(id: string): Promise<ProjectRecord | undefined> {
    return this.get<ProjectRecord>('SELECT * FROM projects WHERE id = ?', [id]);
  }

  public async createProject(project: Omit<ProjectRecord, 'created_at' | 'updated_at'>): Promise<void> {
    await this.run(
      'INSERT INTO projects (id, name, root_path, active_file, settings_json) VALUES (?, ?, ?, ?, ?)',
      [project.id, project.name, project.root_path, project.active_file, project.settings_json]
    );
  }

  public async updateProject(id: string, updates: Partial<ProjectRecord>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.active_file !== undefined) {
      fields.push('active_file = ?');
      values.push(updates.active_file);
    }
    if (updates.settings_json !== undefined) {
      fields.push('settings_json = ?');
      values.push(updates.settings_json);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  public async deleteProject(id: string): Promise<void> {
    await this.run('DELETE FROM snapshots WHERE project_id = ?', [id]);
    await this.run('DELETE FROM project_chats WHERE project_id = ?', [id]);
    await this.run('DELETE FROM projects WHERE id = ?', [id]);
  }

  // --- Snapshot Management ---
  public async listSnapshots(projectId: string): Promise<SnapshotRecord[]> {
    return this.all<SnapshotRecord>('SELECT * FROM snapshots WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
  }

  public async createSnapshot(snapshot: Omit<SnapshotRecord, 'created_at'>): Promise<void> {
    await this.run(
      'INSERT INTO snapshots (id, project_id, version_tag, summary, file_tree_json) VALUES (?, ?, ?, ?, ?)',
      [snapshot.id, snapshot.project_id, snapshot.version_tag, snapshot.summary, snapshot.file_tree_json]
    );
  }

  // --- Daily Journal Entries ---
  public async listJournals(): Promise<JournalRecord[]> {
    return this.all<JournalRecord>('SELECT * FROM journals ORDER BY date_str DESC');
  }

  public async getJournalByDate(dateStr: string): Promise<JournalRecord | undefined> {
    return this.get<JournalRecord>('SELECT * FROM journals WHERE date_str = ?', [dateStr]);
  }

  public async saveJournal(journal: Omit<JournalRecord, 'created_at' | 'updated_at'>): Promise<void> {
    await this.run(
      `INSERT INTO journals (id, date_str, title, content_tex, tags_json)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(date_str) DO UPDATE SET
         title = excluded.title,
         content_tex = excluded.content_tex,
         tags_json = excluded.tags_json,
         updated_at = CURRENT_TIMESTAMP`,
      [journal.id, journal.date_str, journal.title, journal.content_tex, journal.tags_json]
    );
  }

  public async deleteJournal(id: string): Promise<void> {
    await this.run('DELETE FROM journals WHERE id = ?', [id]);
  }

  // --- Project Chat Messages & Context ---
  public async listProjectChats(projectId: string): Promise<ProjectChatRecord[]> {
    return this.all<ProjectChatRecord>(
      'SELECT * FROM project_chats WHERE project_id = ? ORDER BY created_at ASC',
      [projectId]
    );
  }

  public async saveProjectChat(chat: Omit<ProjectChatRecord, 'created_at'>): Promise<void> {
    await this.run(
      'INSERT INTO project_chats (id, project_id, role, content, model, intent) VALUES (?, ?, ?, ?, ?, ?)',
      [chat.id, chat.project_id, chat.role, chat.content, chat.model || null, chat.intent || 'ask']
    );
  }

  public async clearProjectChats(projectId: string): Promise<void> {
    await this.run('DELETE FROM project_chats WHERE project_id = ?', [projectId]);
  }
}
