import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { LocTexDatabase } from './db/database.ts';
import { TectonicRunner } from './compiler/tectonic-runner.ts';
import { ZipService } from './services/zip-service.ts';
import { SyncTeXParser } from './services/synctex-parser.ts';
import { OllamaQwenService } from './services/ollama-service.ts';
import {
  AIChatRequest,
  AIDiagnosticFixRequest,
  AIFastEditRequest,
  QwenModelId,
} from '../src/types/index.ts';

const fastify = Fastify({ logger: true, bodyLimit: 50 * 1024 * 1024 });

const LOCTEX_DATA_DIR = process.env.LOCTEX_DATA_DIR || path.resolve(process.cwd(), 'loctex_data');
const PROJECTS_DIR = path.resolve(LOCTEX_DATA_DIR, 'projects');

if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

const db = new LocTexDatabase(path.resolve(LOCTEX_DATA_DIR, 'loctex.db'));
const compiler = new TectonicRunner();
const aiService = new OllamaQwenService();

await fastify.register(cors, { origin: true });
await fastify.register(websocket);

// Health check
fastify.get('/api/health', async () => {
  return { 
    status: 'healthy', 
    timestamp: new Date().toISOString(), 
    app: 'LocTex',
    dataDir: LOCTEX_DATA_DIR,
    production: process.env.NODE_ENV === 'production'
  };
});

// --- Projects API ---
fastify.get('/api/projects', async () => {
  const projects = await db.listProjects();
  return { projects };
});

fastify.get('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) {
    return reply.status(404).send({ error: 'Project not found' });
  }
  return { project };
});

fastify.post('/api/projects', async (request) => {
  const body = request.body as { name?: string; template?: string };
  const id = `proj-${Date.now()}`;
  const name = body.name || 'Untitled Document';
  const template = body.template || 'article';
  const projectDir = path.resolve(PROJECTS_DIR, id);

  fs.mkdirSync(projectDir, { recursive: true });

  let mainTexContent = '';

  if (template === 'ieeetran') {
    mainTexContent = `\\documentclass[journal]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{cite}
\\usepackage{url}

\\begin{document}

\\title{${name}}

\\author{LocTex~Researcher,~\IEEEmembership{Member,~IEEE}
\\thanks{Manuscript created in LocTex, the offline-first personal LaTeX research studio.}}

\\markboth{IEEE Transactions on Research,~Vol.~1, No.~1, \\today}%
{LocTex Researcher: ${name}}

\\maketitle

\\begin{abstract}
This research document demonstrates the IEEEtran journal format compiled locally with LocTex. It features two-column typesetting, mathematical formulations, and vector graphics support.
\\end{abstract}

\\begin{IEEEkeywords}
LaTeX, IEEEtran, Offline Compilation, Scientific Publishing, LocTex.
\\end{IEEEkeywords}

\\section{Introduction}
\\IEEEPARstart{W}{elcome} to your new IEEEtran paper. With LocTex, you have zero cloud latency, instant source synchronization, and complete offline privacy.

\\begin{equation}
\\label{eq:sample_ieee}
\\mathcal{L}(\\theta) = \\frac{1}{N} \\sum_{i=1}^N \\| y_i - f(x_i; \\theta) \\|_2^2 + \\lambda \\| \\theta \\|_2^2
\\end{equation}

\\section{Methodology}
As formulated in Equation~\\eqref{eq:sample_ieee}, we evaluate the objective across benchmark datasets.

\\section{Conclusion}
This IEEEtran starter is ready for your journal or conference submission.

\\end{document}
`;
  } else if (template === 'beamer') {
    mainTexContent = `\\documentclass{beamer}
\\usetheme{Madrid}
\\usecolortheme{beaver}

\\title[${name}]{${name}}
\\subtitle{Research Presentation Deck}
\\author{LocTex Researcher}
\\institute{Academic Research Lab}
\\date{\\today}

\\begin{document}

\\begin{frame}
  \\titlepage
\\end{frame}

\\begin{frame}{Outline}
  \\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}{Problem Formulation}
  \\begin{itemize}
    \\item Cloud-based LaTeX tools require internet connection and monthly subscriptions.
    \\item LocTex provides a zero-latency, local-first compiling engine.
    \\item Native vector PDF rendering with synchronized source tracking.
  \\end{itemize}
\\end{frame}

\\section{Core Results}
\\begin{frame}{Key Mathematical Findings}
  \\begin{block}{Theorem 1 (Linear Convergence)}
    For learning rate $\\eta \\in (0, 2/\\lambda_{\\max})$, the error decays exponentially:
    \\[
      \\| \\theta_{t} - \\theta^* \\| \\le (1 - \\eta \\mu)^t \\| \\theta_0 - \\theta^* \\|
    \\]
  \\end{block}
\\end{frame}

\\section{Summary}
\\begin{frame}{Conclusion \\& Next Steps}
  \\begin{enumerate}
    \\item Rapid offline authoring and instant compilation.
    \\item Full TeX Live and Tectonic capability directly on your machine.
  \\end{enumerate}
\\end{frame}

\\end{document}
`;
  } else if (template === 'cv') {
    mainTexContent = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}
\\titlespacing{\\section}{0pt}{10pt}{4pt}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
  {\\Huge \\textbf{Alex Morgan, Ph.D.}}\\\\[4pt]
  \\small researcher@university.edu \\quad | \\quad +1 (555) 019-2834 \\quad | \\quad github.com/alexmorgan
\\end{center}

\\section{Education}
\\textbf{Ph.D. in Computer Science} \\hfill 2021 -- 2025\\\\
\\textit{Aarhus University, Denmark} \\\\
Specialization: Machine Learning Systems and Compiler Optimizations.

\\vspace{4pt}
\\textbf{B.S. in Software Engineering} \\hfill 2017 -- 2021\\\\
\\textit{University of Copenhagen} -- First Class Honours.

\\section{Experience}
\\textbf{Lead Research Engineer} \\hfill 2025 -- Present\\\\
\\textit{LocTex Research Lab}
\\begin{itemize}[noitemsep,topsep=0pt]
  \\item Architected offline-first LaTeX compiler pipeline with sub-second feedback loops.
  \\item Implemented vector PDF text layer synchronization and bidirectional source jumping.
\\end{itemize}

\\section{Selected Publications}
\\begin{itemize}[noitemsep,topsep=0pt]
  \\item A. Morgan et al., \`\`Ultra-High-Gradient Quantization for Mobile Edge Detection,'' \\textit{IEEE Trans. Neural Netw.}, 2026.
\\end{itemize}

\\section{Technical Skills}
\\textbf{Languages \\& Frameworks:} Python, PyTorch, C++, TypeScript, Rust, LaTeX, Fastify, React.

\\end{document}
`;
  } else {
    // Standard Academic Article
    mainTexContent = `\\documentclass[11pt]{article}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\usepackage{cite}
\\usepackage{hyperref}
\\geometry{margin=1in}

\\title{${name}}
\\author{LocTex Researcher}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This document was created in LocTex, the personal offline-first research and journaling workspace.
\\end{abstract}

\\section{Introduction}
Welcome to your new document. You can edit text directly on the compiled view or in the code editor with live synchronized jumping.

\\begin{equation}
\\label{eq:main}
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\end{equation}

\\section{Methodology}
Write your research equations, theorems, and notes here. As illustrated in Equation~\\eqref{eq:main}, Gaussian integration forms the basis of diffusion models.

\\section{Conclusion}
LocTex provides a distraction-free, reliable LaTeX environment.

\\end{document}
`;
  }

  fs.writeFileSync(path.resolve(projectDir, 'main.tex'), mainTexContent, 'utf-8');

  // Provide a starter references.bib
  const defaultBib = `@article{loctex2026,
  author    = {LocTex Authors},
  title     = {Offline-First LaTeX Studio and Journaling Workspace},
  journal   = {Journal of Reproducible Research},
  year      = {2026},
  volume    = {1},
  pages     = {1--10}
}
`;
  fs.writeFileSync(path.resolve(projectDir, 'references.bib'), defaultBib, 'utf-8');

  await db.createProject({
    id,
    name,
    root_path: projectDir,
    active_file: 'main.tex',
    settings_json: JSON.stringify({ theme: 'dark-gold', fontFamily: 'Serif', fontSize: '11pt' }),
  });

  // Auto-compile starter template immediately so PDF is available
  try {
    await compiler.compile(projectDir, 'main.tex');
  } catch (err) {
    console.warn('Initial project compile warning:', err);
  }

  return { id, name, root_path: projectDir, active_file: 'main.tex' };
});

fastify.patch('/api/projects/:id', async (request) => {
  const { id } = request.params as { id: string };
  const body = request.body as { name?: string; active_file?: string; settings_json?: string };
  await db.updateProject(id, body);
  return { success: true };
});

fastify.delete('/api/projects/:id', async (request) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (project && fs.existsSync(project.root_path)) {
    fs.rmSync(project.root_path, { recursive: true, force: true });
  }
  await db.deleteProject(id);
  return { success: true };
});

// --- ZIP Import / Export API ---
fastify.post('/api/projects/import-zip', async (request) => {
  const body = request.body as { name?: string; base64Zip: string };
  const id = `proj-${Date.now()}`;
  const name = body.name || 'Imported Overleaf Project';
  const projectDir = path.resolve(PROJECTS_DIR, id);

  const zipBuffer = Buffer.from(body.base64Zip, 'base64');
  const { mainFile } = await ZipService.unpackZip(zipBuffer, projectDir);

  await db.createProject({
    id,
    name,
    root_path: projectDir,
    active_file: mainFile,
    settings_json: JSON.stringify({ theme: 'dark-gold', fontFamily: 'Serif', fontSize: '11pt' }),
  });

  return { id, name, root_path: projectDir, active_file: mainFile };
});

fastify.get('/api/projects/:id/export-zip', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project || !fs.existsSync(project.root_path)) {
    return reply.status(404).send({ error: 'Project not found' });
  }

  const zipBuffer = await ZipService.packProject(project.root_path);
  reply.header('Content-Type', 'application/zip');
  reply.header('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip"`);
  return reply.send(zipBuffer);
});

fastify.get('/api/projects/:id/export-pdf', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  const baseName = path.basename(project.active_file, path.extname(project.active_file));
  const pdfPath = path.resolve(project.root_path, `${baseName}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    await compiler.compile(project.root_path, project.active_file);
  }

  if (!fs.existsSync(pdfPath)) {
    return reply.status(404).send({ error: 'Compiled PDF not available' });
  }

  const pdfData = fs.readFileSync(pdfPath);
  reply.header('Content-Type', 'application/pdf');
  reply.header('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`);
  return reply.send(pdfData);
});

fastify.get('/api/projects/:id/pdf', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  const baseName = path.basename(project.active_file, path.extname(project.active_file));
  const pdfPath = path.resolve(project.root_path, `${baseName}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    await compiler.compile(project.root_path, project.active_file);
  }

  if (fs.existsSync(pdfPath)) {
    const pdfData = fs.readFileSync(pdfPath);
    reply.header('Content-Type', 'application/pdf');
    reply.header('Cache-Control', 'no-cache');
    return reply.send(pdfData);
  }

  return reply.status(404).send({ error: 'PDF not generated yet' });
});

// --- Project Files CRUD API ---
fastify.get('/api/projects/:id/files', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project || !fs.existsSync(project.root_path)) return reply.status(404).send({ error: 'Project not found' });

  const getTree = (dir: string, base: string): any[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((e) => !e.name.startsWith('.') && !e.name.endsWith('.synctex.gz') && !e.name.endsWith('.aux') && !e.name.endsWith('.fls') && !e.name.endsWith('.fdb_latexmk'))
      .map((entry) => {
        const full = path.resolve(dir, entry.name);
        const rel = path.relative(base, full).replace(/\\/g, '/');
        if (entry.isDirectory()) {
          return { name: entry.name, path: rel, isDirectory: true, children: getTree(full, base) };
        }
        return { name: entry.name, path: rel, isDirectory: false };
      });
  };

  const files = getTree(project.root_path, project.root_path);
  return { files };
});

function resolveContainedPath(projectRoot: string, targetPath: string): string {
  const root = path.resolve(projectRoot);
  const clean = (targetPath || '').trim();
  if (!clean || clean === '.' || clean === './' || clean === '.\\') {
    throw new Error('Access denied: Target path must not be root directory');
  }
  const fullPath = path.resolve(root, clean);
  const rel = path.relative(root, fullPath);
  if (rel.startsWith('..') || path.isAbsolute(rel) || rel === '') {
    throw new Error('Access denied: Directory traversal forbidden');
  }
  return fullPath;
}

fastify.get('/api/projects/:id/file', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { path: relPath } = request.query as { path: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  let fullPath: string;
  try {
    fullPath = resolveContainedPath(project.root_path, relPath || project.active_file || 'main.tex');
  } catch {
    return reply.status(403).send({ error: 'Access denied: Directory traversal forbidden' });
  }

  if (!fs.existsSync(fullPath)) {
    return reply.status(404).send({ error: 'File not found' });
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  return { content };
});

const ASSET_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
};

fastify.get('/api/projects/:id/asset', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { path: relPath } = request.query as { path: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  let fullPath: string;
  try {
    fullPath = resolveContainedPath(project.root_path, relPath);
  } catch {
    return reply.status(403).send({ error: 'Access denied: Directory traversal forbidden' });
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    return reply.status(404).send({ error: 'Asset not found' });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const mimeType = ASSET_MIME_TYPES[ext] || 'application/octet-stream';
  const buffer = fs.readFileSync(fullPath);

  reply.header('Content-Type', mimeType);
  reply.header('Content-Length', buffer.length);
  reply.header('Cache-Control', 'no-cache');
  return reply.send(buffer);
});

fastify.post('/api/projects/:id/asset', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = (request.body || {}) as {
    path?: string;
    base64Data?: string;
    svgContent?: string;
  };

  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  const requestedPath = (body.path || '').trim().replace(/\\/g, '/');
  if (!requestedPath) {
    return reply.status(400).send({ error: 'Target asset path is required' });
  }

  let fullPath: string;
  try {
    fullPath = resolveContainedPath(project.root_path, requestedPath);
  } catch {
    return reply.status(403).send({ error: 'Access denied: Directory traversal forbidden' });
  }

  let buffer: Buffer;
  if (typeof body.svgContent === 'string' && body.svgContent.trim().length > 0) {
    buffer = Buffer.from(body.svgContent, 'utf-8');
  } else if (typeof body.base64Data === 'string' && body.base64Data.trim().length > 0) {
    const cleanBase64 = body.base64Data.replace(/^data:[^;]+;base64,/, '');
    buffer = Buffer.from(cleanBase64, 'base64');
  } else {
    return reply.status(400).send({ error: 'Either base64Data or svgContent must be provided' });
  }

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, buffer);

  const normalizedRelPath = path.relative(project.root_path, fullPath).replace(/\\/g, '/');
  return {
    success: true,
    path: normalizedRelPath,
    sizeBytes: buffer.length,
  };
});

fastify.post('/api/projects/:id/file', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as { path: string; content: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  let fullPath: string;
  try {
    fullPath = resolveContainedPath(project.root_path, body.path);
  } catch {
    return reply.status(403).send({ error: 'Access denied: Directory traversal forbidden' });
  }

  // Guard against overwriting binary files (images, pdfs) with UTF-8 strings
  const ext = path.extname(body.path).toLowerCase();
  const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.gz', '.ico', '.svgz'];
  if (binaryExtensions.includes(ext)) {
    return { success: true, isBinary: true, skipped: true };
  }

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, body.content, 'utf-8');

  return { success: true };
});

fastify.post('/api/projects/:id/file/create', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as { path: string; isDirectory?: boolean; initialContent?: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  let fullPath: string;
  try {
    fullPath = resolveContainedPath(project.root_path, body.path);
  } catch {
    return reply.status(403).send({ error: 'Access denied: Directory traversal forbidden' });
  }

  if (body.isDirectory) {
    fs.mkdirSync(fullPath, { recursive: true });
  } else {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const isBibFile = body.path.toLowerCase().endsWith('.bib');
    const defaultStarterContent = isBibFile
      ? `@article{reference2026,\n  author  = {Author Name},\n  title   = {Research Article Title},\n  journal = {Journal of Reproducible Research},\n  year    = {2026}\n}\n`
      : `% ${body.path}\n\\section{New Section}\n\n`;
    fs.writeFileSync(fullPath, body.initialContent ?? defaultStarterContent, 'utf-8');
  }

  return { success: true, path: body.path };
});

fastify.delete('/api/projects/:id/file', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { path: relPath } = request.query as { path: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  let fullPath: string;
  try {
    fullPath = resolveContainedPath(project.root_path, relPath);
  } catch {
    return reply.status(403).send({ error: 'Access denied: Directory traversal forbidden' });
  }

  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }

  return { success: true };
});

// --- Compilation & SyncTeX API ---
fastify.post('/api/projects/:id/compile', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = (request.body || {}) as { content?: string; activeFile?: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  const activeFile = body.activeFile || project.active_file || 'main.tex';
  let fullMainPath: string;
  try {
    fullMainPath = resolveContainedPath(project.root_path, activeFile);
  } catch {
    return reply.status(403).send({ error: 'Access denied: Directory traversal forbidden' });
  }

  // If content was passed, save it first
  if (body.content !== undefined) {
    fs.writeFileSync(fullMainPath, body.content, 'utf-8');
  }

  const result = await compiler.compile(project.root_path, activeFile);
  return result;
});

fastify.get('/api/projects/:id/synctex', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });

  const baseName = path.basename(project.active_file, path.extname(project.active_file));
  const synctexGz = path.resolve(project.root_path, `${baseName}.synctex.gz`);
  const synctexPlain = path.resolve(project.root_path, `${baseName}.synctex`);

  const targetPath = fs.existsSync(synctexGz) ? synctexGz : synctexPlain;
  const boxes = SyncTeXParser.parse(targetPath);
  return { boxes };
});

// --- Project Chat Persistence API ---
fastify.get('/api/projects/:id/chat', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });
  const messages = await db.listProjectChats(id);
  return { messages };
});

fastify.post('/api/projects/:id/chat', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });
  const body = (request.body || {}) as {
    id?: string;
    role?: 'user' | 'assistant' | 'system';
    content?: string;
    model?: string;
    intent?: string;
  };

  if (!body.role || !body.content) {
    return reply.status(400).send({ error: 'Missing role or content' });
  }

  const messageId = body.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await db.saveProjectChat({
    id: messageId,
    project_id: id,
    role: body.role,
    content: body.content,
    model: body.model,
    intent: body.intent,
  });

  return { success: true, messageId };
});

fastify.delete('/api/projects/:id/chat', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) return reply.status(404).send({ error: 'Project not found' });
  await db.clearProjectChats(id);
  return { success: true };
});

// --- Daily Journals API ---
fastify.get('/api/journals', async () => {
  const journals = await db.listJournals();
  return { journals };
});

fastify.get('/api/journals/:dateStr', async (request) => {
  const { dateStr } = request.params as { dateStr: string };
  const entry = await db.getJournalByDate(dateStr);
  return { entry };
});

fastify.post('/api/journals', async (request) => {
  const body = request.body as { date_str: string; title: string; content_tex: string; tags: string[] };
  const id = `jour-${body.date_str}`;
  await db.saveJournal({
    id,
    date_str: body.date_str,
    title: body.title,
    content_tex: body.content_tex,
    tags_json: JSON.stringify(body.tags || []),
  });
  return { success: true, id };
});

// --- Local AI (Qwen 2.5 Coder / Ollama) API ---
fastify.get('/api/ai/status', async () => {
  return await aiService.getStatus();
});

fastify.post('/api/ai/model', async (request, reply) => {
  const body = (request.body || {}) as { model?: QwenModelId };
  const allowed: QwenModelId[] = ['qwen2.5-coder:1.5b', 'qwen2.5-coder:3b', 'qwen2.5-coder:7b'];
  if (!body.model || !allowed.includes(body.model)) {
    return reply.status(400).send({ error: 'Invalid Qwen 2.5 Coder model ID' });
  }
  aiService.setActiveModel(body.model);
  return await aiService.getStatus();
});

fastify.post('/api/ai/fix-error', async (request, reply) => {
  const body = (request.body || {}) as AIDiagnosticFixRequest;
  if (!body.diagnostic || typeof body.fileContent !== 'string') {
    return reply.status(400).send({ error: 'Missing diagnostic or fileContent payload' });
  }
  return await aiService.fixDiagnostic(body);
});

fastify.post('/api/ai/fast-edit', async (request, reply) => {
  const body = (request.body || {}) as AIFastEditRequest;
  if (!body.instruction || typeof body.fileContent !== 'string') {
    return reply.status(400).send({ error: 'Missing instruction or fileContent payload' });
  }
  return await aiService.fastEdit(body);
});

fastify.post('/api/ai/chat', async (request, reply) => {
  const body = (request.body || {}) as AIChatRequest;
  if (!body.message || typeof body.message !== 'string') {
    return reply.status(400).send({ error: 'Missing message payload' });
  }

  const response = await aiService.chat(body);

  if (body.projectId) {
    const userMsgId = `msg-${Date.now()}-u`;
    const asstMsgId = `msg-${Date.now() + 1}-a`;

    await db.saveProjectChat({
      id: userMsgId,
      project_id: body.projectId,
      role: 'user',
      content: body.message,
      model: body.model || aiService.getActiveModel(),
      intent: body.intent || 'ask',
    });

    await db.saveProjectChat({
      id: asstMsgId,
      project_id: body.projectId,
      role: 'assistant',
      content: response.reply,
      model: response.model,
      intent: response.intent,
    });

    response.messageId = asstMsgId;
  }

  return response;
});

// --- Static Asset Serving (Production & Packaged Desktop Bundle) ---
const DIST_DIR = process.env.LOCTEX_DIST_DIR || path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  await fastify.register(fastifyStatic, {
    root: DIST_DIR,
    prefix: '/',
  });

  fastify.setNotFoundHandler(async (request, reply) => {
    if (request.raw.url && request.raw.url.startsWith('/api')) {
      return reply.status(404).send({ error: 'API route not found' });
    }
    return reply.sendFile('index.html');
  });
}

const PORT = parseInt(process.env.PORT || '4173', 10);
const HOST = process.env.HOST || '0.0.0.0';

export async function startServer(port = PORT, host = HOST) {
  try {
    const address = await fastify.listen({ port, host });
    console.log(`⚡ LocTex Engine Server listening on ${address}`);
    return { fastify, address, port };
  } catch (err) {
    fastify.log.error(err);
    throw err;
  }
}

export { fastify, db, LOCTEX_DATA_DIR, PROJECTS_DIR };

// Standalone execution (when run directly via tsx/node)
if (process.env.NODE_ENV !== 'test' && !process.env.LOCTEX_EMBEDDED) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}

