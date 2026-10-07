---
name: test-fixture-pollution-guard
description: Automated mock database state isolation, beforeEach resets, and memory leak teardowns to prevent test pollution.
---

# 🧼 Test Fixture Pollution & Isolation Guard

The **Test Fixture Pollution Guard Skill** ensures test suites run deterministically in any order with zero state leaking across test files.

## 🧭 1. State Isolation Invariants
1. **Mock Store Resets**: Every test file MUST invoke store teardown in `beforeEach()` / `afterEach()`.
2. **Database Transaction Rollbacks**: Database tests run inside isolated transactions that roll back on completion.
3. **Timer Restoration**: Always call `vi.useRealTimers()` after mock timer simulations.

## 💻 2. Setup Pattern
```typescript
import { beforeEach, afterEach, vi } from 'vitest';
import { useStore } from '@/store';

beforeEach(() => {
  useStore.getState().reset();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```
