---
trigger: model_decision
description: "Database schema normalization, PostgreSQL RLS policies, and safe migration rules."
---

# ⚙️ Database & Backend Architectural Invariants

When creating or modifying database schemas, API routes, or backend adapters:

### 1. Relational Normalization & Idempotency
- Schemas must adhere to 3NF relational normalization unless explicitly denormalized for documented read optimization.
- All DDL migrations MUST be idempotent:
  - `CREATE TABLE IF NOT EXISTS`
  - `CREATE INDEX IF NOT EXISTS`
  - `DROP POLICY IF EXISTS`
- Avoid long table locks in production (use `CREATE INDEX CONCURRENTLY` where supported).

### 2. Row Level Security (RLS) Policy Mandate
- Every Supabase/PostgreSQL table holding user data MUST enable RLS.
- Security policies MUST validate ownership directly against `auth.uid()` rather than trusting client-provided body parameters or headers.

### 3. Financial Ledger Isolation
- Commercial payout channels, ledgers, and revenue split calculations belong exclusively to Merchant/Creator entities.
- Institutional instructors and students MUST have zero financial route access or database column references.
