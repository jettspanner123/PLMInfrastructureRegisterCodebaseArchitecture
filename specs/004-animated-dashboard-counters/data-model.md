# Data Model: Animated Dashboard Counters

This feature introduces **no new entities, no new computed shapes, and no schema changes**. It reuses the exact two values `EnvironmentUptimeRequestDashboardStaticComponent` (feature 003) already computes client-side:

| Value | Type | Already computed by |
|---|---|---|
| `summary.totalCount` | `number` | Existing `useMemo` in `EnvironmentUptimeRequestDashboardStaticComponent.tsx` (feature 003, data-model.md §1) |
| `summary.pendingCount` | `number` | Same `useMemo` |

The only change is which JSX element renders each value (`<NumberFlow value={...} />` instead of a plain `<span>`) - nothing about how either number is derived changes (spec FR-005).

## Relationships

None - this feature touches no entity relationships; it is a pure display-layer change in an existing component.
