---
name: shadcn-radix-primitives
description: Shadcn/ui and Radix UI accessible, copy-paste headless component architecture with portal modals and focus locks.
---

# 🧱 Shadcn/UI & Radix Headless Component Architecture

The **Shadcn Radix Primitives Skill** governs building accessible, unstyled, composable UI building blocks with Radix UI primitives and Tailwind CSS.

## 🧭 1. Headless Accessibility Invariants
- Modals, Dialogs, and Drawers MUST mount into `RadixDialog.Portal` nodes.
- Dropdowns and Popovers MUST use `RadixDropdown.Content` with auto collision detection.
- All interactive triggers MUST carry proper `aria-expanded` and `aria-controls` bindings.

## 💻 2. Example Compound Component Structure:
```tsx
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;

export const ModalContent = ({ className, children, ...props }: DialogPrimitive.DialogContentProps) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity" />
    <DialogPrimitive.Content
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-2xl border border-border focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);
```
