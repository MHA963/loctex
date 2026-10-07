---
name: radix-focus-trap-manager
description: Radix UI focus trap management, keyboard tab navigation traps, and screen-reader ARIA tree validation.
---

# 🎯 Radix Focus Trap & Keyboard Navigation Manager

The **Radix Focus Trap Manager Skill** ensures modal dialogs, slide-over drawers, and dropdown menus trap keyboard focus safely without leaking focus to background elements.

## 🧭 1. Focus Trap Invariants
1. **Initial Focus**: When a modal or drawer opens, focus immediately lands on the first interactive element or close button.
2. **Tab Cycling**: Pressing `Tab` cycles focus strictly inside the overlay; pressing `Shift+Tab` cycles backwards.
3. **Escape Key**: Pressing `Esc` immediately triggers `onClose` and restores focus back to the triggering element.
4. **Scroll Lock**: The background `<body>` scroll is locked (`overflow: hidden`) while overlays are mounted.

## 💻 2. Radix Focus Scope Implementation
```tsx
import { FocusScope } from '@radix-ui/react-focus-scope';

export const AccessibleModalContainer = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <FocusScope asChild loop trapped onMountAutoFocus={(e) => e.preventDefault()}>
      <div role="dialog" aria-modal="true" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        {children}
      </div>
    </FocusScope>
  );
};
```
