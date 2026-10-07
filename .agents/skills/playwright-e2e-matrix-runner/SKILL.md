---
name: playwright-e2e-matrix-runner
description: Playwright multi-role browser automation, authenticated session cookies, and resilient regex URL assertions.
---

# 🎭 Playwright E2E Matrix Runner

The **Playwright E2E Matrix Runner Skill** authors and executes automated browser tests across roles, desktop/mobile viewports, and edge networks.

## 🧭 1. Resilient Locator Invariants
- **Never use CSS classes**: Avoid `.btn-primary` or `.p-4`.
- **Use semantic roles & testids**: `page.getByRole('button', { name: /request payout/i })` or `page.locator('[data-testid="payout-amount"]')`.
- **Regex URL Assertions**: Use `expect(page).toHaveURL(/.*\/dashboard/)` to accommodate base paths.

## 💻 2. Multi-Role Authentication Flow:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Teacher vs Merchant Role Access', () => {
  test('teacher cannot access commercial payout dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'teacher@school.edu');
    await page.fill('[data-testid="password"]', 'TeacherPassword123!');
    await page.click('[data-testid="submit"]');

    await page.goto('/creator/payouts');
    await expect(page).toHaveURL(/.*\/unauthorized|.*\/dashboard/);
  });
});
```
