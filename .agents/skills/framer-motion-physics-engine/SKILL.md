---
name: framer-motion-physics-engine
description: Framer Motion spring physics, layout morphing, magnetic cursor pulls, gesture-driven drawer pulls, and exit transitions.
---

# 🚀 Framer Motion Spring Physics & Micro-Interactions

The **Framer Motion Physics Engine Skill** engineers non-blocking, GPU-accelerated micro-interactions and layout transitions.

## 🧭 1. Natural Spring Physics Settings
Avoid linear animations. Always use damped harmonic oscillator physics:
```typescript
export const springTransition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.8
};
```

## 🧲 2. Magnetic Cursor Pull Hook
```tsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const MagneticButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.35);
    y.set((e.clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      style={{ x, y }}
      transition={springTransition}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="relative px-6 py-3 rounded-lg font-medium bg-primary text-primary-foreground shadow-lg"
    >
      {children}
    </motion.button>
  );
};
```
