---
name: semgrep-security-scanner
description: Semgrep-style static analysis security rules for API secret leaks, unsafe eval, SQL injection, and insecure regex.
---

# 🔍 Semgrep Static Security Scanner

The **Semgrep Security Scanner Skill** performs static analysis over code changes to flag leaked credentials, SQL injections, and prototype pollution.

## 🧭 1. Key Invariant Audits
1. **Zero Hardcoded Secrets**: Scans for AWS keys (`AKIA...`), OpenAI keys (`sk-...`), Supabase service keys, and private SSH certs.
2. **Zero `eval()` / `new Function()`**: Rejects unsafe string-to-code evaluations.
3. **Parameterized SQL Queries**: Flags string interpolation in database queries (`$queryRawUnsafe(...)`).

## 💻 2. Automated Scan Command
```bash
# Run lightweight local security pattern audit:
npx semgrep --config=auto ./src
```
