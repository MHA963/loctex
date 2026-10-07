# 🛡️ ASP: Aegis Swarm Protocol (Universal Multi-Agent OS)

> An autonomous, self-improving, role-specialized multi-agent software engineering organization powered by the **Aegis Swarm Protocol (ASP)**, **Google Antigravity SDK Alignment**, **Pre-Execution Intent Discovery (`ask_question`)**, **Universal Domain Adaptability (CLI, ML/CV, Systems, Web, APIs)**, **17-State FSM Execution**, and **45+ Production-Grade Skills**.

---

## 📂 Repository Contents

```text
ASP-Aegis-Swarm-Protocol/
├── .agents/
│   ├── custom-agents/                 # Universal Role-Specialized Agent Definitions
│   │   ├── poai.md                    # 🎯 Principal Orchestrator & Intent Probing (Interactive)
│   │   ├── aai.md                     # 📐 Systems Architect & Schema Contracts (Zod / Pydantic / Protobuf)
│   │   ├── uxai.md                    # 👁️ UX, HCI & Mockup Specialist (Axe-Core / ImageGen / TUIs)
│   │   ├── fai.md                     # 🎨 UI & Interaction Engineer (Web / React / Rich TUIs / Desktop)
│   │   ├── bai.md                     # ⚙️ Systems & Backend Engineer (Rust / Go / Python / Node / SQL)
│   │   ├── evai.md                    # 🧬 Evolution, Evaluation, ML & AI (SDK .eval() / PyTorch / RAG)
│   │   ├── sai.md                     # 🛡️ Security, Sandboxing & Policy Broker (9-Tier Precedence)
│   │   ├── qai.md                     # 🧪 QA, Benchmarking & Verification (Vitest / Pytest / Cargo / Playwright)
│   │   └── gai.md                     # 🔀 Git & Packaging Gatekeeper (SemVer / PyPI / Crates / npm / CI/CD)
│   ├── rules/                         # Progressive Disclosure Rules
│   │   ├── 00-goal-discovery.md       # (always_on) Mandatory Pre-Execution Goal & Requirements Probing
│   │   ├── 01-core-principles.md      # (always_on) The 6 Universal Principles
│   │   ├── 02-design-mockup-gate.md   # (always_on) Mandatory UXAI Mockup Image Approval Gate
│   │   ├── 03-parallel-psbp.md        # (model_decision) PSBP Swarm Orchestration & Branch Worktrees
│   │   ├── 04-backend-database.md     # (model_decision) Persistence Invariants & Migrations
│   │   ├── 05-git-quality-gate.md     # (model_decision) Conventional Commits & Quality Gates
│   │   └── 06-structured-state-events.md # (always_on) 17-State FSM, 9-Tier Policies & Stop Hook Continuation
│   ├── schemas/                       # Event Envelopes & TaskState Definitions
│   │   ├── task-state.ts              # TypeScript 17-State Finite State Machine & Types
│   │   ├── task-event-schema.json     # Formal JSON Schema for Telemetry Events
│   │   ├── evaluation-schema.json     # Benchmark Test Specification Schema
│   │   ├── evolution-candidate-schema.json # Candidate Mutation Schema
│   │   └── aos-metrics.ts             # Quantitative Metrics & Scoring Model
│   ├── evaluations/                   # Deterministic Benchmark Registry
│   │   ├── benchmark.json             # Master Benchmark Catalog & Weights
│   │   ├── frontend/                  # Mockup Gate & WCAG Tokens Benchmarks
│   │   ├── backend/                   # RLS Isolation & Zero-Downtime Migration Benchmarks
│   │   ├── architecture/              # Contract Locking & Context Boundary Benchmarks
│   │   ├── security/                  # AST Sanitization & 3-Tier Auth Benchmarks
│   │   └── regression/                # Anti-Pattern Regression Prevention
│   ├── evolution/                     # Autonomous Self-Evolution Engine
│   │   ├── proposals/                 # EVAI-Generated Optimization Proposals
│   │   ├── candidates/                # Staged Candidate Mutations
│   │   ├── evaluations/               # Replay Benchmark Comparison Reports
│   │   ├── promoted/                  # Versioned Evolution Promotion Ledger
│   │   └── rejected/                  # Disqualified Candidate Archive
│   ├── policies/                      # Swarm Operational Policies
│   │   ├── task-decomposition.json    # Epic & Bugfix Subtask Breakdown Policy
│   │   ├── routing-policy.json        # Universal Specialist Routing & Domain Activation Rules
│   │   ├── security-capability-policy.json # 9-Tier Precedence & Sandbox Policy
│   │   └── quality-gate-policy.json   # Multi-Tier Hook Failure Thresholds
│   ├── telemetry/                     # Immutable Audit & Event Logging
│   │   └── event-ledger.jsonl         # Append-Only Cross-Agent Event Ledger
│   ├── scripts/                       # Replay Engine, Gatekeepers & Evolution Automation
│   │   ├── capability-broker.cjs      # 9-Tier Policy Precedence & Prompt-Injection Guard
│   │   ├── verify-path-isolation.cjs  # Fast pre_edit lightweight boundary guard
│   │   ├── log-event.cjs              # Structured event logger & state validator
│   │   ├── replay-engine.cjs          # Baseline vs Candidate benchmark replay harness
│   │   ├── promote-candidate.cjs      # GAI evolution promotion gatekeeper
│   │   ├── rollback-evolution.cjs     # Emergency canary rollback engine
│   │   ├── extract-human-correction.cjs # /learn human correction distillation engine
│   │   └── run-evolution-loop.cjs     # Closed-loop autonomous self-improvement runner
│   ├── skills/                        # 45+ Production-Grade Progressive Skills
│   │   ├── # 🎯 POAI Skills
│   │   ├── sop-multiagent-orchestrator/
│   │   ├── agno-swarm-runtime/
│   │   ├── llama-agent-topology/
│   │   ├── wsjf-backlog-prioritization/
│   │   ├── stakeholder-alignment-engine/
│   │   ├── # 📐 AAI Skills
│   │   ├── zod-runtime-contract-guard/
│   │   ├── openapi-ts-codegen/
│   │   ├── cqrs-event-bus-engine/
│   │   ├── idempotency-key-manager/
│   │   ├── distributed-tracing-telemetry/
│   │   ├── # 🎨 Fai Skills
│   │   ├── shadcn-radix-primitives/
│   │   ├── framer-motion-physics-engine/
│   │   ├── tailwind-semantic-tokens/
│   │   ├── zero-cost-asset-optimizer/
│   │   ├── rtl-logical-layout-engine/
│   │   ├── # ⚙️ BAI Skills
│   │   ├── kanel-postgres-typegen/
│   │   ├── supabase-realtime-rls/
│   │   ├── prisma-zero-downtime-migrator/
│   │   ├── multi-channel-payout-ledger/
│   │   ├── cache-aside-redis-booster/
│   │   ├── # 🧬 EVAI Skills
│   │   ├── self-improving-evolution-loop/
│   │   ├── skill-self-evaluator/
│   │   ├── instructor-zod-structured-llm/
│   │   ├── vercel-ai-sdk-streaming/
│   │   ├── litellm-fallback-router/
│   │   ├── rag-context-compressor/
│   │   ├── dynamic-mdx-sandbox-parser/
│   │   ├── # 👁️ UXAI Skills
│   │   ├── ai-design-mockup-generator/
│   │   ├── axe-core-a11y-auditor/
│   │   ├── radix-focus-trap-manager/
│   │   ├── storybook-visual-spec/
│   │   ├── headless-visual-audit/
│   │   ├── # 🛡️ SAI Skills
│   │   ├── dompurify-xss-sanitizer/
│   │   ├── semgrep-security-scanner/
│   │   ├── three-tier-boundary-enforcer/
│   │   ├── node-security-hardening/
│   │   ├── cryptographic-token-vault/
│   │   ├── # 🧪 QAI Skills
│   │   ├── playwright-e2e-matrix-runner/
│   │   ├── vitest-react-testing-library/
│   │   ├── test-fixture-pollution-guard/
│   │   ├── flaky-test-analyzer-healer/
│   │   ├── performance-lighthouse-auditor/
│   │   ├── # 🔀 GAI Skills
│   │   ├── commitlint-conventional-validator/
│   │   ├── semantic-release-automator/
│   │   ├── gh-cli-pr-gatekeeper/
│   │   ├── git-rebase-drift-preventer/
│   │   ├── static-type-quality-gate/
│   │   └── # 🧠 Meta Skills & Persistent Ledgers
│   │       ├── velox-design-tokens/
│   │       ├── contract-locking/
│   │       └── post-mortem-ledger/
│   ├── hooks.json                     # 4-Tier Progressive Quality Gate & SDK Lifecycle Hooks
│   └── user_prefs.json                # Workspace State & HITL Config
├── ARCHITECTURE_DIAGRAMS.md           # Visual Mermaid topology and sequence diagrams
├── HOW_TO_USE_IN_ANY_PROJECT.md       # Step-by-step injection guide for new codebases
└── README.md                          # System overview and quick reference
```

---

## 🌟 Key Highlights

1. **Mandatory Intent & Goal Discovery Gate (Rule 00)**: POAI actively interviews the user (`ask_question` / `/grill-me`) across 4 discovery dimensions (Domain, Protocols, Non-Functional Budgets, DoD) before decomposing tasks or creating worktree branches.
2. **Universal Software & Coding Adaptability**: Fully generalized beyond web apps to handle CLI tools, ML/CV pipelines, systems programming (Rust/Go/C++), microservices, and library packages.
3. **Google Antigravity SDK Alignment**: Direct integration with SDK behavioral modes (`INTERACTIVE` vs `AUTONOMOUS`), 9-tier safety precedence, OS command sandboxing, and Stop Hook auto-healing continuation.
4. **Closed-Loop Autonomous Self-Improvement**: EVAI continuously benchmarks swarm performance, evolving rules and skills against deterministic regression suites with zero subjective self-grading.
5. **Deterministic 17-State FSM**: Strict state transitions from `DISCOVERY` through `GOAL_LOCKED`, `CONTRACT_LOCKED`, `IMPLEMENTING`, and `VERIFICATION` to `RELEASED`.
