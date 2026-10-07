---
name: skygrid-ui
description: Aerospace command telemetry interface featuring multi-node canvas radar signal networks with IntersectionObserver viewport pausing, kinetic interactive cursor tracking grid, and airplane entrance reveals.
---

# SkyGrid UI & Motion System

## 1. Aesthetic & Token Foundations
- **Palette**: Deep Space Black `#0A0E17` / `#020408`, Translucent Glass `rgba(15,25,45,0.7)`, Electric Blue `#00F0FF` / `#00E5FF`, Telemetry Cobalt `#1937A0`.
- **Typography**: Ultra-bold condensed `Outfit` headlines + `JetBrains Mono` telemetry counters and coordinates.
- **Radii & Layout**: 12-column responsive fluid grid, `max-w-7xl`, glassmorphic HUD borders (`border-blue-500/20`).

## 2. Signature Creative Components & Performance Architecture
- **Network Radar Signal Canvas (`NetworkRadarCanvas.tsx`)**:
  - High-performance 2D Canvas with 5 topological telemetry nodes and DPR clamping: `Math.min(window.devicePixelRatio || 1, 2)`.
  - **IntersectionObserver Viewport Throttling**: Use `IntersectionObserver` on the canvas container to pause the `requestAnimationFrame` render loop when scrolled off-screen and resume instantly upon entering view.
  - Dashed animated spline connection lines (`lineDashOffset: -(ts * 0.018)`).
  - 24-step glowing signal bullet trails with dual-blur shadows (`shadowBlur: 14` & `8`).
  - Rotating radar sweep scanners on active nodes (`sweepSpeed` with radial alpha gradients).
  - Sequential signal dispatch chaining (Node 1 -> Node 0 -> Nodes 2, 3, 4).
- **Interactive Kinetic Grid (`KineticGrid.tsx`)**:
  - 240 micro-indicators in a responsive CSS grid with radial alpha mask.
  - **RAF Mouse Throttling**: Throttle cursor angle calculations to `requestAnimationFrame` to prevent main-thread event congestion during rapid mouse movement.
  - Cursor tracking using `gsap.quickTo(cell, 'rotation')`.
- **Custom Cursor with Touch Bypass (`CustomCursor.tsx`)**:
  - Dual-ring cursor with `gsap.quickTo` smoothing, passive event listeners, and automatic touch bypass on mobile touchscreens (`window.matchMedia('(pointer: coarse)')`).

## 3. Accessibility & Negative Constraints
- **A11y**: Floating navigation buttons must declare descriptive `aria-label` attributes (`aria-label="Toggle navigation menu"`, `aria-label={item.label}`).
- FORBIDDEN: Continuous un-paused canvas animation loops off-screen, arbitrary un-throttled mouse event listeners, light backgrounds, arbitrary inline colors, suppressed `:focus-visible` rings.
