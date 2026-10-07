---
name: node-security-hardening
description: Goldbergyoni Node.js production security guidelines, Helmet headers, CORS policies, rate limiting, and non-root Docker execution.
---

# 🔒 Node.js Production Security Hardening

The **Node Security Hardening Skill** enforces the Goldbergyoni Node.js production security standards.

## 🧭 1. Key Security Safeguards
1. **HTTP Security Headers**: Use Helmet to configure Content Security Policy (CSP), Strict-Transport-Security (HSTS), and X-Frame-Options (`DENY`).
2. **Rate Limiting**: Apply express-rate-limit or Redis token bucket algorithms to authentication and payout endpoints.
3. **Non-Root Docker Containers**:
```dockerfile
# Non-root user execution in Docker
USER node
```
4. **Environment Isolation**: Prevent exposing server environment variables (`DATABASE_URL`, `SERVICE_KEY`) to client-side bundles.
