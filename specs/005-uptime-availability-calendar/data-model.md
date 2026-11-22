# Data Model: Uptime Request Availability Calendar

This feature introduces **no new persisted entities and no schema changes**. It reuses two existing, unmodified entities already fetched elsewhere in this app (`EnvironmentUptimeRequestInterfaceModel` via `useEnvironmentUptimeRequestsQuery()`, `DowntimeAnnouncementInterfaceModel` via `useAllDowntimeAnnouncementsQuery()`), filtered and re-rendered client-side. The shapes below are **frontend-only, computed view-models** - nothing here is stored anywhere.

## 1. `AvailabilityCalendarMarkerModel` (computed)

| Field | Type | Derivation |
|---|---|---|
| `kind` | `'uptimeRequest' \| 'downtimeAnnouncement'` | Which source record this marker represents - drives icon choice (research.md §3) |
| `date` | `string` (`YYYY-MM-DD`, CET calendar day) | One marker entry per day the source record touches (research.md §2) |
| `color` | `string` (Tailwind class) | `amber`/`sky`/`emerald` for an Uptime Request by its status, fixed `red-300` for a Downtime Announcement |
| `sourceId` | `string` | The source record's `id` - used to look up full detail when the marker is clicked |

Computed per visible month from the two already-fetched lists, filtered per research.md §2's predicates, re-derived whenever the selected Environment, the visible month, or either underlying query's data changes.

## 2. Marker detail (existing shapes, no new model)

No new model - clicking a marker looks up its full record by `sourceId` in the already-fetched list and shows:
- Uptime Request: `ticketId`, `environment`, `fromAt`/`toAt` (formatted via the existing CET formatter), `status` - explicitly excluding `requesterName`/`requesterEmail` (spec FR-010).
- Downtime Announcement: `heading`, `description`, `startAt`/`endAt` (formatted via the existing CET formatter), `status`.

## Relationships

None - this feature computes two independent, unrelated marker sets (Uptime Requests, Downtime Announcements) over the same calendar grid; neither entity gains a relationship to the other or to anything new.
