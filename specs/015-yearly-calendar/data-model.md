# Data Model: Yearly Maintenance Calendar Page

No database, no backend entity, no persisted data of any kind. Per the spec's amended scope (Round 2), this pass does include one fixed, hand-authored, non-editable sample dataset — purely a visual preview of a future activity model, not data from any backend (spec FR-009, Assumptions). Event *creation* and its admin-gating remain deferred to a future, backend-integrated feature (Clarifications).

## CalendarMonthView (derived display state, not stored)

| Field | Type | Notes |
|---|---|---|
| `viewYear` | `number` | The year currently shown in both the sidebar's 12-month selector and the main grid. |
| `viewMonth` | `number` (0-11) | The month currently shown in the main grid. |
| `weeksMatrix` | `YearMonthDay[][]` | One entry per calendar week row (4-6 rows depending on the month), each a 7-day Sunday-to-Saturday array; leading/trailing days from adjacent months fill out the first/last row only as needed (per research.md §1). |
| `todayYmd` | `{ year, monthIndex, day }` | Computed once per render from the real current date; used to detect whether `viewYear`/`viewMonth` match today's own month, and to highlight today's specific cell when they do. |

**Validation rules**: None — this is derived, read-only display state computed from plain date arithmetic; there is no user input to validate (no form, no persisted write).

**State transitions**:
- Picking a month in the sidebar's 12-month selector sets `viewMonth` (and `viewYear` if the sidebar's own year navigator was also moved).
- The year navigator's prev/next controls change `viewYear` alone, leaving `viewMonth` unchanged.
- The "Today" control resets both `viewYear` and `viewMonth` to the real current date's own year/month.

## CalendarActivitySample (new, fixed local constant data — not stored, not user-editable)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable key for React list rendering; not meaningful beyond this page. |
| `title` | `string` | Short label shown on the activity bar (e.g. "Release Deployment"). |
| `startDate` / `endDate` | `YearMonthDay`-shaped values | Confined to a single month per sample (spec Edge Cases — no cross-month-boundary sample data), inclusive of both ends; `endDate` may equal `startDate` for a single-day sample. |
| `colorKey` | `string` | Selects which fixed color treatment the bar uses, from a small hand-picked set (not user-configurable), enough to keep overlapping samples visually distinct from one another. |

**Validation rules**: None — fixed, hand-authored data defined once in `YearlyCalendarCON.ts`, never user input.

**State transitions**: None — this dataset never changes at runtime.

## CalendarActivityLaneAssignment (derived display state, not stored)

| Field | Type | Notes |
|---|---|---|
| `weekRowIndex` | `number` | Which grid week-row this assignment applies to (per research.md §6, lanes are computed fresh per week). |
| `activityId` | `string` | References a `CalendarActivitySample.id`. |
| `laneIndex` | `number` (0, 1, 2, …) | The lowest available lane such that no two activities sharing a lane overlap on any day within that week row. |

**Validation rules**: None — purely derived by the lane-assignment helper (research.md §6) from `CalendarActivitySample`'s fixed `startDate`/`endDate` values; recomputed on every render of the viewed month, never stored.

## Explicitly out of scope (confirmed, not a new entity)

- Any real, backend-sourced event/announcement/maintenance-window data — the `CalendarActivitySample` dataset above is a fixed, fictional preview only (spec FR-009, Assumptions).
- Any admin-gated create/edit action — deferred entirely to a future feature (spec Clarifications/Assumptions).

No existing data model (resources, environment overview, uptime requests, downtime announcements, feature requests, configuration constants) is touched by this feature.
