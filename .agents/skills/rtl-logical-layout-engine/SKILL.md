---
name: rtl-logical-layout-engine
description: "Bidirectional logical properties mirroring and typography rules. Use ONLY when developing Arabic, Hebrew, or RTL-enabled interfaces."
---

# 🌍 RTL Logical Layout Engine

The **RTL Logical Layout Engine Skill** enforces bidirectional layout standards so interfaces render seamlessly in Arabic/Hebrew and LTR languages.

## 🧭 1. Logical CSS Rules
| Physical Property (Forbidden) | Logical Property (Mandatory) |
| :--- | :--- |
| `margin-left: 1rem` | `margin-inline-start: 1rem` |
| `margin-right: 1rem` | `margin-inline-end: 1rem` |
| `padding-left: 1rem` | `padding-inline-start: 1rem` |
| `padding-right: 1rem` | `padding-inline-end: 1rem` |
| `left: 0` | `inset-inline-start: 0` |
| `text-align: left` | `text-align: start` |

## 🔀 2. Dynamic Directional Icon Flipping
```tsx
import { ChevronRight } from 'lucide-react';

export const DirectionalChevron = ({ isRtl }: { isRtl?: boolean }) => (
  <ChevronRight className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
);
```
