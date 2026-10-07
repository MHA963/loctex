---
trigger: always_on
description: "Explicit Operational 17-State Finite State Machine protocol, failure classification, versioned contracts, 9-tier policy broker, and SDK stop-hook continuation."
---

# 📡 Explicit Operational Finite State Machine & Execution Protocol

To guarantee **deterministic execution, zero defect-hiding, and defense-in-depth**, all agents coordinate via an **Operational 17-State Finite State Machine** with machine-enforced preconditions, postconditions, timeouts, retry policies, and compensations.

---

## 🎯 1. The 17 Operational States

```
                [DISCOVERY] ◄── (User Request Received)
                     │
                     ▼ (Interactive Probing via ask_question)
                [GOAL_LOCKED]
                     │
                     ▼
                 [PLANNED]
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
[WAITING_FOR_HUMAN]  │   [WAITING_FOR_DEPENDENCY]
        │            │            │
        ▼            ▼            ▼
                 [APPROVED]
                     │
                     ▼
             [CONTRACT_LOCKED] (Versioned v1.0.0 ➔ v1.1.0)
                     │
                     ▼
               [IMPLEMENTING] ◄────────────────┐
                     │                         │
                     ▼                         │
               [VERIFICATION]                  │
                     │                         │
            ┌────────┴────────┐                │
            ▼ (Fail)          ▼ (Pass)         │
     [RCA_REQUIRED]      [RELEASED]            │
            │                 │                │
      ┌─────┴─────┐           ▼                │
      ▼           ▼     [ROLLED_BACK]          │
 [QUARANTINED] [REFACTORING] ──────────────────┘
```

### Discrete Operational States:
1. `DISCOVERY`: POAI actively interviewing user via `ask_question` across the 4 discovery dimensions (Domain, Protocols, Non-Functional Budgets, DoD).
2. `GOAL_LOCKED`: User approved requirements specification, tech stack, and definition of done.
3. `PLANNED`: POAI decomposed requirement into atomic tasks, assigned agents, and defined dependencies.
4. `WAITING_FOR_HUMAN`: Suspended awaiting mandatory human-in-the-loop approval (mockup, architectural decision, destructive operation).
5. `WAITING_FOR_DEPENDENCY`: Blocked awaiting upstream prerequisite tasks or breaking contract resolution.
6. `APPROVED`: Human or prerequisite gate sign-off recorded.
7. `CONTRACT_LOCKED`: Versioned schemas (Zod/Pydantic/Protobuf/OpenAPI/CLI) and storage migrations locked and committed.
8. `IMPLEMENTING`: Specialist agents executing on isolated branch worktrees (`Workspace: "branch"`).
9. `VERIFICATION`: Automated quality gates running (post-task, pre-merge, and pre-production checks).
10. `RCA_REQUIRED`: Mandatory 4-Tier failure classification triggered on verification failure.
11. `REFACTORING`: Targeted application refactoring active. (Tests remain locked unless proven defective).
12. `RETRYING`: Automatic backoff retry active.
13. `QUARANTINED`: Flaky or non-deterministic test isolated to `tests/quarantine/` with timing evidence.
14. `RELEASED`: All quality gates passed, branch worktree merged, SemVer tagged.
15. `FAILED`: Unrecoverable failure or maximum retry budget exceeded.
16. `CANCELLED`: Explicitly aborted by user or orchestrator.
17. `ROLLED_BACK`: Safely reverted due to canary regression or migration incompatibility.

---

## 🔬 2. Anti-Defect-Hiding Failure Classification & Stop Hook Continuation

When a verification check fails during `VERIFICATION` or when a subagent attempts to finish:
- **`PRODUCT_BUG`**: Tests are LOCKED. The post-task stop hook returns `StopHookResult(decision=StopDecision.CONTINUE, reason="...")` containing the compiler/test error output, forcing the subagent to autonomously fix the application code.
- **`TEST_BUG`**: Requires mathematical/contract proof that the test contradicts the locked schema + dual sign-off (QAI + EVAI) before test files can be touched.
- **`ENVIRONMENT_ISSUE`**: Infrastructure/socket failure. Retried without modifying code or tests.
- **`FLAKY`**: Quarantined to `tests/quarantine/`. Does NOT count towards green release builds.

---

## 🛡️ 3. 9-Tier Safety Precedence Engine & OS Command Sandboxing

Execution security is enforced below the agent level via [.agents/scripts/capability-broker.cjs](file:///c:/Users/hadev/Desktop/Antigravity-Agent-Swarm-OS/.agents/scripts/capability-broker.cjs):

### The 9-Level Priority Evaluation Hierarchy:
1. **Specific Deny**: `policy.deny("tool_name", ...)`
2. **Specific Ask**: `policy.ask_user("tool_name", ...)`
3. **Specific Allow**: `policy.allow("tool_name", ...)`
4. **Prefix Wildcard Deny**: `policy.deny("server/*", ...)`
5. **Prefix Wildcard Ask**: `policy.ask_user("server/*", ...)`
6. **Prefix Wildcard Allow**: `policy.allow("server/*", ...)`
7. **Global Wildcard Deny**: `policy.deny("*", ...)`
8. **Global Wildcard Ask**: `policy.ask_user("*", ...)`
9. **Global Wildcard Allow**: `policy.allow("*", ...)`

Within each tier, the **first match wins** (short-circuit). Argument predicates (`when=...`) are **fail-closed** (if a predicate errors, the action is blocked).

### OS-Level Command Sandboxing:
- Permitted `run_command` invocations are executed inside OS-level sandboxes (`RunCommandConfig(enable_sandbox=True)`), isolating terminal commands to the repository directory.
- Untrusted inputs (issues, web content, third-party logs) are sanitized to prevent prompt injections.

---

## 📝 4. Machine-Enforced State Transitions

All transitions are executed via [.agents/scripts/transition-engine.cjs](file:///c:/Users/hadev/Desktop/Antigravity-Agent-Swarm-OS/.agents/scripts/transition-engine.cjs):
```bash
node .agents/scripts/transition-engine.cjs \
  --taskId "task-discovery-001" \
  --agent "POAI" \
  --event "GOAL_LOCKED" \
  --fromState "DISCOVERY" \
  --toState "GOAL_LOCKED"
```
