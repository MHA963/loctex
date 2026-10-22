import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fastify, db } from '../server/index.ts';

describe('Thursday AI Conversation & Chat Persistence API', () => {
  const testProjectId = `proj-test-chat-${Date.now()}`;
  const testProjectDir = path.resolve(process.cwd(), 'loctex_data', 'projects', testProjectId);

  beforeAll(async () => {
    if (!fs.existsSync(testProjectDir)) {
      fs.mkdirSync(testProjectDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(testProjectDir, 'main.tex'), '\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}');

    await db.createProject({
      id: testProjectId,
      name: 'Chat Test Project',
      root_path: testProjectDir,
      active_file: 'main.tex',
      settings_json: '{}',
    });
  });

  afterAll(async () => {
    try {
      await db.deleteProject(testProjectId);
      if (fs.existsSync(testProjectDir)) {
        fs.rmSync(testProjectDir, { recursive: true, force: true });
      }
    } catch {
      // ignore
    }
  });

  it('GET /api/projects/:id/chat returns 404 for invalid project ID', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/projects/non-existent-proj/chat',
    });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/projects/:id/chat returns empty message list for fresh project', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/projects/${testProjectId}/chat`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.messages).toEqual([]);
  });

  it('POST /api/projects/:id/chat rejects invalid payloads without role or content', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/projects/${testProjectId}/chat`,
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/projects/:id/chat successfully saves user and assistant messages', async () => {
    const saveUserRes = await fastify.inject({
      method: 'POST',
      url: `/api/projects/${testProjectId}/chat`,
      payload: {
        role: 'user',
        content: 'How do I add an equation in LaTeX?',
        model: 'qwen2.5-coder:1.5b',
        intent: 'ask',
      },
    });
    expect(saveUserRes.statusCode).toBe(200);
    const userPayload = JSON.parse(saveUserRes.payload);
    expect(userPayload.success).toBe(true);
    expect(userPayload.messageId).toBeDefined();

    const saveAsstRes = await fastify.inject({
      method: 'POST',
      url: `/api/projects/${testProjectId}/chat`,
      payload: {
        role: 'assistant',
        content: 'Use \\begin{equation} ... \\end{equation}.',
        model: 'qwen2.5-coder:1.5b',
        intent: 'ask',
      },
    });
    expect(saveAsstRes.statusCode).toBe(200);

    const getRes = await fastify.inject({
      method: 'GET',
      url: `/api/projects/${testProjectId}/chat`,
    });
    const body = JSON.parse(getRes.payload);
    expect(body.messages.length).toBe(2);
    expect(body.messages[0].role).toBe('user');
    expect(body.messages[0].content).toContain('equation');
    expect(body.messages[1].role).toBe('assistant');
  });

  it('POST /api/ai/chat executes conversational response and auto-caches into project', async () => {
    const chatRes = await fastify.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: {
        projectId: testProjectId,
        message: 'Can you rewrite my introduction section?',
        intent: 'rewrite',
        selectedText: 'We think this method works very well.',
        model: 'qwen2.5-coder:1.5b',
      },
    });

    expect(chatRes.statusCode).toBe(200);
    const chatBody = JSON.parse(chatRes.payload);
    expect(chatBody.reply).toBeDefined();
    expect(chatBody.reply.length).toBeGreaterThan(10);
    expect(chatBody.intent).toBe('rewrite');
    expect(chatBody.messageId).toBeDefined();

    // Verify messages persisted in SQLite database for testProjectId
    const getRes = await fastify.inject({
      method: 'GET',
      url: `/api/projects/${testProjectId}/chat`,
    });
    const body = JSON.parse(getRes.payload);
    expect(body.messages.length).toBe(4); // 2 previous + 2 new (user + assistant)
  });

  it('DELETE /api/projects/:id/chat wipes conversation history cleanly', async () => {
    const deleteRes = await fastify.inject({
      method: 'DELETE',
      url: `/api/projects/${testProjectId}/chat`,
    });
    expect(deleteRes.statusCode).toBe(200);

    const getRes = await fastify.inject({
      method: 'GET',
      url: `/api/projects/${testProjectId}/chat`,
    });
    const body = JSON.parse(getRes.payload);
    expect(body.messages).toEqual([]);
  });
});
