---
name: contract-locking
description: Versioned contract evolution, SemVer compatibility checks, consumer-driven contract tests, and change impact analysis.
---

# 🔒 Versioned Contract Evolution & Compatibility Engine

The **Contract Locking Skill** manages the full lifecycle of API, database, and domain invariant contracts across all sub-swarms. Rather than simply freezing schemas statically, it governs **versioned contract evolution** with automated compatibility checks.

---

## 🧭 1. The Contract Evolution Lifecycle

```
    Contract v1.0.0 (Locked)
               │
               ▼
   Implementation in Progress (Fai / BAI / EVAI on Branch Worktrees)
               │
               ▼
   Schema Evolution Need Discovered
               │
               ▼
   Contract v1.0.0 ➔ v1.1.0 (Candidate Mutation)
               │
               ▼
   node .agents/scripts/contract-compat-check.cjs
         /                    \
   [Additive / Minor]      [Breaking / Major]
         │                          │
   Seamless Evolution        Block Branch Worktrees,
   Worktrees Proceed         Change Impact Analysis,
                             Re-plan Affected Agents
```

---

## 🔬 2. Compatibility Checks & SemVer Rules

1. **Additive Changes (Minor Bump `1.0.0 ➔ 1.1.0`)**:
   - Adding optional fields with `.optional()` or default values.
   - Adding new non-conflicting endpoints or query parameters.
   - **Policy**: Allowed seamlessly; running subagent worktrees continue without interruption.
2. **Breaking Changes (Major Bump `1.0.0 ➔ 2.0.0`)**:
   - Removing existing fields or endpoints.
   - Adding required fields without defaults.
   - Mutating property types (e.g. `string` ➔ `number`).
   - **Policy**: `transition-engine.cjs` transitions state to `WAITING_FOR_DEPENDENCY`, runs change impact analysis, and alerts POAI to re-plan affected branches.

---

## 🧪 3. Consumer-Driven Contract Tests

Consumers (Fai on frontend, BAI on backend) register consumer contract specs in `tests/contracts/`:
```typescript
import { CheckoutPayloadSchema, CheckoutResponseSchema } from '@/contracts/checkout.v1';

test('verify frontend checkout client satisfies locked contract v1.1.0', () => {
  const mockPayload = generateClientCheckoutRequest();
  const parsed = CheckoutPayloadSchema.safeParse(mockPayload);
  expect(parsed.success).toBe(true);
});
```
