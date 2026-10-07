---
name: axe-core-a11y-auditor
description: Automated Axe-core web accessibility testing engine, WCAG 2.1 AAA compliance scoring, and DOM contrast violation detection.
---

# 👁️ Axe-Core Automated Accessibility Auditor

The **Axe-Core A11y Auditor Skill** runs automated DOM accessibility scans to guarantee WCAG 2.1 AAA compliance across all component trees.

## 🧭 1. Axe-Core Playwright Integration
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Compliance Audit (WCAG 2.1 AAA)', () => {
  test('should pass all automated axe-core accessibility checks', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21aaa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

## 🛡️ 2. Key Audit Checks
- Text and background contrast ratio $\ge 4.5:1$ (normal text), $\ge 7:1$ (enhanced).
- Form inputs have explicit `<label>` or `aria-label` associations.
- Images have non-empty `alt` attributes or `aria-hidden="true"` for decorative icons.
