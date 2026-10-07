---
name: vitest-react-testing-library
description: React Testing Library DOM interaction testing with Vitest, userEvent typing, focus assertions, and accessibility role queries.
---

# 🧪 Vitest & React Testing Library Interaction Suite

The **Vitest React Testing Library Skill** tests user interactions, component lifecycles, and error states without mounting full browsers.

## 🧭 1. User Interaction Testing Pattern
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PayoutDrawer } from '@/components/PayoutDrawer';

test('calculates net payout deducting 15% platform split on typing', async () => {
  const user = userEvent.setup();
  render(<PayoutDrawer isOpen={true} onClose={() => {}} />);

  const amountInput = screen.getByLabelText(/payout amount/i);
  await user.type(amountInput, '100');

  expect(screen.getByText('$85.00')).toBeInTheDocument(); // 15% split calculated
});
```
