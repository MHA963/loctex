---
name: performance-lighthouse-auditor
description: Automated Core Web Vitals audit (LCP, FID, CLS, INP) and bundle size budget analyzer.
---

# ⚡ Performance & Core Web Vitals Auditor

The **Performance Auditor Skill** benchmarks Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and JavaScript bundle budgets.

## 🧭 1. Target Core Web Vitals SLA
- **LCP (Largest Contentful Paint)**: $< 2.5\text{s}$
- **CLS (Cumulative Layout Shift)**: $< 0.1$
- **INP (Interaction to Next Paint)**: $< 200\text{ms}$

## 📊 2. Bundle Budget Gate
- Initial client JS chunk MUST be $< 150\text{KB}$ gzipped.
- Heavy dependencies (e.g. Monaco Editor, Three.js) MUST be dynamically loaded via `React.lazy()` / `import()`.
