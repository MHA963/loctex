---
name: post-mortem-ledger
description: "Retrieves architectural anti-patterns, past regression fixes, and team engineering non-negotiables."
---

# Post-Mortem & Memory Injection Protocol

Before proposing any code change, search `.agents/skills/post-mortem-ledger/anti-patterns.json` for records matching your target file path or domain.

## Mandatory Anti-Pattern Rule
If your plan matches any `bad_pattern` in the ledger, halt generation and immediately adopt the designated `correct_pattern`. 

When a build or test fails and is resolved:
1. Log the failure signature, failing code, and working solution to `anti-patterns.json`.
2. This ensures no agent repeats the same regression across future sessions.
