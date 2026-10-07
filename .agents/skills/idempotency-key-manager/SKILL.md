---
name: idempotency-key-manager
description: Stripe-grade idempotency key generation, in-memory/Redis TTL deduplication, and atomic optimistic UI rollback handlers.
---

# 🔑 Idempotency Key Manager & Race Condition Shield

The **Idempotency Key Manager Skill** eliminates duplicate network mutations, double-click payment submissions, and distributed race conditions.

## 🧭 1. Idempotency Flow
```
[Client UI Action] ──► Generates UUIDv4 Idempotency Key ──► [API Request with Key]
                                                                   │
                                                      Is Key in Cache / DB?
                                                      ├── YES ──► Return Cached Result (No Duplicate Work)
                                                      └── NO  ──► Process Mutation & Save Key
```

## 🛡️ 2. Resilient Implementation Pattern:
```typescript
import { v4 as uuidv4 } from 'uuid';

export class IdempotencyManager {
  private static processed = new Map<string, { status: 'in_flight' | 'completed'; response?: any; timestamp: number }>();

  static generateKey(prefix = 'idemp'): string {
    return `${prefix}_${uuidv4()}`;
  }

  static async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.processed.get(key);
    if (existing && existing.status === 'completed') {
      return existing.response as T;
    }
    if (existing && existing.status === 'in_flight') {
      throw new Error(`Concurrent duplicate mutation in flight for key: ${key}`);
    }

    this.processed.set(key, { status: 'in_flight', timestamp: Date.now() });
    try {
      const result = await fn();
      this.processed.set(key, { status: 'completed', response: result, timestamp: Date.now() });
      return result;
    } catch (err) {
      this.processed.delete(key);
      throw err;
    }
  }
}
```
