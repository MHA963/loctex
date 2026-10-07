---
name: prisma-zero-downtime-migrator
description: Prisma safe expand-and-contract migrations, non-blocking DDL alteration checks, and concurrent indexing.
---

# 🛡️ Prisma Zero-Downtime Migration Engine

The **Prisma Zero-Downtime Migrator Skill** prevents table locks and downtime during production schema changes using the Expand-and-Contract pattern.

## 🧭 1. Expand-and-Contract Migration Phases
1. **Phase 1 (Expand)**: Add the new column as `NULLABLE` without removing the old column.
2. **Phase 2 (Dual Write)**: Update backend code to write to both old and new columns.
3. **Phase 3 (Backfill)**: Run asynchronous data backfill scripts in batches.
4. **Phase 4 (Contract)**: Remove old column references in code, then drop the legacy column in a subsequent migration.

## 💻 2. Safe Prisma Migration Command
```bash
# Generate and review migration SQL before applying:
npx prisma migrate dev --create-only
```
