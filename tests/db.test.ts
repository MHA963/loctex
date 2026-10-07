import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LocTexDatabase } from '../server/db/database.ts';

describe('LocTex SQLite Database Tests', () => {
  let db: LocTexDatabase;

  beforeAll(async () => {
    db = new LocTexDatabase(':memory:');
    // Wait a brief moment for schema init
    await new Promise((r) => setTimeout(r, 100));
  });

  afterAll(async () => {
    await db.close();
  });

  it('should create and retrieve a project', async () => {
    await db.createProject({
      id: 'proj-001',
      name: 'Quantum Optics Paper',
      root_path: '/data/projects/quantum_optics',
      active_file: 'main.tex',
      settings_json: JSON.stringify({ theme: 'dark-gold', fontSize: '11pt' }),
    });

    const project = await db.getProject('proj-001');
    expect(project).toBeDefined();
    expect(project?.name).toBe('Quantum Optics Paper');
    expect(project?.active_file).toBe('main.tex');
  });

  it('should create and list snapshots', async () => {
    await db.createProject({
      id: 'proj-002',
      name: 'Methods Study',
      root_path: '/data/projects/methods',
      active_file: 'main.tex',
      settings_json: '{}',
    });

    await db.createSnapshot({
      id: 'snap-001',
      project_id: 'proj-002',
      version_tag: 'v1.0',
      summary: 'Initial submission draft',
      file_tree_json: JSON.stringify(['main.tex', 'references.bib']),
    });

    const snapshots = await db.listSnapshots('proj-002');
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].version_tag).toBe('v1.0');
  });

  it('should save and upsert journal entries', async () => {
    await db.saveJournal({
      id: 'jour-001',
      date_str: '2026-10-07',
      title: 'Quantum Field Notes',
      content_tex: 'Explored path integrals with $S[\\phi]$.',
      tags_json: JSON.stringify(['physics', 'literature']),
    });

    const entry = await db.getJournalByDate('2026-10-07');
    expect(entry).toBeDefined();
    expect(entry?.title).toBe('Quantum Field Notes');
    expect(entry?.content_tex).toContain('path integrals');
  });
});
