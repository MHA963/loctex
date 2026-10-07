---
name: tailwind-semantic-tokens
description: Tailwind CSS semantic custom tokens, dark mode variant stacking, zero arbitrary classes, and CSS custom property contracts.
---

# 🎨 Tailwind Semantic Tokens & Theme Stacking

The **Tailwind Semantic Tokens Skill** ensures zero-arbitrary class usage (`w-[317px]`, `bg-[#428177]`) and binds all styling to semantic theme tokens.

## 🧭 1. Tailwind Config Theme Extension
```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class', '[data-theme="obsidian"]'],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: 'var(--velox-surface-primary)',
          secondary: 'var(--velox-surface-secondary)',
          card: 'var(--velox-surface-card)'
        },
        accent: {
          cyan: 'var(--velox-accent-cyan)',
          emerald: 'var(--velox-accent-emerald)',
          amber: 'var(--velox-accent-amber)',
          crimson: 'var(--velox-accent-crimson)'
        }
      }
    }
  }
};
```

## 🛡️ 2. Zero-Arbitrary Class Mandate
- Always use semantic utility classes (`bg-surface-card`, `text-accent-cyan`, `border-border`) so theme switching works automatically across Dark (`Obsidian`) and Light (`Alabaster`) palettes.
