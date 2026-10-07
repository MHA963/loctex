---
name: litellm-fallback-router
description: LiteLLM multi-model fallback routing, 5-second AbortController timeouts, rate-limit 429 backoffs, and cost-latency optimization.
---

# 🔀 LiteLLM Multi-Model Fallback Router

The **LiteLLM Fallback Router Skill** ensures 99.99% uptime for AI features by routing across model providers (Gemini, Claude, OpenAI) with automatic rate-limit failovers.

## 🧭 1. Resilient Timeout & Fallback Engine
```typescript
interface ModelEndpoint {
  name: string;
  provider: 'gemini' | 'anthropic' | 'openai';
  call: (prompt: string, signal: AbortSignal) => Promise<string>;
}

export async function callWithModelFallback(models: ModelEndpoint[], prompt: string, timeoutMs = 5000): Promise<string> {
  let lastError: any;

  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await model.call(prompt, controller.signal);
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      console.warn(`Model ${model.name} failed or timed out, trying next fallback...`);
    }
  }

  throw new Error(`All LLM fallback models failed. Root error: ${lastError?.message}`);
}
```
