---
name: flaky-test-analyzer-healer
description: Automated failure classifier, flake quarantine engine, and resilient test healer preventing defect-hiding anti-patterns.
---

# 🩺 Failure Classification, Flake Quarantine & Anti-Defect-Hiding Protocol

> [!CAUTION]
> **Anti-Defect-Hiding Invariant**: An agent is STRICTLY PROHIBITED from modifying a failing test to make a test suite pass ("Test fails ➔ modify test ➔ test passes").

---

## 🔬 1. Mandatory 4-Tier Failure Classification

Whenever a test assertion fails, **EVAI** and **QAI** execute [.agents/scripts/classify-failure.cjs](file:///c:/Users/hadev/Desktop/Antigravity-Agent-Swarm-OS/.agents/scripts/classify-failure.cjs):

```
                       Test Failure Detected
                                 │
                                 ▼
                     4-Tier Root Cause Analysis
                                 │
         ┌───────────────┬───────┴───────────────┬───────────────┐
         ▼               ▼                       ▼               ▼
   [PRODUCT_BUG]    [TEST_BUG]              [ENV_ISSUE]       [FLAKY]
         │               │                       │               │
  Tests LOCKED!   Requires Proof +         Infrastructure   Quarantine to
  Refactor App    Dual Sign-Off            Timeout/Sockets  tests/quarantine/
  Code Only       (QAI + EVAI)             Retry Run        + Timing Evidence
```

1. **`PRODUCT_BUG`**: Real application regression. **Tests are strictly locked**. The specialist agent (Fai/BAI/EVAI) must fix source implementation.
2. **`TEST_BUG`**: The test fixture itself violates the locked Zod/OpenAPI contract specification. Test edits are unlocked **only** after QAI produces proof and EVAI signs off.
3. **`ENVIRONMENT_ISSUE`**: Port binding conflict, timeout, or missing daemon. Retried without modifying code.
4. **`FLAKY`**: Intermittent timing variance or race condition.

---

## 🚷 2. Quarantine & Dual-Approval Healing Protocol

1. **Immediate Quarantine**: Flaky tests are moved to `tests/quarantine/`.
2. **Exclusion from Green Builds**: Quarantined tests do NOT satisfy Definition of Done (DoD) for release until permanently resolved.
3. **Dual-Sign-Off Requirement**: Curing a quarantined test requires:
   - **QAI**: Refactors non-deterministic assertions (e.g. replacing `waitForTimeout` with web-first assertions).
   - **EVAI**: Executes 10 consecutive stress-test replay runs to verify 100% deterministic stability before promoting out of quarantine.
