---
name: static-type-quality-gate
description: TypeScript compiler tsc --noEmit gatekeeper, zero-warning enforcer, and production build validator.
---

# 🛡️ Static Type Quality Gatekeeper

The **Static Type Quality Gate Skill** validates that all TypeScript code passes strict compilation before merging into `main`.

## 🧭 1. Quality Gate Command Suite
```bash
# 1. Typecheck:
npx tsc --noEmit

# 2. Production Bundle Build:
npm run build
```

## 🛑 2. Non-Negotiable Gate Rule
- If `tsc --noEmit` outputs **even 1 error or warning**, GAI MUST refuse the pull request and request changes.
