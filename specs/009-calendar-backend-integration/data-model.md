# Data Model: Calendar Backend Integration

No new database entities or tables. This feature reads two existing entities through one extended and one new endpoint, and extends one existing frontend view-model shape. Everything below either already exists (marked **EXISTING**) or is new (marked **NEW**).

## EnvironmentUptimeRequestDTO (EXISTING, unchanged shape)

| Field | Type | Notes |
|---|---|---|
| `Id` | string | Backend identity — becomes `TeamsCalendarEvent.backendId` for cards with `source: 'uptimeRequest'`. |
| `TicketNumber`, `TicketId` | string | Unused by this feature's rendering, present in the modal's "go to full page" link target. |
| `Environment` | string | Filter key — matched against the calendar's currently-selected environment, both server-side (new optional query param, decision research.md §1) and, for downtime, client-side. |
| `RequesterName`, `RequesterEmail` | string | Shown in `EnvironmentUptimeRequestDetailModalController`. |
| `FromAt`, `ToAt` | DateTime (ISO) | Converted into one or more `TeamsCalendarEvent` entries — research.md §7. |
| `Message` | string? | Shown in the details modal. |
| `Status` | enum (Pending/Approved/Completed/Rejected/Cancelled) | Only Pending/Approved/Completed render as cards at all (FR-001) — Rejected/Cancelled records are fetched (if returned by the extended endpoint with no status filter) but filtered out client-side before conversion to `TeamsCalendarEvent`. |
| `AdminMessage`, `CreatedAt`, `JiraTicketKey`, `JiraTicketUrl` | various | Unused by this feature. |

## DowntimeAnnouncementDTO (EXISTING, unchanged shape)

| Field | Type | Notes |
|---|---|---|
| `Id` | string | Becomes `TeamsCalendarEvent.backendId` for cards with `source: 'downtime'`. |
| `Heading`, `Description` | string | Shown in `DowntimeAnnouncementDetailModalController`. |
| `StartAt`, `EndAt` | DateTime (ISO) | Converted into one or more `TeamsCalendarEvent` entries, same as uptime requests — research.md §7. |
| `Environments` | string[] | Matched against the calendar's currently-selected environment client-side (the new `InRange` endpoint does not filter by environment server-side — research.md §2). |
| `IsActive`, `Status`, `EndedEarlyAt`, `CreatedAt` | various | `IsActive`/`Status` available for display if useful in the details modal; not otherwise load-bearing for this feature. |

## TeamsCalendarEvent (EXISTING shape, EXTENDED)

| Field | Type | Notes |
|---|---|---|
| `id` | string | **EXISTING.** Local React key — for real events, can simply be `${backendId}-${dayOffset}` to stay unique across a multi-day decomposition (research.md §7). |
| `day` | number (0-34) | **EXISTING**, unchanged meaning (absolute index into feature 008's `AllDays`). |
| `startHour`, `endHour` | number | **EXISTING**, unchanged meaning (inclusive hour range within that one day). |
| `title` | string | **EXISTING.** For real events: the environment name for uptime requests, the heading for downtime (FR-002/FR-004). |
| `justCreated` | boolean? | **EXISTING.** `true` only for the viewer's own in-progress pick — now equivalent to `source === 'inProgress'`, kept as-is for backward compatibility with existing code that already checks it. |
| `source` | `'inProgress' \| 'uptimeRequest' \| 'downtime'` | **NEW.** Discriminant driving: right-click behavior (research.md §5), red vs. default card color (research.md §6), and whether a left-click opens a details modal at all. |
| `backendId` | string? | **NEW.** Present only when `source !== 'inProgress'`. Key used to look up the full `EnvironmentUptimeRequestDTO`/`DowntimeAnnouncementDTO` from the query cache when a details modal is opened (research.md §6) — no other backend fields are duplicated onto this type. |

## CalendarExistingBookingsQuery state (NEW, derived/transient — not stored)

| Concern | Shape | Notes |
|---|---|---|
| Uptime requests for the scoped environment | `EnvironmentUptimeRequestDTO[]` | From `useEnvironmentUptimeRequestsForEnvironmentQuery(environment, fromAt, toAt)` — `enabled: isOpen`, `refetchInterval: 15000` (research.md §4). |
| Downtime in the visible range | `DowntimeAnnouncementDTO[]` | From `useDowntimeAnnouncementsInRangeQuery(fromAt, toAt)` — same `enabled`/`refetchInterval`, filtered client-side by `Environments.includes(environment)` before conversion. |
| Fetch failure | `isError`/`error` from either hook | Drives the non-blocking inline notice from research.md §8; never blocks the in-progress pick from being made. |

## `events` is a fully derived value — no stored state (REVISED during planning, research.md §6)

The modal's existing `const [events, setEvents] = useState<TeamsCalendarEvent[]>([])` is **removed**. In its place, three plain `const`s recomputed every render:

| Const | Derived from | `source` |
|---|---|---|
| `inProgressEvents` | The outer form's own `fromAt`/`toAt` props (not anything the modal stores) — parsed and converted via `CalendarBookingConversionHelper`, empty array when either is `''`. | `'inProgress'` |
| `realUptimeEvents` | `useEnvironmentUptimeRequestsForEnvironmentQuery`'s data, filtered to Pending/Approved/Completed, converted. | `'uptimeRequest'` |
| `realDowntimeEvents` | `useDowntimeAnnouncementsInRangeQuery`'s data, filtered client-side by environment, converted. | `'downtime'` |

`const events = [...inProgressEvents, ...realUptimeEvents, ...realDowntimeEvents]`. The modal's transient half-made-selection state (`startSlot`/`hoverSlot`/`previewRange` — before a pick's second click completes it) remains local, since it has no meaning to report upward until a pick is actually complete.

## CalendarBookingConversionHelper (NEW, singleton — `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Helpers/CalendarBookingConversionHelper.ts`)

| Method | Signature | Used by |
|---|---|---|
| `convertRangeToEvents` | `(fromAt: Date, toAt: Date, allDays: WeekDay[], title: string, source: 'inProgress' \| 'uptimeRequest' \| 'downtime', backendId?: string) => TeamsCalendarEvent[]` | US1, US2 (real data), US6 (`inProgressEvents`, called with a parsed `fromAt`/`toAt`) |
| `convertPickToDateTimeStrings` | `(startDayIndex: number, startHour: number, endDayIndex: number, endHour: number, allDays: WeekDay[]) => { fromAt: string; toAt: string }` | US6 (reports a completed live pick upward via `onFromChange`/`onToChange`) |

## Backend query parameters (NEW)

| Endpoint | New param | Type | Required? | Notes |
|---|---|---|---|---|
| `GET /Api/V1/EnvironmentUptimeRequests` | `Environment` | string? | No | Omitted → unfiltered (today's exact existing behavior, backward compatible). |
| `GET /Api/V1/EnvironmentUptimeRequests` | `FromAt` | DateTime? | No | Paired with `ToAt`; omitted → no date filter applied. |
| `GET /Api/V1/EnvironmentUptimeRequests` | `ToAt` | DateTime? | No | See above. |
| `GET /Api/V1/DowntimeAnnouncements/InRange` (NEW endpoint) | `FromAt` | DateTime | Yes | The calendar's fixed 5-week visible-range start. |
| `GET /Api/V1/DowntimeAnnouncements/InRange` (NEW endpoint) | `ToAt` | DateTime | Yes | The calendar's fixed 5-week visible-range end. |
