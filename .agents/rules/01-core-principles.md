---
trigger: always_on
description: "The 6 Universal Software Engineering and Product Design Principles for all agents."
---

# 🏛️ The 6 Universal Engineering & Product Design Principles

All agents across all disciplines MUST strictly uphold these 6 non-negotiable engineering principles on every turn:

### 🧭 Principle 1: Strict Contextual Information Architecture (Context Isolation)
- When a user enters a sub-resource or localized workspace (e.g., inside an individual Course, Project, Document, or Tenant), the navigation and toolbars MUST be **100% localized to that context**.
- **Anti-Pattern**: NEVER leak global platform destinations (e.g., Global Market, Wallet, Global Analytics, Cross-Project Feeds) into a specific resource sidebar. Global items belong exclusively to the Master Overview / Global Control Panel.

### 🎭 Principle 2: Authentic Domain Modeling & Role Separation of Duties
- Map system entities strictly to their authentic real-world domain capabilities:
  - **SuperAdmin**: Executive Platform Observer & Auditor (Monitors platform GMV, moderates resources, handles role promotions). **Has NO personal wallet.**
  - **Commercial Creator / Merchant**: Commercial entity. Possesses Pricing Models, Customer CRM, and the **Financial Payout Wallet**.
  - **Academic / Institutional Instructor**: Functional operator. Manages syllabus, grading console, assignments, and groups without financial wallet clutter.
  - **End Consumer / Student**: Consumer of resources, quizzes, tasks, community discussions, and catalog.

### 💎 Principle 3: Production Realism & No Artificial Shortcuts
- Never inject artificial, breaking shortcuts (e.g., demo dropdown role switchers in production headers) that break immersion or realism.
- Build realistic, high-fidelity UI states with complete typography, natural flows, proper empty states, and authentic interactive feedback.

### 📐 Principle 4: Comprehensive Domain Depth Over Superficial Placeholders
- Avoid shallow, barebones mockups. Surface rich, comprehensive domain details:
  - Full user profiles (Avatar upload, bio, specialization, verification badges, completion counters, 2FA security).
  - Complete preview cards (media previews, syllabus accordions, instructor bios, reviews).

### 🛡️ Principle 5: Three-Tier Defensive Access Boundaries (Zero UI Leakage)
- Authorization MUST be enforced across all 3 tiers:
  1. **Route Tier**: Strict `RequireAuth` / role-based route gates redirecting unauthorized attempts.
  2. **Component Tier**: Guarding interactive elements from rendering for unauthorized roles.
  3. **Action Tier**: Handler-level and database/API verification rejecting unauthorized state mutations.

### ⚡ Principle 6: Mandatory Zero-Jank Frontend Performance & Asset Budget Gate
- Zero uncompressed media bloat allowed in production:
  1. **Dual-Format Delivery**: Every raster asset MUST provide `<picture>` elements with next-gen `.webp` or `.avif` primary sources and `.jpg` fallback.
  2. **Strict Size Budget**: Maximum individual raster image size is **$200\text{ KB}$**; total application image payload must not exceed **$2.0\text{ MB}$**.
  3. **Non-Blocking Decode**: Downstream assets MUST declare `loading="lazy"` and `decoding="async"`. Critical above-the-fold Hero images MUST declare `fetchpriority="high"` and `loading="eager"`.
  4. **Zero Layout Shift (CLS)**: Every visual element MUST have explicit dimensions (`width`, `height`) or CSS aspect-ratio defined.
