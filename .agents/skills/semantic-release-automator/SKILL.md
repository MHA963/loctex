---
name: semantic-release-automator
description: Semantic-release automated SemVer calculation, CHANGELOG.md generation, and GitHub release tagging.
---

# 📦 Semantic Release & Changelog Automator

The **Semantic Release Automator Skill** calculates semantic version bumps (SemVer), writes structured `CHANGELOG.md` files, and tags GitHub releases.

## 🧭 1. SemVer Version Calculation Rules
- **Major (`v1.0.0` $\rightarrow$ `v2.0.0`)**: Contains `BREAKING CHANGE` in commit footer.
- **Minor (`v1.0.0` $\rightarrow$ `v1.1.0`)**: Contains `feat(...)` commits.
- **Patch (`v1.0.0` $\rightarrow$ `v1.0.1`)**: Contains `fix(...)`, `sec(...)`, or `perf(...)` commits.

## 💻 2. Command Execution
```bash
# Automated changelog generation and release tagging:
npx semantic-release
```
