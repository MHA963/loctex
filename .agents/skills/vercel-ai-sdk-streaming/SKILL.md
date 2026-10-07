---
name: vercel-ai-sdk-streaming
description: Vercel AI SDK streaming hooks, multi-modal generative UI primitives, and streaming tool call execution.
---

# 🌊 Vercel AI SDK Streaming & Generative UI

The **Vercel AI SDK Skill** powers real-time token streaming, streaming tool calls, and rich interactive generative UI widgets in React.

## 🧭 1. Streaming Text & Object Generation
```typescript
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function handleAIStream(userPrompt: string) {
  return streamText({
    model: google('gemini-1.5-pro'),
    system: 'You are an expert pair programmer. Return clean code blocks.',
    prompt: userPrompt
  });
}
```

## 💻 2. React Streaming Hook (`useChat`)
```tsx
import { useChat } from 'ai/react';

export function AIChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className="inline-block p-3 rounded-xl bg-card border border-border">{m.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-2">
        <input value={input} onChange={handleInputChange} placeholder="Ask AI..." className="flex-1 p-2 rounded-lg bg-surface-primary" />
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-lg">Send</button>
      </form>
    </div>
  );
}
```
