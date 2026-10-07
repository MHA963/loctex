import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import path from 'path';
import fs from 'fs';
import { LocTexDatabase } from './db/database.ts';
import { TectonicRunner } from './compiler/tectonic-runner.ts';

const fastify = Fastify({ logger: true });
const db = new LocTexDatabase();
const compiler = new TectonicRunner();

const LOCTEX_DATA_DIR = path.resolve(process.cwd(), 'loctex_data');
const PROJECTS_DIR = path.resolve(LOCTEX_DATA_DIR, 'projects');

if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

await fastify.register(cors, { origin: true });
await fastify.register(websocket);

// Health check
fastify.get('/api/health', async () => {
  return { status: 'healthy', timestamp: new Date().toISOString(), app: 'LocTex' };
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

fastify.post('/api/projects', async (request, reply) => {
  const body = request.body as { name: string; template?: string };
  const id = `proj-${Date.now()}`;
  const name = body.name || 'Untitled Document';
  const projectDir = path.resolve(PROJECTS_DIR, id);

  fs.mkdirSync(projectDir, { recursive: true });

  const defaultMainTex = `\\documentclass[11pt]{article}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{${name}}
\\author{LocTex Author}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This document was created in LocTex, the personal research and journaling workspace.
\\end{abstract}

\\section{Introduction}
Welcome to your new document. You can edit text directly on the compiled view or in the code editor.

\\begin{equation}
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\end{equation}

\\section{Methodology}
Write your research equations and notes here.

\\end{document}
`;

  fs.writeFileSync(path.resolve(projectDir, 'main.tex'), defaultMainTex, 'utf-8');

  await db.createProject({
    id,
    name,
    root_path: projectDir,
    active_file: 'main.tex',
    settings_json: JSON.stringify({ theme: 'dark-gold', fontFamily: 'Serif', fontSize: '11pt' }),
  });

  return { id, name, root_path: projectDir };
});

fastify.patch('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as { name?: string; active_file?: string; settings_json?: string };
  await db.updateProject(id, body);
  return { success: true };
});

fastify.delete('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (project && fs.existsSync(project.root_path)) {
    fs.rmSync(project.root_path, { recursive: true, force: true });
  }
  await db.deleteProject(id);
  return { success: true };
});

// --- Snapshots API ---
fastify.get('/api/projects/:id/snapshots', async (request) => {
  const { id } = request.params as { id: string };
  const snapshots = await db.listSnapshots(id);
  return { snapshots };
});

fastify.post('/api/projects/:id/snapshots', async (request) => {
  const { id } = request.params as { id: string };
  const body = request.body as { version_tag: string; summary: string };
  const project = await db.getProject(id);
  if (!project) throw new Error('Project not found');

  const files = fs.readdirSync(project.root_path);
  const snapId = `snap-${Date.now()}`;

  await db.createSnapshot({
    id: snapId,
    project_id: id,
    version_tag: body.version_tag || `v${Date.now()}`,
    summary: body.summary || 'Snapshot save',
    file_tree_json: JSON.stringify(files),
  });

  return { success: true, id: snapId };
});

// --- Compilation API ---
fastify.post('/api/projects/:id/compile', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = await db.getProject(id);
  if (!project) {
    return reply.status(404).send({ error: 'Project not found' });
  }

  const result = await compiler.compile(project.root_path, project.active_file);
  return result;
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

const PORT = 4173;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`⚡ LocTex Engine Server listening on ${address}`);
});
