---
name: ai-design-mockup-generator
description: Generates high-fidelity visual design mockup images via generate_image and enforces mandatory human approval before frontend implementation.
---

# 🎨 AI Design Mockup Generator & Approval Protocol

The **AI Design Mockup Generator Skill** is UXAI's core superpower: creating pixel-accurate, high-fidelity visual design mockups and locking human approval before any frontend code is authored by Fai.

## 🛑 Non-Negotiable Gate: Zero Unverified Frontend Code
**Fai is strictly forbidden from writing React components or CSS layouts without explicit human approval on UXAI's generated visual mockup.**

## 🔄 1. Step-by-Step Generation & Approval Workflow

### Step 1: Formulate the Visual Prompt
Formulate a descriptive prompt defining layout hierarchy, color palette (`Obsidian` dark or `Alabaster` light), typography, and component densities.
> *Rule*: Generate only the UI interface itself without surrounding device frames (laptops, phones) unless explicitly requested.

### Step 2: Invoke `generate_image`
```typescript
generate_image({
  ImageName: "creator_payout_drawer_mockup",
  Prompt: "Clean, high-density dark mode UI of a commercial creator payout drawer. Features Levant and GCC withdrawal channels (ZainCash, ShamBank, IBAN, Wise, USDT), net payout calculations deducting 15% platform split, neon cyan accent buttons, and transaction history cards. Minimalist, modern SaaS dashboard.",
  AspectRatio: "16:9",
  toolAction: "Generating creator payout drawer UI mockup",
  toolSummary: "Generate visual UI mockup"
});
```

### Step 3: Present for Human Approval via `ask_question`
Once the image artifact is rendered, invoke `ask_question` to render an interactive approval modal:
```typescript
ask_question({
  questions: [
    {
      question: "Visual Design Sign-Off: Please review the generated payout drawer mockup. Should Fai proceed with implementation?",
      options: [
        "(Recommended) Approve visual design and proceed with React component implementation",
        "Request visual changes (Specify in write-in feedback)"
      ],
      is_multi_select: false
    }
  ],
  toolAction: "Requesting visual mockup approval",
  toolSummary: "Visual mockup sign-off gate"
});
```

### Step 4: Hand-Off to Fai
Only after approval is received does UXAI provide the confirmed visual spec to **Fai** for pixel-perfect coding.
