import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { LocTexDatabase } from '../server/db/database.ts';

describe('Desktop Packaging & Isolation Tests', () => {
  const testDataDir = path.join(os.tmpdir(), `loctex-desktop-test-${Date.now()}`);

  beforeAll(() => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  it('should isolate SQLite database and schema inside custom LOCTEX_DATA_DIR', async () => {
    const customDbPath = path.join(testDataDir, 'loctex.db');
    const db = new LocTexDatabase(customDbPath);

    await new Promise((r) => setTimeout(r, 100));

    expect(fs.existsSync(customDbPath)).toBe(true);

    await db.createProject({
      id: 'desktop-proj-01',
      name: 'Desktop Isolated Research',
      root_path: path.join(testDataDir, 'projects', 'desktop-proj-01'),
      active_file: 'main.tex',
      settings_json: JSON.stringify({ theme: 'dark-gold' }),
    });

    const project = await db.getProject('desktop-proj-01');
    expect(project).toBeDefined();
    expect(project?.name).toBe('Desktop Isolated Research');

    await db.close();
  });

  it('should validate electron-builder.json configuration file', () => {
    const configPath = path.resolve(process.cwd(), 'electron-builder.json');
    expect(fs.existsSync(configPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    expect(config.appId).toBe('com.loctex.desktop');
    expect(config.productName).toBe('LocTex');

    const targets = config.win.target.map((t: any) => t.target);
    expect(targets).toContain('nsis');
    expect(targets).toContain('portable');
    expect(config.nsis.createDesktopShortcut).toBe(true);
  });

  it('should verify Electron entry point files exist and are valid CommonJS', () => {
    const mainPath = path.resolve(process.cwd(), 'electron', 'main.cjs');
    const preloadPath = path.resolve(process.cwd(), 'electron', 'preload.cjs');

    expect(fs.existsSync(mainPath)).toBe(true);
    expect(fs.existsSync(preloadPath)).toBe(true);

    const mainContent = fs.readFileSync(mainPath, 'utf-8');
    expect(mainContent).toContain('window:minimize');
    expect(mainContent).toContain('window:maximize');
    expect(mainContent).toContain('window:close');
    expect(mainContent).toContain('LOCTEX_DATA_DIR');

    const preloadContent = fs.readFileSync(preloadPath, 'utf-8');
    expect(preloadContent).toContain('contextBridge.exposeInMainWorld');
    expect(preloadContent).toContain('electronAPI');
  });

  it('should verify package.json main entry points to electron/main.cjs', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.main).toBe('electron/main.cjs');
    expect(pkg.scripts['electron:dev']).toBeDefined();
    expect(pkg.scripts['dist:win']).toBeDefined();
  });
});
