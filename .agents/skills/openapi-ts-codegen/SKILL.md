---
name: openapi-ts-codegen
description: Hey-API and Typed-OpenAPI TypeScript SDK generators, OpenAPI 3.1 schema transformers, and type-safe fetch client codegen.
---

# ⚡ OpenAPI-TS & Typed Client Generator

The **OpenAPI-TS Codegen Skill** transforms OpenAPI / Swagger 3.1 definitions into type-safe TypeScript SDKs, eliminating manual client writing.

## 🧭 1. Hey-API Codegen Workflow
```bash
# Generate type-safe fetch client and schemas from OpenAPI definition:
npx @hey-api/openapi-ts -i ./openapi.json -o ./src/client -c @hey-api/client-fetch
```

## 🛡️ 2. Type-Safe Client Consumption
```typescript
import { createClient } from './client';
import { getPayoutLedger, createCourseSubmission } from './client/sdk.gen';

const client = createClient({ baseUrl: 'https://api.platform.com/v1' });

// Fully typed request params & response payload:
const { data, error } = await getPayoutLedger({
  client,
  query: { status: 'completed', limit: 20 }
});
```
