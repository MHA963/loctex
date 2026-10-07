---
name: aurelia-maison
description: Sculptural high-fashion luxury system featuring editorial serif typography, metallic bronze/etain accents, zero-allocation 3D model rotation, and GSAP quickSetters.
---

# Aurelia UI & Motion System

## 1. Aesthetic & Token Foundations
- **Palette**: Sand Base `#F5F5F5`, Dark Contrast `#1C1917`, Metallic Bronze `#8C7853`, Etain `#DCD0C0`.
- **Typography**: High-contrast `Playfair Display` serif headlines + modern geometric `Outfit` sans body.
- **Radii & Layout**: Sharp `--radius-none` / `--radius-xs` (2px). Expansive editorial padding (`py-16` to `py-24`), `max-w-7xl` container.

## 2. Signature Creative Components & Motion Architecture
- **Zero-Allocation 3D Camera Orbit (`useCameraOrbit.ts`)**:
  - Encapsulate 3D camera orbit calculations in a reusable hook returning `{ orbitString, cssTransform }`.
  - Avoid creating new `gsap.to()` tweens inside `ScrollTrigger.onUpdate`. Use `gsap.quickSetter` for `rotationY`, `scale`, and `z` to eliminate per-frame memory churn.
  - Orbit formula: `theta = -45 + (progress * 360)deg, phi = 75deg, radius = 105%`.
- **SVG Logo Stroke Draw**:
  - Animated logo entrance on initial load via GSAP `strokeDasharray` and `strokeDashoffset` from path length to 0 (`ease: 'power2.inOut'`).
- **Pinned Horizontal Fashion Carousel**:
  - Pinned horizontal viewport scrub: `gsap.to(items, { xPercent: -100 * (items.length - 1), scrub: 1, ease: 'none' })`.
- **Zero Layout Shift Asset Standard (CLS = 0)**:
  - Critical hero assets must declare explicit `width`, `height`, `loading="eager"`, `decoding="async"`, and `fetchPriority="high"`.
  - Secondary runway images must declare `loading="lazy"` and `decoding="async"`.

## 3. Accessibility & Negative Constraints
- **A11y**: All interactive navigation icon buttons must have descriptive `aria-label` attributes (`aria-label="Open menu"`, `aria-label="View shopping bag"`).
- **Reduced Motion**: Graceful cross-fade fallback when `prefers-reduced-motion: reduce` is active.
- **FORBIDDEN**: Chunky rounded corners, saturated primary colors, unstyled browser fonts, cramped vertical margins (`<4rem`), per-frame tween allocations inside scroll callbacks.
