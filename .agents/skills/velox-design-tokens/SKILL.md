---
name: velox-design-tokens
description: "Semantic design token contract and dark/light palettes for the Velox/TA3 platform. Use ONLY when specifically developing Velox/TA3 interfaces or when explicit Velox tokens are requested."
---

# 🎨 VELOX Semantic Design Tokens & RTL Engine

The **VELOX Design Token System** provides a zero-collision semantic property contract for building dark mode (`Obsidian`) and light mode (`Alabaster`) interfaces with native RTL support.

## 🧭 1. Semantic Token Contract
Never hardcode hex colors in components. Use the established CSS custom properties defined in `references/tokens.json`:

```css
/* Surface Tokens */
background: var(--velox-surface-primary);    /* #050b14 (Dark) / #ffffff (Light) */
background: var(--velox-surface-secondary);  /* #0d1527 (Dark) / #f8fafc (Light) */
background: var(--velox-surface-card);       /* rgba(13, 21, 39, 0.75) (Glass) */

/* Border Tokens */
border: 1px solid var(--velox-border-subtle);
border-color: var(--velox-border-focus);     /* Cyan glow */

/* Typography Tokens */
color: var(--velox-text-primary);            /* #f8fafc (Dark) / #0f172a (Light) */
color: var(--velox-text-secondary);          /* #94a3b8 (Dark) / #475569 (Light) */
color: var(--velox-text-muted);              /* #64748b */

/* Semantic Accents */
color: var(--velox-accent-cyan);             /* #00f0ff (Electric Cyan) */
color: var(--velox-accent-emerald);          /* #10b981 (Success Emerald) */
color: var(--velox-accent-amber);            /* #f59e0b (Warning Amber) */
color: var(--velox-accent-crimson);          /* #ef4444 (Critical Crimson) */
```

## 📐 2. Contrast & WCAG 2.1 AAA Rules
- Normal text requires a minimum contrast ratio of `4.5:1`.
- Enhanced accessible text requires `7:1`.
- Ensure theme switching sets `data-theme="obsidian"` or `data-theme="alabaster"` on document root.

## 🌍 3. RTL Logical Properties Mandate
- Use `margin-inline-start` instead of `margin-left`.
- Use `padding-inline-end` instead of `padding-right`.
- Flip chevron indicators dynamically when `dir="rtl"` is active.
