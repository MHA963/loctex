---
name: skill-self-evaluator
description: Diagnostic self-improvement engine allowing agents to evaluate their active skills, benchmark output quality, and identify missing toolchains.
---

# 🧠 Skill Self-Evaluation & Diagnostic Engine

The **Skill Self-Evaluator Skill** is a meta-cognitive capability enabling agents to audit their own toolchains, benchmark code generation against production standards, and propose enhancements.

## 🧭 1. Agent Self-Audit Procedure
When an agent is assigned a complex task, it evaluates:
1. **Tool Coverage**: Do I have the required tools/skills to complete this task with zero guesswork?
2. **Quality Benchmark**: Does my proposed code adhere to the 5 Universal Principles, WCAG 2.1 AAA accessibility, and strict TypeScript types?
3. **Anti-Pattern Check**: Have I checked `anti-patterns.json` to ensure I am not repeating past regressions?

## 📈 2. Self-Improvement Proposal Template
If an agent detects a missing pattern or recurring edge case, it authors a proposed skill or anti-pattern addition:
```json
{
  "id": "NEW_ANTI_PATTERN_ID",
  "scope": "src/path/**",
  "bad_pattern": "Description of discovered trap",
  "correct_pattern": "Documented engineering fix",
  "rationale": "Why this improves reliability"
}
```
