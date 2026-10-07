---
name: instructor-zod-structured-llm
description: Instructor-JS structured JSON output enforcement with automatic Zod validation, retry loops, and JSON schema extraction.
---

# 🤖 Instructor-JS Structured LLM Extraction

The **Instructor-JS Structured LLM Skill** guarantees deterministic JSON object extraction from LLMs with automatic retry on validation failure.

## 🧭 1. Instructor-JS Extraction Pattern
```typescript
import Instructor from '@instructor-ai/instructor';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const QuizSchema = z.object({
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(z.object({
    prompt: z.string(),
    options: z.array(z.string()).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string()
  }))
});

export async function generateStructuredQuiz(promptText: string) {
  // Instructor validates response against Zod schema and automatically retries if malformed:
  const client = Instructor({ client: new GoogleGenerativeAI(process.env.GEMINI_API_KEY!), mode: 'JSON_SCHEMA' });
  return await client.chat.completions.create({
    model: 'gemini-1.5-pro',
    response_model: { schema: QuizSchema, name: 'Quiz' },
    messages: [{ role: 'user', content: promptText }]
  });
}
```
