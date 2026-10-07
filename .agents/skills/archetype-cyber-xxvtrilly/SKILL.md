---
name: xxvtrilly
description: Cyber-industrial underground audio aesthetic with pitch-black canvas, blood-red/neon-magenta luminescence, zero-allocation Howler audio engine, and audio-reactive 2D canvas visualizers.
---

# xxvtrilly UI & Motion System

## 1. Aesthetic & Token Foundations
- **Palette**: Obsidian `#050505`, Blood Red `#8B0000`, Neon Magenta `#FF2D95`, Glass `#12121280` (blur 10px).
- **Typography**: Bold Display Sans paired with uppercase monospace metadata (`tracking-[0.3em]`).
- **Radii & Layout**: Sharp `0px` or micro `2-4px`. Fixed 4rem left rail navigation; expansive 10rem section padding.

## 2. Signature Creative Components & Audio Architecture
- **Zero-Allocation Howler Audio Engine (`audioEngine.ts`)**:
  - Explicitly invoke `currentHowl.unload()` before initializing new audio tracks to eliminate memory retention across track switches.
  - Pre-allocate visualizer simulation buffers (`simulationBuffer = new Uint8Array(128)`) to eliminate garbage collection pauses in 60fps render loops.
  - Calculate volume metrics using direct `for` loops rather than `Array.from()` array duplications.
- **Audio-Reactive Canvas Visualizer (`VisualizerCanvas.tsx`)**:
  - 2D Canvas centered circle (`r = 200 + volume`) with lerped Y entrance (`lerpSpeed: 0.04`).
  - Rotating 60-segment blood-red wireframe grid (`ctx.rotate(0.01)`).
  - Waveform circumference displacement from Web Audio API frequency data (`centerX + cos(rad)*(r + freq*0.5)`).
  - Outer pulsating neon-magenta glow ring (`#FF2D95`, alpha 0.3).
  - **Tab-Visibility Pausing**: Bind `visibilitychange` listener to pause `requestAnimationFrame` when `document.hidden` is true, preserving GPU/battery resources in background tabs.
- **Glitch Display Title (`GlitchTitle.tsx`)**: Multi-layered RGB-split text displacement on hover and state transitions.

## 3. Negative Constraints
- FORBIDDEN: Light backgrounds, arbitrary inline colors, bubbly corner radiuses (`>4px`), missing `:focus-visible` neon outline (`2px solid #FF2D95`), un-unloaded Howler audio instances, in-loop buffer allocations during 60 FPS audio visualizer rendering.
