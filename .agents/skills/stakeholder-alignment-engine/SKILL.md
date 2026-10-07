---
name: stakeholder-alignment-engine
description: Interactive ask_question decision trees, architectural trade-off synthesizers, and human-in-the-loop consensus protocols.
---

# 🤝 Stakeholder Alignment & Decision Tree Engine

The **Stakeholder Alignment Skill** provides structured frameworks for resolving ambiguous requirements, picking technology stacks, and resolving trade-offs via Antigravity's native `ask_question` tool.

## 🧭 1. When to Trigger Alignment
Trigger `ask_question` whenever:
1. **Architectural Trade-offs**: e.g., Server-Side Rendering vs. Client Hydration, Polling vs. WebSockets, SQLite vs. PostgreSQL.
2. **Design Ambiguity**: e.g., Choosing between Multi-Page vs. Slide-Over Drawer flows.
3. **Destructive Operations**: e.g., Database migrations with schema altering column drops.

## 📝 2. Standard Interactive Alignment Pattern:
```typescript
ask_question({
  questions: [
    {
      question: "State Synchronization: Which real-time data strategy fits this project's requirements?",
      options: [
        "(Recommended) WebSocket / Supabase Realtime (Instant live updates, active presence, requires persistent connection)",
        "Optimistic SWR / React Query Polling (Simpler infrastructure, low bandwidth, 5-second sync delay)"
      ],
      is_multi_select: false
    }
  ],
  toolAction: "Aligning on state sync strategy",
  toolSummary: "Realtime state sync strategy alignment"
});
```
