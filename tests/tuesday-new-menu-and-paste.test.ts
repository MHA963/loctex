import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fastify, PROJECTS_DIR } from '../server/index.ts';
import { normalizeNewFileName } from '../src/components/Sidebar.tsx';
import { buildPastedImageLatexSnippet, isRawSvgMarkup } from '../src/components/EditorPane.tsx';

describe('Day 2 (Tuesday) — +New Menu (.tex, .bib, Upload Image) & Clipboard Image/SVG Paste', () => {
  let testProjectId = '';
  let testProjectDir = '';

  beforeAll(async () => {
    await fastify.ready();
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'Tuesday Upload & Paste Test Project', template: 'article' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    testProjectId = body.id;
    testProjectDir = path.resolve(PROJECTS_DIR, testProjectId);
  });

  afterAll(async () => {
    try {
      if (testProjectId) {
        await fastify.inject({
          method: 'DELETE',
          url: `/api/projects/${testProjectId}`,
        });
      }
      if (fs.existsSync(testProjectDir)) {
        fs.rmSync(testProjectDir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  });

  describe('1. Left Panel +New Menu Filename Normalization & Starter Templates', () => {
    it('normalizes new .tex and .bib filenames and enforces extensions', () => {
      expect(normalizeNewFileName('methodology', 'tex')).toBe('methodology.tex');
      expect(normalizeNewFileName('chapters/intro.tex', 'tex')).toBe('chapters/intro.tex');
      expect(normalizeNewFileName('', 'tex')).toBe('section.tex');

      expect(normalizeNewFileName('citations', 'bib')).toBe('citations.bib');
      expect(normalizeNewFileName('refs.BIB', 'bib')).toBe('refs.BIB');
      expect(normalizeNewFileName('   ', 'bib')).toBe('references.bib');
    });

    it('creates new .tex and .bib files with valid starter templates via POST /api/projects/:id/file/create', async () => {
      const texRes = await fastify.inject({
        method: 'POST',
        url: `/api/projects/${testProjectId}/file/create`,
        payload: { path: 'chapters/experiment.tex' },
      });
      expect(texRes.statusCode).toBe(200);
      const savedTex = fs.readFileSync(path.resolve(testProjectDir, 'chapters/experiment.tex'), 'utf-8');
      expect(savedTex).toContain('\\section{New Section}');

      const bibRes = await fastify.inject({
        method: 'POST',
        url: `/api/projects/${testProjectId}/file/create`,
        payload: { path: 'bibliography.bib' },
      });
      expect(bibRes.statusCode).toBe(200);
      const savedBib = fs.readFileSync(path.resolve(testProjectDir, 'bibliography.bib'), 'utf-8');
      expect(savedBib).toContain('@article{reference2026');
    });
  });

  describe('2. Binary Image & Vector SVG Upload API (POST /api/projects/:id/asset)', () => {
    it('uploads a Base64 PNG image (with data URL prefix) into figures/ and streams it back', async () => {
      const samplePngBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const uploadRes = await fastify.inject({
        method: 'POST',
        url: `/api/projects/${testProjectId}/asset`,
        payload: {
          path: 'figures/uploaded_chart.png',
          base64Data: samplePngBase64,
        },
      });
      expect(uploadRes.statusCode).toBe(200);
      const uploadData = uploadRes.json();
      expect(uploadData.success).toBe(true);
      expect(uploadData.path).toBe('figures/uploaded_chart.png');
      expect(uploadData.sizeBytes).toBeGreaterThan(0);

      const getRes = await fastify.inject({
        method: 'GET',
        url: `/api/projects/${testProjectId}/asset?path=${encodeURIComponent('figures/uploaded_chart.png')}`,
      });
      expect(getRes.statusCode).toBe(200);
      expect(getRes.headers['content-type']).toBe('image/png');
    });

    it('uploads raw SVG markup via POST /api/projects/:id/asset and persists vector file', async () => {
      const rawSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#d4af37"/></svg>';

      const uploadRes = await fastify.inject({
        method: 'POST',
        url: `/api/projects/${testProjectId}/asset`,
        payload: {
          path: 'figures/pasted_vector.svg',
          svgContent: rawSvg,
        },
      });
      expect(uploadRes.statusCode).toBe(200);
      expect(uploadRes.json().path).toBe('figures/pasted_vector.svg');

      const diskSvg = fs.readFileSync(path.resolve(testProjectDir, 'figures/pasted_vector.svg'), 'utf-8');
      expect(diskSvg).toBe(rawSvg);
    });

    it('rejects directory traversal on POST /api/projects/:id/asset with 403', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: `/api/projects/${testProjectId}/asset`,
        payload: {
          path: '../outside.png',
          base64Data: 'aGVsbG8=',
        },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('3. Code Editor Clipboard Screenshot & SVG Paste Helpers', () => {
    it('detects standalone <svg>...</svg> markup and ignores normal LaTeX prose', () => {
      expect(
        isRawSvgMarkup('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0L10 10"/></svg>')
      ).toBe(true);
      expect(
        isRawSvgMarkup('<?xml version="1.0" encoding="UTF-8"?>\n<svg width="20" height="20"><circle r="5"/></svg>')
      ).toBe(true);
      expect(isRawSvgMarkup('\\section{Introduction}\nThis is normal LaTeX text.')).toBe(false);
    });

    it('builds a complete LaTeX figure environment snippet for pasted images and SVGs', () => {
      const snippet = buildPastedImageLatexSnippet('figures\\pasted_1792400000.png');
      expect(snippet).toContain('\\begin{figure}[htbp]');
      expect(snippet).toContain('\\includegraphics[width=0.8\\linewidth,keepaspectratio]{figures/pasted_1792400000.png}');
      expect(snippet).toContain('\\label{fig:pasted_1792400000}');
      expect(snippet).toContain('\\end{figure}');
    });
  });
});
