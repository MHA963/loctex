---
trigger: always_on
description: "Mandatory UXAI Visual Mockup & Human Alignment Gate before Frontend Implementation."
---

# 👁️ Mandatory Design Mockup Approval Gate

To eliminate frontend rework, aesthetic misalignment, and subjective layout assumptions:

## 🛑 Scope Boundary & Approval Rules

### 1. Mandatory Visual Mockup Gate (`UXAI` + `generate_image` + `ask_question`)
**Applies to**:
- Any new screen, landing page, or page route.
- Any major new UI component, modal dialog, or dashboard drawer.
- Any aesthetic theme shift, brand redesign, or layout restructuring.

**Fai is strictly forbidden from writing React components or CSS layouts for these features without prior visual image approval from the user.**

### 2. Direct Patch Path (Direct `Fai` Implementation Allowed)
**Applies to**:
- Minor CSS alignments, margin/padding tweaks, and responsive breakpoint micro-adjustments on already approved screens.
- Copy/text corrections, broken icon/link fixes, and accessibility ARIA tag patches.
- Component refactoring, TypeScript type hardening, and unit test authoring that preserves the existing approved visual layout.

---

## 🔄 The Visual Mockup Workflow:
1. **Design Formulation (UXAI)**:
   - When a new UI feature or page is initiated, **UXAI** selects the relevant design archetype, formulates the layout, and invokes `generate_image` to create a pixel-accurate visual mockup.
2. **Interactive Human Approval (`ask_question`)**:
   - UXAI presents the generated mockup artifact alongside the proposed token palette and layout structure to the user using `ask_question`.
3. **Frontend Hand-Off to Fai**:
   - Only upon explicit user confirmation does **Fai** receive the approved design specification and begin component construction with pixel-perfect fidelity.
