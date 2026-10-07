import { describe, it, expect } from 'vitest';
import { ZipService } from '../server/services/zip-service.ts';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

describe('ZipService Tests', () => {
  const testDir = path.resolve(process.cwd(), 'loctex_data', 'test_zip_import');

  it('should unpack an Overleaf-style ZIP file and detect main.tex', async () => {
    const mockZip = new JSZip();
    mockZip.file('main.tex', '\\documentclass{article}\n\\begin{document}\nHello Overleaf\n\\end{document}');
    mockZip.file('figures/plot.png', 'fake-image-bytes');
    mockZip.file('references.bib', '@article{test, title={Paper}}');

    const zipBuffer = await mockZip.generateAsync({ type: 'nodebuffer' });

    const result = await ZipService.unpackZip(zipBuffer, testDir);
    expect(result.mainFile).toBe('main.tex');
    expect(result.fileList).toContain('main.tex');
    expect(result.fileList).toContain('references.bib');

    expect(fs.existsSync(path.resolve(testDir, 'main.tex'))).toBe(true);
    expect(fs.existsSync(path.resolve(testDir, 'figures', 'plot.png'))).toBe(true);

    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should pack a project directory into a ZIP archive', async () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.resolve(testDir, 'paper.tex'), '\\begin{document}Testing export\\end{document}');

    const zipBuffer = await ZipService.packProject(testDir);
    expect(zipBuffer).toBeDefined();

    const readZip = await JSZip.loadAsync(zipBuffer);
    expect(readZip.file('paper.tex')).toBeDefined();

    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
  });
});
