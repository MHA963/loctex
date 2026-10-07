---
name: llama-agent-topology
description: Llama-agents distributed control plane, message queue routing, and isolated workspace branch dispatching.
---

# 🦙 Llama-Agents Distributed Topology & Worktree Dispatch

The **Llama-Agents Topology Skill** provides the orchestration architecture for routing messages, managing distributed control planes, and dispatching subagents into isolated ephemeral branches.

## 🧭 1. Worktree Isolation Protocol (`Workspace: "branch"`)
When POAI launches concurrent subagents, it prevents filesystem race conditions by enforcing workspace branching:

```typescript
// POAI Dispatching Fai into an isolated git branch worktree:
invoke_subagent({
  Subagents: [
    {
      TypeName: "Fai",
      Role: "Frontend UI Implementer",
      Workspace: "branch", // Ephemeral isolated git worktree
      Model: "inherit",
      Prompt: "Implement the PayoutDrawer component in isolation based on locked PayoutSchema..."
    }
  ]
});
```

## 🔄 2. Message Queue & Control Plane
- Subagents emit structured status events (`started`, `progress`, `completed`, `error`).
- The orchestrator aggregates subagent completion artifacts before triggering Phase 3 convergence.
