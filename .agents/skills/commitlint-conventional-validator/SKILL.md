---
name: commitlint-conventional-validator
description: Commitlint regex engine enforcing strict Conventional Commits syntax and scope standardization.
---

# 📝 Commitlint & Conventional Commits Validator

The **Commitlint Validator Skill** parses commit messages against the Conventional Commits 1.0.0 specification before git pushes.

## 🧭 1. Commit Type Dictionary
- `feat`: Net-new functionality (`feat(payouts): add Levant multi-channel withdrawal drawer`)
- `fix`: Bug or layout fix (`fix(navbar): resolve sticky header clipping on tablet viewport`)
- `sec`: Security boundary or RLS audit (`sec(rls): validate auth.uid() on submission table`)
- `test`: Unit, visual, or E2E test additions (`test(e2e): author playwright payout flow test`)
- `refactor`: Internal refactoring without behavior change (`refactor(cqrs): clean event bus dispatchers`)
- `docs`: Documentation updates (`docs(readme): update package layout guide`)

## 🛡️ 2. Validation Regex Rule
```regex
^(feat|fix|sec|test|refactor|docs|perf|chore)(\([a-z0-9\-]+\))?: .{1,80}$
```
