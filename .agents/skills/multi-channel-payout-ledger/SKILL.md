---
name: multi-channel-payout-ledger
description: Multi-channel creator payout processor for Levant and GCC regions with automated 15% platform split accounting.
---

# 💳 Multi-Channel Payout Ledger & Settlement Engine

The **Multi-Channel Payout Ledger Skill** manages creator balance settlements across regional channels (ZainCash, ShamBank, IBAN, Wise, USDT TRC20).

## 🧭 1. Payout Accounting Rules
- **Platform Revenue Split**: Deducts a standard 15% platform commission on gross creator earnings.
- **Minimum Threshold**: Prevents withdrawals below minimum channel limits ($50).
- **Status Lifecycle**: `pending` $\rightarrow$ `processing` $\rightarrow$ `settled` (or `rejected`).

## 💻 2. Payout Calculation Snippet
```typescript
export interface PayoutCalculation {
  grossAmount: number;
  platformFee: number;
  netPayout: number;
}

export function calculatePayout(gross: number, feeRate = 0.15): PayoutCalculation {
  const platformFee = Math.round(gross * feeRate * 100) / 100;
  const netPayout = Math.round((gross - platformFee) * 100) / 100;
  return { grossAmount: gross, platformFee, netPayout };
}
```
