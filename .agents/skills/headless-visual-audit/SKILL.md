---
name: headless-visual-audit
description: Automated multi-viewport Playwright visual audit runbook and layout collision detector for UI components.
---

# 👁️ Headless Visual Audit & Screenshot Runbook

The **Headless Visual Audit Skill** empowers agents (specifically **UXAI** and **QAI**) to capture multi-breakpoint viewport snapshots, verify layout balance, and prevent visual regressions before PR merges.

## 🧭 1. Viewport Matrix
Audits must be executed across standard responsive breakpoints:
- **Mobile Viewport**: `390 x 844` (iPhone 14 / modern mobile)
- **Tablet Viewport**: `768 x 1024` (iPad / tablet portrait)
- **Desktop Viewport**: `1440 x 900` (Standard Desktop Workspace)

## 🛡️ 2. Local Screenshot Protocol
1. Local visual screenshots are captured into `.agents/uxai-visual-audit/`.
2. **Strict `.gitignore` Rule**: This folder MUST remain gitignored to prevent binary image bloat in GitHub commits.
3. Screenshots are purged and refreshed on every active work shift.

## 🛠️ 3. Running the Audit
Execute the automated audit runner:
```bash
node .agents/skills/headless-visual-audit/scripts/audit.js --url=http://localhost:3000 --out=.agents/uxai-visual-audit
```
