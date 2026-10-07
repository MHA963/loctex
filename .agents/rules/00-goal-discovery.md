---
trigger: always_on
description: "Mandatory Pre-Execution Intent Discovery & Probing Protocol for all software engineering tasks."
---

# 🔍 Mandatory Pre-Execution Goal & Requirements Discovery Protocol

To guarantee that autonomous swarms build precisely what the user intends—across **all software and coding domains** (CLI tools, ML pipelines, systems programming, backend services, libraries/SDKs, cloud infrastructure, or frontend applications)—all agents must adhere to the **Pre-Execution Discovery Gate**.

---

## 🛑 The Discovery Invariant

> **POAI and all agents are strictly forbidden from decomposing tasks, locking technical contracts, or dispatching implementation subagents until the user's domain, technical constraints, and definition of done (DoD) are explicitly validated.**

---

## 🧭 The 4-Tier Discovery Probing Protocol (`ask_question` / `/grill-me`)

When a user submits a new project, feature request, or refactoring task, **POAI** (operating in `agent_behavior: interactive`) evaluates scope clarity across 4 core dimensions. If any dimension is ambiguous or underspecified, POAI MUST immediately invoke `ask_question` to resolve it:

```
                  [USER REQUEST RECEIVED]
                             │
                             ▼
                     [STATE: DISCOVERY]
                             │
            ┌────────────────┴────────────────┐
            ▼ (Ambiguous / Underspecified)    ▼ (Fully Specified)
   [POAI Interactive Probing]                 │
   - Domain & Runtime Target                  │
   - Non-Functional & Latency Budgets         │
   - Persistence & Input/Output Formats       │
   - Verification Rigor & Toolchains          │
            │                                 │
            ▼                                 │
   [User Clarification / Choice]              │
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
                    [STATE: GOAL_LOCKED]
                             │
                             ▼
               [PRD / RFC Goal Contract Generated]
                             │
                             ▼
                   [STATE: CONTRACT_LOCKED]
```

### 1. Dimension 1: Domain & Runtime Target
- **Target Topology**: Is this a CLI binary (Rust/Go/C++), Python data/ML script, Node/TypeScript service, library/SDK, or interactive GUI/Web app?
- **Execution Target**: Local native executable, Docker container, serverless function, Kubernetes cluster, or browser runtime?

### 2. Dimension 2: Input / Output & Data Invariants
- **Data Protocols**: JSON, Protobuf, gRPC, REST, GraphQL, CSV/Parquet, raw byte stream, or terminal STDIN/STDOUT?
- **State & Persistence**: Stateless in-memory, SQLite/PostgreSQL, Redis cache, vector database, or local filesystem?

### 3. Dimension 3: Non-Functional & Operational Budgets
- **Performance & Latency**: Real-time $(<10\text{ms})$, batch streaming, high-throughput asynchronous, or standard interactive?
- **Resource Constraints**: Memory ceiling ($<128\text{ MB}$), zero external runtime dependencies, or cloud-native scale?
- **Security & Sandboxing**: OS sandboxed execution (`RunCommandConfig(enable_sandbox=True)`), Zero-Trust secret handling, or local dev privileges?

### 4. Dimension 4: Verification Rigor & Definition of Done
- **Testing Standard**: Strict unit test suite, property-based/fuzz testing, integration test matrix, headless visual audit, or CLI exit-code assertions?
- **Deliverable Formats**: Single release binary, Docker image, published package, automated CI/CD pipeline, or complete source repository?

---

## 📋 Goal Contract Specification Format

Upon resolving the 4 discovery dimensions, POAI writes a locked **Goal Contract** before transitioning to `GOAL_LOCKED`:

```markdown
# 🎯 Locked Goal Contract
- **Task ID**: task-XYZ
- **Domain**: [CLI / Systems / Backend / ML / Library / Web / DevOps]
- **Core Intent**: Clear 2-sentence summary of the business/engineering goal.
- **Runtime & Language**: [e.g. Rust 1.80 / Python 3.12 / TypeScript 5.5]
- **Inputs & Outputs**: [CLI args, stdin, REST API, JSON payload, DB schema]
- **Non-Functional Budgets**: [Max RAM, latency, single binary, WebP asset budget]
- **Definition of Done (DoD)**:
  1. [Automated test pass rate = 100%]
  2. [Static typecheck / linter clean]
  3. [Verification against benchmark / CLI harness]
```

---

## ⚡ Execution Rules Across Universal Domains

1. **For CLI / Systems Projects**:
   - `AAI` defines CLI argument schemas (Clap, Click, Cobra, Zod).
   - `BAI` implements algorithmic core, concurrency, and I/O streams.
   - `Fai` / `UXAI` builds rich terminal layouts (Rich, Textual, Ink) or ASCII visualizers.
   - `QAI` writes CLI sub-process integration tests and exit-code assertions.

2. **For ML, Computer Vision & Data Pipelines**:
   - `AAI` locks tensor schemas, feature invariants, and pipeline DAGs.
   - `EVAI` + `BAI` builds model pipelines, deterministic seeds, and evaluation metrics.
   - `QAI` validates dataset leakage, split hygiene, and regression baselines.

3. **For Backend Microservices & Libraries**:
   - `AAI` locks public API contracts, OpenAPI/gRPC specs, and SemVer type definitions.
   - `BAI` implements persistence, transaction isolation, and connection pooling.
   - `SAI` validates input boundaries, AST sanitization, and secret management.

4. **For Web & Full-Stack Applications**:
   - `UXAI` enforces the Mandatory Visual Mockup Gate (`generate_image` + `ask_question`).
   - `Fai` builds accessible, zero-jank UI components.
