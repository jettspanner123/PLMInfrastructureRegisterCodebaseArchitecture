# Data Model: Uptime Request Dashboard View

This feature introduces **no new persisted entities and no schema changes** - every value shown on the Dashboard is derived, client-side, from data the app already persists and already fetches (`EnvironmentUptimeRequestNexus` via `GetAllEnvironmentUptimeRequests`, `DowntimeAnnouncementNexus` via `GetAllDowntimeAnnouncements`). The shapes below are **frontend-only, computed view-models** - nothing here is stored anywhere.

## 1. `UptimeRequestDashboardSummaryModel` (computed)

| Field | Type | Derivation |
|---|---|---|
| `totalCount` | `number` | Count of all fetched (non-deleted) Uptime Requests, regardless of status |
| `pendingCount` | `number` | Count where `status === 'Pending'` |

Computed once per render from the existing `useEnvironmentUptimeRequestsQuery()` result (spec FR-006). `'Approved'`/`'Completed'`/`'Rejected'`/`'Cancelled'` requests are included in `totalCount` but have no dedicated card (revised 2026-11-20 - Approved/Completed cards were removed after initial implementation; see spec.md's revision note).

> **Removed (2026-11-20)**: `UptimeRequestDailyTrendPointModel` (the 30-day trend chart's data shape) was deleted along with the trend chart itself - see spec.md's FR-005 revision note. The right pane now shows the existing requests list feed verbatim instead (no new model needed - it already has its own).

## 2. Downtime announcement list item (existing shape, filtered)

No new model - reuses the existing `DowntimeAnnouncementInterfaceModel` returned by `useAllDowntimeAnnouncementsQuery()` as-is (`heading`, `description`, `startAt`, `endAt`, `status`, etc.), filtered client-side to `status !== 'Expired'` before rendering (spec FR-008). Ordering: as returned by the existing endpoint (newest-created first, per `DowntimeAnnouncementsService`'s existing `GetAll` ordering) - no new sort requirement was specified.

## Relationships

None of the above introduce relationships between entities - they are independent aggregations over two existing, already-unrelated tables (`IG_EnvironmentUptimeRequestTBL`, `IG_DowntimeAnnouncementTBL`), exactly as those tables are related (or rather, unrelated) today.
