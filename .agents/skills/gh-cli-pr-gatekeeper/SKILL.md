---
name: gh-cli-pr-gatekeeper
description: GitHub CLI automated pull request creation, diff inspection, gatekeeping comments, and linear branch merges.
---

# 🔀 GitHub CLI PR Gatekeeper & Merge Engine

The **GitHub CLI PR Gatekeeper Skill** manages GitHub pull request workflows via the official `cli/cli` tool.

## 🧭 1. Standard PR Gatekeeping Flow
```bash
# 1. Open formal PR assigned to GAI:
gh pr create --title "[Fai] feat(ui): creator payout drawer" --body "Implements payout drawer with Framer Motion." --assignee "GAI"

# 2. Inspect PR diff:
gh pr diff

# 3. If green, execute clean linear merge & delete remote branch:
gh pr merge --merge --delete-branch
```
