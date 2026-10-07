---
name: self-improving-evolution-loop
description: Closed-loop autonomous self-improvement engine that monitors execution history, diagnoses failure patterns, benchmarks candidate mutations against baselines, and safely promotes or rolls back changes.
---

# ♾️ Self-Improving Evaluation & Evolution Loop

The **Self-Improving Evolution Loop** provides the closed-loop autonomous capability for AOS to observe, diagnose, propose, benchmark, verify, promote, monitor, and roll back changes to its own skills, rules, agent definitions, and policies without manual intervention.

---

## 🧭 The 10-Step Autonomous Pipeline

```
  1. OBSERVE   ➔ Scan .agents/telemetry/event-ledger.jsonl for failure spikes & high retries.
  2. DIAGNOSE  ➔ EVAI identifies root causes, bottlenecks, or anti-patterns.
  3. PROPOSE   ➔ EVAI generates candidate mutation in .agents/evolution/proposals/<id>.json.
  4. MODIFY    ➔ Stage mutation on isolated candidate branch/worktree.
  5. REPLAY    ➔ Run .agents/scripts/replay-engine.cjs across all registered benchmarks.
  6. COMPARE   ➔ Require Composite Score Delta >= 0 AND Regressions == 0.
  7. VERIFY    ➔ QAI validates unit, integration, and security quality gates.
  8. PROMOTE   ➔ GAI merges candidate, bumps SemVer in evolution-ledger.json, and commits.
  9. MONITOR   ➔ Live canary observation detects post-promotion anomalies.
 10. ROLLBACK  ➔ If canary regression occurs, rollback-evolution.cjs restores backup instantly.
```

---

## 📊 Evaluation Registry Structure

Benchmarks reside in `.agents/evaluations/` partitioned across 5 domains:
- **`frontend/`**: Mockup approval gate compliance, WCAG contrast, Radix ARIA attributes.
- **`backend/`**: PostgreSQL multi-tenant RLS isolation, expand-and-contract migrations.
- **`architecture/`**: PSBP contract locking invariants, sub-resource context isolation.
- **`security/`**: AST input sanitization, three-tier defensive authorization.
- **`regression/`**: Known anti-pattern prevention catalog.

---

## 📈 Quantitative Metrics Framework

Decisions are governed strictly by empirical metrics, eliminating subjective self-evaluation:
- `task_success_rate` (0.0 - 1.0)
- `test_pass_rate` (0.0 - 1.0)
- `regression_rate` (0.0 - 1.0)
- `human_correction_rate` (incidents / 10 tasks)
- `retry_count` (total retries before hooks pass)
- `tool_error_rate` (tool call failures)
- `token_usage` (total prompt + completion tokens)
- `execution_time_ms` (latency)
- `cost_estimate_usd` (dollars)

---

## 🛠️ CLI Operations

```bash
# 1. Run Replay Suite on Baseline or Proposal
node .agents/scripts/replay-engine.cjs --proposal .agents/evolution/proposals/<proposalId>.json

# 2. Promote Validated Candidate
node .agents/scripts/promote-candidate.cjs <proposalId>

# 3. Emergency Rollback of Any Promoted Candidate
node .agents/scripts/rollback-evolution.cjs <candidateId>

# 4. Extract Human Correction from /learn Session
node .agents/scripts/extract-human-correction.cjs --context "Always index foreign keys" --scope rules

# 5. Run Full Autonomous Evolution Loop
node .agents/scripts/run-evolution-loop.cjs --auto-promote
```
