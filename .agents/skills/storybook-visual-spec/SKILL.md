---
name: storybook-visual-spec
description: Storybook component story authoring, visual regression snapshots, design spec sheets, and token documentation.
---

# 📚 Storybook Visual Spec & Interaction Engine

The **Storybook Visual Spec Skill** documents UI primitives in isolated component sandboxes and executes automated visual stories.

## 🧭 1. Component Story Format (CSF 3.0)
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ExpandingAICommandBar } from './ExpandingAICommandBar';

const meta: Meta<typeof ExpandingAICommandBar> = {
  title: 'Forms/ExpandingAICommandBar',
  component: ExpandingAICommandBar,
  parameters: { layout: 'centered' }
};
export default meta;

type Story = StoryObj<typeof ExpandingAICommandBar>;

export const Default: Story = {
  args: {
    placeholder: 'Ask AI or type command...',
    shortcutKey: '⌘K'
  }
};

export const LoadingState: Story = {
  args: {
    placeholder: 'Generating response...',
    isLoading: true
  }
};
```
