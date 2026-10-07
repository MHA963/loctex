---
name: agno-swarm-runtime
description: Agno-inspired multimodal execution state machines, tool-calling loops, and structured telemetry monitors.
---

# 🤖 Agno Swarm Runtime Engine

The **Agno Swarm Runtime Skill** manages state transitions, tool execution loops, and runtime recovery across autonomous agents.

## 🧭 1. Autonomous Agent Execution Loop
```
[Plan Formulation] ──► [Tool Call Dispatch] ──► [Result Evaluation] ──► [Invariant Check]
       ▲                                                                      │
       └───────────────────────── (Iterate / Retry on Failure) ───────────────┘
```

## 🛡️ 2. State Machine Guarantees
1. **Tool Output Validation**:
   - Inspect every tool output before proceeding. If a tool fails or throws an error, halt and trigger Checkpoint Omega RCA.
2. **Context Compaction**:
   - Strip redundant JSON payloads and long terminal logs to preserve model attention for active reasoning.
3. **Graceful Degradation**:
   - If an optional subagent fails or times out, degrade gracefully with simulated mock fallbacks rather than crashing the orchestrator loop.
