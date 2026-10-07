---
name: sop-multiagent-orchestrator
description: MetaGPT-inspired Standard Operating Procedure (SOP) workflow generator. Decomposes high-level requests into PRDs, system designs, and atomic agent tasks.
---

# 📋 Standard Operating Procedure (SOP) Multi-Agent Orchestrator

The **SOP Orchestrator Skill** brings MetaGPT-grade rigor to product management. It transforms ambiguous user requests into formal Product Requirement Documents (PRDs), architectural schemas, and sequenced task assignments.

## 🧭 1. MetaGPT-Inspired 3-Stage Pipeline
1. **Stage 1: User Request to PRD Generation**:
   - Decompose user goals into Target User Persona, User Stories, and Non-Functional Requirements.
   - Define strict Acceptance Criteria (Gherkin format: `Given`, `When`, `Then`).
2. **Stage 2: Technical Architecture Handoff**:
   - Extract entity relations and specify bounded contexts for AAI and BAI.
3. **Stage 3: Task Dependency DAG**:
   - Formulate a Directed Acyclic Graph (DAG) specifying which tasks run sequentially vs in parallel.

## 📝 Example SOP Dispatch:
```markdown
## SOP: Multi-Channel Payout Feature
- **Target Persona**: Commercial Course Merchant
- **Acceptance Criteria**:
  - GIVEN a merchant with a balance > $50
  - WHEN they select ZainCash or Wise and submit a withdrawal
  - THEN create an idempotent payout record with 15% platform split deducted.
- **Assigned Sub-Swarms**:
  - [Task 1] AAI: Freeze PayoutSchema in .types.ts (Blocks Task 2 & 3)
  - [Task 2] BAI: Build PostgreSQL migration & payout service
  - [Task 3] Fai: Build PayoutDrawer with Framer Motion
```
