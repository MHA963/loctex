---
name: orvani-ui-system
description: Quiet luxury interior and spatial architecture system featuring floating glassmorphic pill navbars with compositor layer isolation, serene mineral palettes, and horizontal architectural flow.
---

# Orvani UI & Motion System

## 1. Aesthetic & Token Foundations
- **Palette**: Limestone `#F3EFEA` / `#F4F0EA`, Clay `#3C2A21`, Forest Moss `#6E7F6A` / `#4B5320`, Warm Sand `#EAE3D2`.
- **Typography**: Refined `Playfair Display` serif display headers paired with clean minimalist `Inter` sans body.
- **Radii & Layout**: Full pill containers (`rounded-full`) and generous macro whitespace (`py-20` to `py-32`).

## 2. Signature Creative Components & Motion Architecture
- **Floating Pill Navbar with Compositor Layer Isolation (`Navbar.tsx`)**:
  - Centered fixed pill container (`max-w-5xl`, `rounded-full`).
  - GSAP load entrance: `{ y: -100, autoAlpha: 0 }` to `{ y: 0, autoAlpha: 1, duration: 1.2, ease: 'power4.out' }` with explicit unmount tween cleanup (`tween.kill()`).
  - Isolate glassmorphism backdrop blurs onto their own compositor paint layer to prevent full-page repaints during scrolling.
  - Scroll state transitions use passive listeners: `window.addEventListener('scroll', handleScroll, { passive: true })`.
- **Horizontal Spatial Gallery (`SpatialFlow.tsx` / `useHorizontalScroll.ts`)**:
  - Smooth horizontal architectural scene transitions mapping vertical scroll to horizontal pan.
  - All architectural photographs must declare non-blocking `loading="lazy"` and `decoding="async"` with explicit aspect-ratio containers (`aspect-[4/5]`) to guarantee zero layout shifts (`CLS = 0`).
- **Organic Material Cards**:
  - Subtle contrast transitions (`duration-500`, scale 1.02x) over earthy textures with GPU-accelerated transforms.

## 3. Negative Constraints
- FORBIDDEN: Stark `#000000` / `#ffffff` black/white, abrupt borders, cramped vertical rhythm (`<5rem` between sections), missing `:focus-visible` rings, non-passive scroll listeners causing main-thread stutter.
