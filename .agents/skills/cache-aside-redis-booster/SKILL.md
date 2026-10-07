---
name: cache-aside-redis-booster
description: High-speed Redis caching strategies, stampede mutex locks, and deterministic TTL cache invalidation.
---

# 🚀 Cache-Aside Redis Performance Booster

The **Cache-Aside Redis Skill** accelerates heavy database queries, prevents cache stampedes, and automates cache invalidation.

## 🧭 1. Cache-Aside Pattern
```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function getCachedOrFetch<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const freshData = await fetcher();
  await redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);
  return freshData;
}
```

## 🛡️ 2. Stampede Prevention (Mutex Lock)
- When a high-traffic key expires, acquire a 2-second Redis distributed lock (`SET key lock NX EX 2`) before querying the database, preventing thousands of concurrent queries from hitting the DB.
