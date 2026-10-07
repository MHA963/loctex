---
name: dompurify-xss-sanitizer
description: DOMPurify and sanitize-html AST sanitization for user inputs, markdown HTML rendering, and SVG injection defense.
---

# 🛡️ DOMPurify XSS Sanitization Shield

The **DOMPurify Sanitizer Skill** eliminates Cross-Site Scripting (XSS) vectors across rendered user content, markdown previews, and SVG icons.

## 🧭 1. DOMPurify Sanitization Standard
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeUserInput(rawHtml: string): string {
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}
```

## 🛡️ 2. Zero Unsanitized `dangerouslySetInnerHTML`
- Any React component using `dangerouslySetInnerHTML` MUST wrap the value in `sanitizeUserInput()`.
