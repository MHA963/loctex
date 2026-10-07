---
trigger: model_decision
description: "Parallel Sub-Swarm Branching Protocol (PSBP) and subagent worktree isolation instructions."
---

# ⚡ Parallel Sub-Swarm Branching Protocol (PSBP)

To maximize throughput and prevent serial agent bottlenecks, orchestrators MUST execute the 3-phase concurrent branching protocol:

### Phase 1: Contract Locking (AAI & BAI)
1. **AAI** commits frozen TypeScript interfaces (`.types.ts`) and Zod runtime validation schemas.
2. **BAI** commits mock service adapters (`mockDataService.ts`) and database interface contracts.
3. Once contracts are committed to the PR base, Phase 2 is unlocked.

### Phase 2: Concurrent Parallel Execution (Workspace: "branch")
Subagents are dispatched concurrently with `Workspace: "branch"` (isolated git worktree):
- 🎨 **Fai**: Implements UI components and Framer Motion spring physics against locked contracts.
- 🧬 **EVAI**: Implements AI command bars, streaming handlers, and RAG pipelines (when AI capabilities are requested) or evaluates benchmark performance and tracks anti-patterns.
- 🧪 **QAI & 👁️ UXAI**: Authors DOM interaction tests, keyboard accessibility specs, and visual regression suites against the contract.
- 🛡️ **SAI**: Executes automated input sanitization and XSS threat audits against the mocked payloads.

### Phase 3: Convergence & GAI Gatekeeping
Before merging parallel branches into `main`, **GAI** executes:
1. Static Typecheck: `tsc --noEmit` (0 errors).
2. Visual & Layout Regression: `node .agents/skills/headless-visual-audit/scripts/audit.js`.
3. Unit & DOM Interaction Test Suites: 100% green pass rate.
4. Linear PR Merge: `gh pr merge --merge --delete-branch`.
