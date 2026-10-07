---
name: kanel-postgres-typegen
description: Kanel automated TypeScript type generation from live PostgreSQL databases with zero runtime overhead.
---

# 🐘 Kanel PostgreSQL Type Generator

The **Kanel Typegen Skill** inspects live PostgreSQL schemas or migration dumps and generates strictly-typed TypeScript interfaces, branded types, and table definitions.

## 🧭 1. Kanel Configuration Workflow
```javascript
// .kanelrc.js
module.exports = {
  connection: process.env.DATABASE_URL,
  outputPath: './src/types/database',
  preDeleteOutputFolder: true,
  enumStyle: 'type'
};
```

## 💻 2. Command Invocation
```bash
# Extract and generate types from live PostgreSQL database:
npx kanel
```
