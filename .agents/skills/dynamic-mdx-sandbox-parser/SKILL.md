---
name: dynamic-mdx-sandbox-parser
description: AST-based MDX compiler, sandboxed React component renderer, and syntax-highlighted code block processor.
---

# 📦 Dynamic MDX Sandbox Parser

The **Dynamic MDX Sandbox Parser Skill** safely renders interactive educational lectures, markdown articles, and live UI widgets from AI strings.

## 🧭 1. Safe AST Parsing Workflow
1. Parse markdown strings into Abstract Syntax Trees (AST) using Unified / Remark.
2. Filter out raw `<script>` tags and dangerous `iframe` attributes.
3. Replace custom Markdown tags (e.g. `<QuizWidget id="123" />`) with verified sandboxed React components.

## 💻 2. Sandboxed Component Registry
```tsx
import { MDXRemote } from 'next-mdx-remote';
import { QuizWidget } from '@/components/ai/QuizWidget';
import { TokenGauge } from '@/components/dashboard/TokenGauge';

const components = {
  QuizWidget,
  TokenGauge,
  h1: (props: any) => <h1 className="text-2xl font-bold my-4 text-text-primary" {...props} />
};

export const SandboxedMDX = ({ source }: { source: any }) => (
  <div className="prose dark:prose-invert max-w-none">
    <MDXRemote {...source} components={components} />
  </div>
);
```
