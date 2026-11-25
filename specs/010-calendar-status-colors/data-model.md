# Data Model: Calendar Event Card Status Colors

No persisted data changes — this feature reads a field that already exists (`EnvironmentUptimeRequestInterfaceModel.status`) and extends one existing client-side view-model shape.

## TeamsCalendarEvent (EXISTING shape, EXTENDED — feature 009's entity)

| Field | Type | Notes |
|---|---|---|
| `status` | `EnvironmentUptimeRequestStatusEnumModel?` | **NEW.** Present only when `source === 'uptimeRequest'`, populated from the originating request's own `status` at the point each day-segment is built (research.md §3). Drives which entry of the new color lookup applies; absent/irrelevant for `'inProgress'` and `'downtime'` sources. |

## BookingStatusCardStyles (NEW, derived constant — not stored)

A literal, non-interpolated lookup keyed by `EnvironmentUptimeRequestStatusEnumModel`'s three rendering-relevant values (`Pending`, `Approved`, `Completed` — `Rejected`/`Cancelled` never reach this lookup at all, since they never produce an `uptimeRequest`-sourced card to begin with, per feature 009's own existing status filter).

| Status | `card` className | `stripe` className | `pill` className |
|---|---|---|---|
| Pending | `bg-[#ffa826] border border-[#ffa826]/50` | `bg-[#ffcf88]` | `bg-[#8c5c15]` |
| Approved | `bg-[#26acff] border border-[#26acff]/50` | `bg-[#88d1ff]` | `bg-[#155f8c]` |
| Completed | `bg-[#29d944] border border-[#29d944]/50` | `bg-[#89ea98]` | `bg-[#177725]` |

## Per-card resolved color object (derived, not stored)

Computed once per rendered event card, replacing the existing three separate `isDowntime` ternaries (research.md §4):

| Source | Resolved `{ card, stripe, pill }` |
|---|---|
| `downtime` | Existing fixed red styling (`bg-[#5a2323] border border-[#e35b5b]/50` / `bg-[#e35b5b]` / `bg-[#7a3232]`) — unchanged by this feature. |
| `uptimeRequest`, `status` in `BookingStatusCardStyles` | That status's row from the table above. |
| `inProgress`, or `uptimeRequest` with an unrecognized/missing `status` (defensive fallback — not reachable today) | Existing fixed purple styling (`bg-[#3d375a] border border-[#5b5fc7]/50` / `bg-[#7b83eb]` / `bg-[#464775]`) — unchanged by this feature. |

No other field on `TeamsCalendarEvent`, and no other part of this file's data model, changes.
