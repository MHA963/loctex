---
name: cqrs-event-bus-engine
description: Event-driven CQRS topology, in-memory event buses, event replay handlers, and WebSocket pub/sub synchronization.
---

# 🛰️ CQRS Event Bus & Realtime Dispatch Engine

The **CQRS Event Bus Skill** coordinates state mutations (Commands) and state reads (Queries) with deterministic pub/sub event channels.

## 🧭 1. Command vs Query Architecture
- **Commands**: Synchronous or asynchronous state mutations (`CreateSubmissionCommand`, `ProcessPayoutCommand`).
- **Queries**: Read-only projection queries (`GetCourseLedgerQuery`, `GetThreatRadarQuery`).

## 🛡️ 2. Type-Safe Event Bus Dispatcher
```typescript
type EventCallback<T = any> = (payload: T) => void;

export class CQRSEventBus {
  private static subscribers = new Map<string, Set<EventCallback>>();

  static subscribe<T>(eventType: string, callback: EventCallback<T>): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);
    return () => this.subscribers.get(eventType)?.delete(callback);
  }

  static publish<T>(eventType: string, payload: T): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      handlers.forEach(fn => fn(payload));
    }
  }
}
```
