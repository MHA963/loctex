import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fastify, PROJECTS_DIR } from '../server/index.ts';
import { TectonicRunner } from '../server/compiler/tectonic-runner.ts';
import { LaTeXErrorParser } from '../server/compiler/error-parser.ts';
import { clampTextItemToViewport, matchPdfTextToTexLine } from '../src/components/PdfCanvas.tsx';
import {
  getAssetCategory,
  isPreviewableAsset,
  buildIncludeGraphicsSnippet,
} from '../src/components/AssetPreviewPane.tsx';

describe('Day 1 (Monday) — Manual Compile, PDF Boundary Limits & Asset Viewer', () => {
  let testProjectId = '';
  let testProjectDir = '';

  beforeAll(async () => {
    await fastify.ready();
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'Monday Asset & Boundary Test Project', template: 'article' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    testProjectId = body.id;
    testProjectDir = path.resolve(PROJECTS_DIR, testProjectId);
  });

  describe('1. Asset Classification & LaTeX Snippet Generation (AssetPreviewPane)', () => {
    it('classifies images, SVGs, and PDFs as previewable assets and excludes .tex/.bib/.zip', () => {
      expect(getAssetCategory('figures/plot.png')).toBe('image');
      expect(getAssetCategory('photo.JPG')).toBe('image');
      expect(getAssetCategory('diagram.webp')).toBe('image');
      expect(getAssetCategory('vector/arch.svg')).toBe('svg');
      expect(getAssetCategory('appendix/paper.pdf')).toBe('pdf');
      expect(getAssetCategory('main.tex')).toBeNull();
      expect(getAssetCategory('references.bib')).toBeNull();

      expect(isPreviewableAsset('figures/plot.png')).toBe(true);
      expect(isPreviewableAsset('vector/arch.svg')).toBe(true);
      expect(isPreviewableAsset('appendix/paper.pdf')).toBe(true);
      expect(isPreviewableAsset('main.tex')).toBe(false);
    });

    it('generates normalized \\includegraphics snippet with width and aspect-ratio bounds', () => {
      expect(buildIncludeGraphicsSnippet('figures\\diagram.png')).toBe(
        '\\includegraphics[width=0.8\\linewidth,keepaspectratio]{figures/diagram.png}'
      );
    });
  });

  describe('2. Backend Binary & Vector Asset Streaming (GET /api/projects/:id/asset)', () => {
    it('streams PNG, SVG, and PDF assets with accurate Content-Type headers', async () => {
      const pngDir = path.resolve(testProjectDir, 'figures');
      fs.mkdirSync(pngDir, { recursive: true });

      // 1x1 transparent PNG bytes
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(path.resolve(pngDir, 'sample.png'), pngBuffer);

      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
      fs.writeFileSync(path.resolve(pngDir, 'diagram.svg'), svgContent, 'utf-8');

      const pdfStub = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'utf-8');
      fs.writeFileSync(path.resolve(pngDir, 'supp.pdf'), pdfStub);

      const pngRes = await fastify.inject({
        method: 'GET',
        url: `/api/projects/${testProjectId}/asset?path=${encodeURIComponent('figures/sample.png')}`,
      });
      expect(pngRes.statusCode).toBe(200);
      expect(pngRes.headers['content-type']).toBe('image/png');
      expect(Buffer.compare(pngRes.rawPayload, pngBuffer)).toBe(0);

      const svgRes = await fastify.inject({
        method: 'GET',
        url: `/api/projects/${testProjectId}/asset?path=${encodeURIComponent('figures/diagram.svg')}`,
      });
      expect(svgRes.statusCode).toBe(200);
      expect(svgRes.headers['content-type']).toBe('image/svg+xml');
      expect(svgRes.body).toContain('<circle cx="50" cy="50" r="40"/>');

      const pdfRes = await fastify.inject({
        method: 'GET',
        url: `/api/projects/${testProjectId}/asset?path=${encodeURIComponent('figures/supp.pdf')}`,
      });
      expect(pdfRes.statusCode).toBe(200);
      expect(pdfRes.headers['content-type']).toBe('application/pdf');
    });

    it('blocks directory traversal attempts on /api/projects/:id/asset with 403', async () => {
      const res = await fastify.inject({
        method: 'GET',
        url: `/api/projects/${testProjectId}/asset?path=${encodeURIComponent('../../package.json')}`,
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('3. PDF Page Boundary Limits & Viewport Text Overlay Clamping', () => {
    it('clamps PDF text item overlay coordinates strictly within [0, pageWidth] x [0, pageHeight]', () => {
      // Normal in-bounds item
      const inside = clampTextItemToViewport(50, 100, 120, 14, 600, 800);
      expect(inside).toEqual({ left: 50, top: 100, width: 120, height: 14 });

      // Item extending beyond right margin (520 + 180 = 700 > 600)
      const rightOverflow = clampTextItemToViewport(520, 100, 180, 14, 600, 800);
      expect(rightOverflow).not.toBeNull();
      expect(rightOverflow!.left + rightOverflow!.width).toBeLessThanOrEqual(600);

      // Item with negative left/top coordinates
      const negCoords = clampTextItemToViewport(-15, -8, 90, 16, 600, 800);
      expect(negCoords).not.toBeNull();
      expect(negCoords!.left).toBeGreaterThanOrEqual(0);
      expect(negCoords!.top).toBeGreaterThanOrEqual(0);

      // Completely out-of-bounds item beyond page width
      const outside = clampTextItemToViewport(610, 100, 50, 14, 600, 800);
      expect(outside).toBeNull();
    });

    it('injects non-destructive TeX line-breaking boundary limits via TectonicRunner.ensurePageBoundaryLimits', () => {
      const rawTex = '\\documentclass{article}\n\\begin{document}\nHello world\n\\end{document}';
      const guarded = TectonicRunner.ensurePageBoundaryLimits(rawTex);
      expect(guarded).toContain('\\emergencystretch=3em\\tolerance=1000\\hbadness=10000');
      // Idempotent on second call
      expect(TectonicRunner.ensurePageBoundaryLimits(guarded)).toBe(guarded);
    });

    it('parses Overfull \\hbox log warnings and provides a margin boundary quickFix', () => {
      const log = 'Overfull \\hbox (28.45274pt too wide) in paragraph at lines 42--45';
      const diags = LaTeXErrorParser.parse(log, 'main.tex');
      expect(diags.length).toBe(1);
      expect(diags[0].line).toBe(42);
      expect(diags[0].severity).toBe('warning');
      expect(diags[0].quickFix?.payload).toContain('\\emergencystretch=3em');
    });

    it('matches clicked PDF text to source lines even when wrapped in LaTeX formatting macros', () => {
      const sampleTex = [
        '\\documentclass{article}',
        '\\begin{document}',
        '\\section{Methodology and Evaluation}',
        'In this paper we introduce \\textbf{autonomous compilation limits} for scientific documents.',
        '\\end{document}',
      ].join('\n');

      expect(matchPdfTextToTexLine('Methodology and Evaluation', sampleTex)).toBe(3);
      expect(matchPdfTextToTexLine('introduce autonomous compilation limits for', sampleTex)).toBe(4);
    });
  });
});
