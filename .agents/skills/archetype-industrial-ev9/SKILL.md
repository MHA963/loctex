---
name: ev9-showcase
description: Industrial dark luxury automotive showcase with SVG chassis scroll stroke-draw, horizontal interior sliders, tabular-num spec counters, and zero-jank passive scroll triggers.
---

# EV9 Showcase UI & Motion System

## 1. Aesthetic & Token Foundations
- **Palette**: Obsidian `#191919`, Warm Ivory `#E6DFC8`, Amethyst `#6A5C93`, Carbon `#111111`.
- **Typography**: Display `Space Grotesk` (tight tracking `-0.04em`) + legible `Inter` body with `font-variant-numeric: tabular-nums`.
- **Radii & Controls**: Pill controls (`rounded-full`) and card envelopes (`rounded-2xl` / `rounded-3xl`).

## 2. Signature Creative Components & Motion Architecture
- **Interactive Custom Cursor (`CustomCursor.tsx`)**:
  - Dual-ring cursor with `gsap.quickTo` smoothing and automatic touchscreen detection to disable unnecessary RAF loops on mobile (`window.matchMedia('(pointer: coarse)')`).
- **SVG Drivetrain Chassis Scroll Draw (`Technology.tsx`)**:
  - GSAP scroll-scrubbed stroke drawing (`strokeDashoffset: 1000` to `0`, `strokeDasharray: 1000`) highlighting battery pack, dual motors, and AWD paths on scroll.
  - Apply `will-change: stroke-dashoffset` during active scroll scrub and remove upon trigger completion.
- **Pinned Horizontal Interior Slider (`Interior.tsx`)**:
  - Pinned horizontal scroll section with passive wheel translation: `gsap.to(slider, { x: '-66.66%', pin: true, scrub: 1, end: '+=300%' })`.
  - Non-blocking lazy image loading with dominant-color placeholders.
- **Dynamic Spec Metric Counters (`Specs.tsx`)**:
  - Smooth requestAnimationFrame number interpolation with fixed tabular numeral widths (`tabular-nums`) to prevent text jitter and horizontal layout reflows.
- **Image Wipe Reveal**:
  - Pinned image mask animation using CSS `clipPath: 'inset(0% 0% 0% 0%)'` with GPU hardware acceleration.

## 3. Negative Constraints
- FORBIDDEN: Saturated neon tones, arbitrary hex values, unstyled outlines, mixing square and pill buttons in same group, non-tabular numerical counter fonts that trigger layout reflows.
