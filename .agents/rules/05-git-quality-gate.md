---
trigger: model_decision
description: "Git branching standards, Conventional Commits, static quality gates, and release rules."
---

# 🔀 Git Branching, Conventional Commits & Quality Gates

All agents committing code, opening pull requests, or merging branches MUST adhere to these rules:

### 1. Dedicated Feature Branches
- **Direct pushes to `main` are strictly blocked.**
- Branch naming convention: `feature/<agent>-<feature-name>` (e.g. `feature/fai-payout-drawer`).

### 2. Conventional Commits 1.0.0 Standard
Commit messages MUST follow the format: `<type>(<scope>): <short summary>`
- `feat`: Net-new user-facing functionality.
- `fix`: Bug or regression fix.
- `perf`: Performance optimization or asset weight reduction.
- `sec`: Security boundary or RLS enhancement.
- `test`: Adding or refactoring test suites.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `docs`: Documentation updates.

### 3. Progressive Quality Gate & PR Gatekeeping
Before merging into `main`, GAI and QAI must verify:
1. `tsc --noEmit` exits with 0 errors and 0 warnings.
2. `node .agents/scripts/asset-budget-guard.cjs` exits with 0 violations (all media $\le 200\text{ KB}$, WebP `<picture>` dual delivery present).
3. Unit & E2E tests pass with 100% green status.
4. Feature branch is rebased on latest `origin/main` (`git pull origin main --rebase`).
5. PR is merged using clean linear merge (`gh pr merge --merge --delete-branch`).
