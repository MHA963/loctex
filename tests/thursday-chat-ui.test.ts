import { describe, it, expect } from 'vitest';
import { OllamaQwenService } from '../server/services/ollama-service.ts';
import { ChatMessage, AIChatIntent } from '../src/types/index.ts';

describe('Thursday AI Assistant & Conversation Drawer UI Logic', () => {
  const service = new OllamaQwenService();

  describe('Conversational Intent Processing', () => {
    it('generates helpful LaTeX advice for "ask" intent without modifying code', async () => {
      const res = await service.chat({
        message: 'How do I add a bibliography in LaTeX?',
        intent: 'ask',
      });

      expect(res.intent).toBe('ask');
      expect(res.reply).toContain('bibliography');
      expect(res.reply).toContain('\\bibliographystyle');
      expect(res.model).toBeDefined();
    });

    it('generates scholarly rewrite for "rewrite" intent when selection is provided', async () => {
      const selectedText = 'We think this new method works very good for small datasets.';
      const res = await service.chat({
        message: 'Please rewrite this text for a top journal',
        intent: 'rewrite',
        selectedText,
      });

      expect(res.intent).toBe('rewrite');
      expect(res.reply).toContain('Academic Rewrite Suggestion');
      expect(res.reply).toContain('robust');
      expect(res.reply).not.toContain('very good');
    });

    it('generates structured alignment code for "format" intent', async () => {
      const mathSnippet = 'x = 2y + 3 = z';
      const res = await service.chat({
        message: 'Format this equation alignment',
        intent: 'format',
        selectedText: mathSnippet,
      });

      expect(res.intent).toBe('format');
      expect(res.reply).toContain('\\begin{align}');
      expect(res.reply).toContain('&=');
    });

    it('detects unbalanced braces in "debug" intent', async () => {
      const brokenLatex = '\\section{Quantum Dynamics\nText with unclosed opening brace {';
      const res = await service.chat({
        message: 'Debug my LaTeX snippet',
        intent: 'debug',
        fileContent: brokenLatex,
      });

      expect(res.intent).toBe('debug');
      expect(res.reply).toContain('Diagnostic Analysis');
      expect(res.reply).toContain('Unbalanced Braces');
    });

    it('detects unescaped underscores in text mode during "debug" intent', async () => {
      const brokenLine = 'The feature_name was evaluated across participants.';
      const res = await service.chat({
        message: 'Why did compilation fail?',
        intent: 'debug',
        fileContent: brokenLine,
      });

      expect(res.intent).toBe('debug');
      expect(res.reply).toContain('Unescaped Underscore');
      expect(res.reply).toContain('\\_');
    });
  });

  describe('Chat History & Context Caching Serialization', () => {
    it('correctly serializes and deserializes multi-turn conversation history per project', () => {
      const history: ChatMessage[] = [
        {
          id: 'msg-1',
          projectId: 'proj-101',
          role: 'user',
          content: 'What is the standard documentclass for IEEE papers?',
          model: 'qwen2.5-coder:1.5b',
          intent: 'ask',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          projectId: 'proj-101',
          role: 'assistant',
          content: 'Use \\documentclass[conference]{IEEEtran}.',
          model: 'qwen2.5-coder:1.5b',
          intent: 'ask',
          createdAt: new Date().toISOString(),
        },
      ];

      const serialized = JSON.stringify(history);
      expect(typeof serialized).toBe('string');

      const parsed = JSON.parse(serialized) as ChatMessage[];
      expect(parsed.length).toBe(2);
      expect(parsed[0].role).toBe('user');
      expect(parsed[0].intent).toBe('ask');
      expect(parsed[1].content).toContain('IEEEtran');
    });

    it('extracts LaTeX code snippets from assistant markdown responses cleanly', () => {
      const sampleResponse = `
Here is the recommended equation setup:
\`\`\`latex
\\begin{equation}
  E = mc^2
\\end{equation}
\`\`\`
And for citations:
\`\`\`latex
\\cite{einstein1905}
\`\`\`
Make sure to include amsmath in the preamble.
`;

      const codeBlockRegex = /```(?:latex|tex)?\n([\s\S]*?)```/g;
      const extracted: string[] = [];
      let match;

      while ((match = codeBlockRegex.exec(sampleResponse)) !== null) {
        extracted.push(match[1].trim());
      }

      expect(extracted.length).toBe(2);
      expect(extracted[0]).toContain('\\begin{equation}');
      expect(extracted[1]).toBe('\\cite{einstein1905}');
    });
  });
});
