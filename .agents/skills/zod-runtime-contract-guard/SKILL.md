---
name: zod-runtime-contract-guard
description: Zod schema declaration, static type inference, runtime payload invariant validation, and custom refine assertions.
---

# 🛡️ Zod Runtime Contract & Invariant Guard

The **Zod Runtime Contract Guard** enforces strict runtime boundaries across API responses, frontend inputs, and event payloads using `colinhacks/zod`.

## 🧭 1. Declaring Invariant Schemas
```typescript
import { z } from 'zod';

export const PayoutRequestSchema = z.object({
  idempotencyKey: z.string().uuid("Idempotency key must be a valid UUID v4"),
  merchantId: z.string().min(1, "Merchant ID is required"),
  amount: z.number().positive("Payout amount must be greater than 0"),
  channel: z.enum(['ZainCash', 'ShamBank', 'IBAN', 'Wise', 'USDT_TRC20']),
  destinationAccount: z.string().min(5, "Account number / address is too short"),
  timestamp: z.number().int().default(() => Date.now())
});

export type PayoutRequest = z.infer<typeof PayoutRequestSchema>;
```

## 🛡️ 2. Safe Parsing & Validation Helper
```typescript
export function validateContract<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}
```
