# 📐 ASP (Aegis Swarm Protocol) — Architecture & Workflow Diagrams

This document contains visual diagrams illustrating the multi-agent operating system, communication topology, reasoning checkpoints, explicit finite state machines, 4-tier quality gates, and parallel git execution protocol.

---

## 🧭 Diagram 1: Multi-Agent Swarm Topology & Orchestration

```mermaid
flowchart TD
    User["👤 User Request / PRD"] --> POAI["🎯 POAI (Lead Orchestrator & Product Owner)"]
    
    subgraph ApprovalGate["👁️ Mandatory Visual Approval Gate"]
        POAI --> UXAI["👁️ UXAI (Design Lead)"]
        UXAI -->|generate_image| Mockup["🖼️ Pixel-Accurate UI Mockup"]
        Mockup -->|ask_question| UserReview{"Interactive User Approval"}
    end

    UserReview -->|Approved Spec| Phase1["📐 Phase 1: Contract Locking"]
    
    subgraph Phase1Sub["Phase 1: Invariant Schemas"]
        Phase1 --> AAI["📐 AAI (Architecture & Zod/OpenAPI Contracts)"]
        Phase1 --> BAI["⚙️ BAI (Database DDL & RLS Schemas)"]
    end

    Phase1Sub --> Phase2["⚡ Phase 2: Parallel Worktree Execution (PSBP)"]

    subgraph Phase2Sub["Phase 2: Isolated Branch Worktrees"]
        Phase2 -->|Workspace: branch| Fai["🎨 Fai (Frontend & Physics Motion)"]
        Phase2 -->|Workspace: branch| EVAI["🧬 EVAI (Evolution, Eval & AI Capability)"]
        Phase2 -->|Workspace: branch| SAI["🛡️ SAI (Zero-Trust Security & AST)"]
    end

    Phase2Sub --> Phase3["🧪 Phase 3: Quality Gates & Convergence"]

    subgraph Phase3Sub["Phase 3: Verification & Release"]
        Phase3 --> QAI["🧪 QAI (Playwright E2E & Vitest Matrix)"]
        Phase3 --> GAI["🔀 GAI (Typecheck, Commitlint & Semantic Release)"]
    end

    GAI --> Production["🚀 Production Release / Linear Git Merge"]
```

---

## 📡 Diagram 2: Operational 15-State Finite State Machine Protocol

```mermaid
stateDiagram-v2
    [*] --> PLANNED: POAI decomposes requirements & assigns dependencies
    
    PLANNED --> WAITING_FOR_HUMAN: UXAI visual mockup or destructive approval requested
    PLANNED --> WAITING_FOR_DEPENDENCY: Upstream dependency unresolved
    
    WAITING_FOR_HUMAN --> APPROVED: Human approval recorded via ask_question
    WAITING_FOR_DEPENDENCY --> APPROVED: Prerequisite task released
    
    APPROVED --> CONTRACT_LOCKED: AAI/BAI lock versioned schemas (v1.0.0 ➔ v1.1.0)
    
    CONTRACT_LOCKED --> IMPLEMENTING: Specialist agents active in isolated worktree branches
    
    IMPLEMENTING --> VERIFICATION: Post-task checks pass (tsc, lint, vitest)
    
    VERIFICATION --> RCA_REQUIRED: Quality gate or test assertion failure
    RCA_REQUIRED --> REFACTORING: Failure classified as PRODUCT_BUG (Tests Locked)
    RCA_REQUIRED --> QUARANTINED: Failure classified as FLAKY (Isolated with Timing Evidence)
    
    REFACTORING --> VERIFICATION: Targeted implementation refactor complete
    QUARANTINED --> VERIFICATION: Healed under QAI + EVAI dual sign-off
    
    VERIFICATION --> RELEASED: Pre-merge (Playwright, Semgrep, build) & Pre-prod pass
    RELEASED --> ROLLED_BACK: Critical migration or canary regression detected
    
    RELEASED --> [*]
    ROLLED_BACK --> [*]
```

---

## 🚦 Diagram 3: The 4-Tier Progressive Quality Gate Pipeline

```mermaid
flowchart LR
    subgraph Tier1["Tier 1: Pre-Edit Gate"]
        T1A["verify-path-isolation.js"]
        T1B["Fast Syntax & AST Check"]
    end

    subgraph Tier2["Tier 2: Post-Task Gate"]
        T2A["tsc --noEmit (Full Typecheck)"]
        T2B["ESLint Code Style Validation"]
        T2C["Vitest Isolated Unit Suite"]
    end

    subgraph Tier3["Tier 3: Pre-Merge Gate"]
        T3A["Integration Test Matrix"]
        T3B["Playwright Multi-Role E2E"]
        T3C["Semgrep Security AST Scan"]
        T3D["npm audit --audit-level=high"]
        T3E["npm run build (Bundle Verification)"]
    end

    subgraph Tier4["Tier 4: Pre-Production Gate"]
        T4A["Prisma DDL & RLS Status Check"]
        T4B["Critical Path Smoke Tests"]
        T4C["Rollback Compatibility Verification"]
    end

    Tier1 -->|Zero Per-File Lag| Tier2
    Tier2 -->|block_and_abort: Code 0| Tier3
    Tier3 -->|block_and_abort: Code 0| Tier4
    Tier4 -->|block_and_abort: Code 0| ReleaseReady["🚀 Production SemVer Release"]
```

---

## 🎨 Diagram 4: Mandatory UXAI Visual Mockup & Design Approval Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User / Stakeholder
    participant POAI as 🎯 POAI (Product Owner)
    participant UXAI as 👁️ UXAI (Design Lead)
    participant Fai as 🎨 Fai (Frontend Lead)

    User->>POAI: Submit Feature / Page Request
    POAI->>UXAI: Dispatch UI Specification Brief
    Note over UXAI: Rule 02: Zero Unverified Frontend Code
    UXAI->>UXAI: Formulate Layout, Color Tokens & Typography
    UXAI->>UXAI: Call generate_image (Pixel-Accurate UI Mockup)
    UXAI->>User: Render Interactive Approval Modal (ask_question)
    
    alt User Rejects or Requests Changes
        User-->>UXAI: Select Revision Request / Feedback
        UXAI->>UXAI: Regenerate Visual Mockup
        UXAI->>User: Re-prompt via ask_question
    else User Clicks Approve
        User-->>UXAI: Approved Design Specification
        UXAI->>POAI: Emit MOCKUP_APPROVED Structured Event
        POAI->>Fai: Release Frontend Lock with Approved Design Spec
        Note over Fai: Fai implements React/Tailwind with pixel precision
    end
```

---

## ⚡ Diagram 5: Parallel Sub-Swarm Branching Protocol (PSBP)

```mermaid
sequenceDiagram
    autonumber
    actor POAI as 🎯 POAI (Lead Orchestrator)
    participant AAI as 📐 AAI (Architect)
    participant BAI as ⚙️ BAI (Backend/Data)
    participant Fai as 🎨 Fai (Frontend/Motion)
    participant EVAI as 🧬 EVAI (Evolution/AI)
    participant QAI as 🧪 QAI (QA Engine)
    participant GAI as 🔀 GAI (Git Gatekeeper)

    Note over POAI,BAI: Phase 1: Contract Locking
    POAI->>AAI: Lock API Contracts & Invariants
    AAI->>AAI: Author Zod Schemas & OpenAPI 3.1 Specs
    AAI->>BAI: Lock Database Entities & DDL
    BAI->>BAI: Commit Prisma Migrations & RLS Policies
    AAI-->>POAI: CONTRACT_LOCKED Event Emitted

    Note over Fai,EVAI: Phase 2: Parallel Worktree Execution (Workspace: "branch")
    par Branch: feat/frontend-ui
        POAI->>Fai: Implement UI Primitives & Motion
    and Branch: feat/backend-api
        POAI->>BAI: Implement Postgres Queries & Redis Cache
    and Branch: feat/ai-or-eval
        POAI->>EVAI: Implement AI Streaming or Run Telemetry Benchmarks
    end

    Note over QAI,GAI: Phase 3: Convergence & Gatekeeping
    Fai-->>GAI: Submit Worktree Branch for Merge
    BAI-->>GAI: Submit Worktree Branch for Merge
    EVAI-->>GAI: Submit Worktree Branch for Merge
    GAI->>QAI: Run 4-Tier Quality Gate (Post-Task + Pre-Merge)
    QAI-->>GAI: All Gates Passed (0 errors, 0 warnings)
    GAI->>GAI: Linear Git Merge + Commitlint Validation
    GAI->>GAI: Generate CHANGELOG.md & Tag SemVer Release
```

---

## 📊 Diagram 6: Structured Telemetry & Event Ledger Bus

```mermaid
flowchart TD
    subgraph SpecialistAgents["Specialist Agent Execution"]
        POAI["🎯 POAI"]
        AAI["📐 AAI"]
        UXAI["👁️ UXAI"]
        Fai["🎨 Fai"]
        BAI["⚙️ BAI"]
        EVAI["🧬 EVAI"]
        SAI["🛡️ SAI"]
        QAI["🧪 QAI"]
        GAI["🔀 GAI"]
    end

    SpecialistAgents -->|Emits JSON Envelope| Logger["node .agents/scripts/log-event.js"]
    
    subgraph ValidationEngine["Validation Engine"]
        Logger --> SchemaCheck{"Validates Against\ntask-event-schema.json"}
        SchemaCheck -- FAIL --> Error["Halt Generation & Throw Error"]
        SchemaCheck -- PASS --> Append["Append to Immutable Ledger"]
    end

    Append --> Ledger[("📁 .agents/telemetry/event-ledger.jsonl\n(Deterministic Audit Trail)")]
    Ledger --> Monitor["📊 Observability, Replayability & Post-Mortem Analytics"]
```

---

## 🧬 Diagram 7: Continuous Evolution & Benchmark Verification Loop

```mermaid
flowchart TD
    subgraph DetectionPhase["1. Detection & Analysis"]
        Telemetry["📊 Telemetry & Failure Logs"] --> EVAI_Detect["🧬 EVAI (Detects Problem / Anti-Pattern)"]
    end

    subgraph CandidatePhase["2. Candidate Formulation"]
        EVAI_Detect --> Candidate["📝 Improvement Candidate\n(Isolated Branch Worktree)"]
        Candidate --> Benchmark["⚖️ Benchmark Against Baseline\n(Accuracy, Tokens, Pass Rate)"]
    end

    subgraph GovernancePhase["3. Verification & Promotion Gate"]
        Benchmark --> GateCheck{"Quantitative\nImprovement?"}
        GateCheck -- NO --> Refine["Refine or Discard Candidate"]
        Refine --> EVAI_Detect
        GateCheck -- YES --> QAI_Verify["🧪 QAI Verification\n(Full Test Suite & Quality Gates)"]
        QAI_Verify --> GAI_Promote["🔀 GAI Promotion & Merge\n(Conventional Commit to main)"]
    end

    GAI_Promote --> ProductionSystem["🚀 Upgraded AOS Rules & Skills"]
    ProductionSystem --> Telemetry
```

---

## 🔬 Diagram 8: Anti-Defect-Hiding Failure Classification Flow

```mermaid
flowchart TD
    TestFail["❌ Verification Test Failure"] --> RCA["🔬 EVAI / QAI Failure Classifier\n(classify-failure.cjs)"]

    RCA --> Classify{"Failure Category?"}

    Classify -->|PRODUCT_BUG| ProductDefect["🚫 Tests Strictly LOCKED\nSpecialist Refactors Source Code"]
    Classify -->|TEST_BUG| TestDefect["📐 Contract Proof + Dual Sign-Off\n(QAI Authors + EVAI Approves)"]
    Classify -->|ENVIRONMENT_ISSUE| EnvIssue["⚙️ Retry / Repair Sockets & Env\n(Zero Code Modification)"]
    Classify -->|FLAKY| FlakeIssue["🚷 Isolate to tests/quarantine/\n+ Record Timing Distribution Evidence"]

    ProductDefect --> Reverify["🧪 Return to VERIFICATION"]
    TestDefect --> Reverify
    EnvIssue --> Reverify
    FlakeIssue --> DualHeal["🏥 QAI + EVAI Dual Sign-Off Required\n(10x Consecutive Stress-Test Pass)"]
    DualHeal --> Reverify
```

---

## 📐 Diagram 9: Versioned Contract Evolution & Compatibility Graph

```mermaid
sequenceDiagram
    autonumber
    actor AAI as 📐 AAI (Architect)
    participant Compat as 🔍 contract-compat-check.cjs
    participant Fai as 🎨 Fai (Frontend Branch)
    participant BAI as ⚙️ BAI (Backend Branch)
    participant POAI as 🎯 POAI (Lead Orchestrator)

    Note over AAI: Schema Evolution Request (v1.0.0 ➔ v1.1.0)
    AAI->>Compat: Run Compatibility & Impact Analysis
    
    alt Additive & Backward-Compatible (Minor Bump)
        Compat-->>AAI: Status: PROCEED_MINOR_BUMP
        AAI->>Fai: Optional Field Broadcast (Branch Continues)
        AAI->>BAI: Optional Field Broadcast (Branch Continues)
    else Breaking Change (Major Bump v2.0.0)
        Compat-->>AAI: Status: REPLAN_AFFECTED_SUBAGENTS
        AAI->>POAI: Emit DEPENDENCY_BLOCKED Event
        POAI->>Fai: Pause & Re-plan UI Worktree
        POAI->>BAI: Pause & Re-plan Database Worktree
        POAI->>AAI: Lock v2.0.0 Invariant Schemas
    end
```

---

## 🛡️ Diagram 10: Agent Security Layer & Capability Broker Boundary

```mermaid
flowchart TD
    subgraph AgentExecution["Agent Dispatch Tier"]
        Agent["🤖 Specialist Agent\n(Fai, BAI, EVAI, QAI)"]
    end

    subgraph SecurityBroker["🛡️ Capability Broker (capability-broker.cjs)"]
        UntrustedGuard["🛡️ Untrusted Input Shield\n(Strips Prompt Injections from Files, Issues, PRs, Tools)"]
        CmdCheck{"Command / Action\nAllowlist Check"}
        FileSandbox["📁 Filesystem & Git Sandbox\n(Protected .git, SSH, and System Paths)"]
    end

    subgraph DecisionTier["Execution vs Approval Gate"]
        SafeExec["✅ Execute in Isolated Worktree"]
        HITLGate["⚠️ Mandatory Human Approval Gate\n(ask_question Modal)"]
    end

    Agent --> UntrustedGuard
    UntrustedGuard --> CmdCheck
    CmdCheck -- Standard Safe Command --> SafeExec
    CmdCheck -- "Destructive: rm, DROP TABLE,\nforce push, secret export" --> HITLGate
    HITLGate -- Approved by User --> SafeExec
    HITLGate -- Rejected by User --> Blocked["🚨 Abort with CAPABILITY_VIOLATION_BLOCKED"]
```
