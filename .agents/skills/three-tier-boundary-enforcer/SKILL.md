---
name: three-tier-boundary-enforcer
description: Route-tier, Component-tier, and Action-tier defensive authorization verification.
---

# 🛡️ Three-Tier Defensive Access Boundary Enforcer

The **Three-Tier Boundary Enforcer Skill** ensures zero UI authorization leaks and robust multi-tenant security isolation.

## 🧭 1. The 3 Defensive Tiers

### Tier 1: Route Tier (`RequireAuth` Gates)
- Unauthenticated or unauthorized visitors are redirected before route components load:
```tsx
export function RequireAuth({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user || !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

### Tier 2: Component Tier (Conditional Rendering)
- Sensitive action buttons (e.g. Delete Course, Payout Request) do not render for unauthorized roles.

### Tier 3: Action Tier (Database & Handler Verification)
- Handlers and database RLS policies enforce `auth.uid() = user_id` regardless of client state.
