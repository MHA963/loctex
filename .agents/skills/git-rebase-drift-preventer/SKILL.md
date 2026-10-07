---
name: git-rebase-drift-preventer
description: Upstream synchronization validator enforcing git pull origin main --rebase and conflict prediction before pull request merges.
---

# 🔄 Git Rebase & Upstream Drift Preventer

The **Git Rebase Drift Preventer Skill** eliminates merge conflicts and prevents re-introducing deleted code from stale base branches.

## 🧭 1. Rebase Verification Flow
Before opening or merging any PR:
```bash
git fetch origin main
git rebase origin/main

# If conflicts exist, inspect and resolve cleanly before pushing:
git status
```

## 🛡️ 2. Invariant Gate
- GAI MUST reject any PR whose base branch is behind `origin/main` until rebased and verified.
