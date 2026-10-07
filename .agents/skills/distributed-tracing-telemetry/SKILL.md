---
name: distributed-tracing-telemetry
description: OpenTelemetry trace context propagation, distributed span emission, and structured observability schemas.
---

# 📡 Distributed Tracing & Telemetry Architecture

The **Distributed Tracing Telemetry Skill** instruments cross-service calls, API latencies, and agent execution paths using OpenTelemetry standards.

## 🧭 1. Trace Context Propagation
Every async task or cross-subagent request MUST carry a `traceId` and `spanId`:

```typescript
export interface TraceContext {
  traceId: string;
  spanId: string;
  agentRole: string;
  timestamp: number;
}

export function createTrace(role: string): TraceContext {
  return {
    traceId: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    spanId: `span_${Math.random().toString(36).substring(2, 9)}`,
    agentRole: role,
    timestamp: Date.now()
  };
}
```

## 📊 2. Structured Telemetry Metric Schema
- Emits structured telemetry (`durationMs`, `status`, `errorType`, `tokenUsage`) to log sinks and dashboard gauges without blocking main execution threads.
