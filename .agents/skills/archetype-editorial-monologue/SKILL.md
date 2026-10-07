---
name: monologue-ui-system
description: Editorial sonic synthesis interface featuring interactive hover-reactive SVG soundwave play buttons, decoupled WebAudio singleton manager, scroll-linked horizontal carousels, and sticky pin narrative steps.
---

# Monologue UI & Motion System

## 1. Aesthetic & Token Foundations
- **Palette**: Burgundy Ink `#4A0404`, Warm Parchment `#FDF6E3` / `#F7F4EE`, Ambient Glow `#4A040410`.
- **Typography**: Display `Outfit` (tight tracking) for headlines + balanced `Inter` for prose.
- **Radii & Surfaces**: Pill controls (`rounded-full`), glassmorphic trays (`backdrop-blur-md bg-brand-beige/70 border-b border-brand-red/10`).

## 2. Signature Creative Components & Audio Architecture
- **Decoupled WebAudio Engine (`audioManager.ts`)**:
  - Encapsulate `AudioContext`, gain nodes, and oscillator synthesis in a singleton manager with strict `unlock()` handling on the first user interaction.
  - Provide automatic teardown (`audioManager.destroy()`) on component unmount to prevent audio context memory leaks and browser suspension warnings.
- **Interactive Soundwave Play Button (`Hero.tsx`)**:
  - Central play button with pulsating ring and tactile audio tone synthesis on click (`audioManager.createTone(523.25, 0.4)`).
  - Hover-reactive 12-bar equalizer: Animates height from static ratios to continuous loop `height: ["30%", "100%", "30%"]` with staggered delay (`i * 0.05s`) on mouse enter.
- **Pinned Horizontal Feature Carousel (`HorizontalCarousel.tsx`)**:
  - `h-[500vh]` section pinned viewport mapping scroll progress to `x: ["0vw", "-400vw"]` using Framer Motion or GSAP.
- **Sticky Pin Step Narrative (`StickyPinSection.tsx`)**:
  - `h-[300vh]` pinned workflow container mapping scroll intervals to step text opacity and image scale morphing (`scale: [1.1, 1]`).
- **Passive Scroll & CSS Standardization**:
  - All scroll event listeners must declare `{ passive: true }`.
  - `@import url(...)` font declarations must strictly precede `@import "tailwindcss"` and other CSS rules to prevent bundler warnings.

## 3. Negative Constraints
- FORBIDDEN: Arbitrary hex/rgb literals, pure black/white canvas, cramped layouts, missing accessible `aria-label` attributes on audio/menu toggles, un-teardown AudioContext instances.
