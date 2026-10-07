---
name: supabase-realtime-rls
description: Supabase Realtime WebSocket presence channels, broadcast listeners, and Row Level Security (RLS) validation.
---

# ⚡ Supabase Realtime & RLS Enforcement Engine

The **Supabase Realtime & RLS Skill** manages live WebSocket state broadcasts, presence rooms, and database-level access policies.

## 🧭 1. Realtime Broadcast & Presence Channel
```typescript
import { createClient } from '@supabase/supabase-js';

export function subscribeToTaskUpdates(taskId: string, onUpdate: (payload: any) => void) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  const channel = supabase
    .channel(`task:${taskId}`)
    .on('broadcast', { event: 'status_change' }, (event) => onUpdate(event.payload))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
```

## 🛡️ 2. Direct `auth.uid()` RLS Policy
```sql
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read and update their own tasks"
ON user_tasks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```
