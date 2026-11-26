# Data Model: Calendar Activity Backend & Admin Creation

## CalendarActivity (new, persisted — table `IG_CalendarActivityTBL`)

| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` (PK) | Server-generated at creation (`Guid.NewGuid()`). Internal only — per Clarifications, no human-readable reference/ticket ID is added (FR-018). |
| `Title` | `string` | Required (FR-003). Reasonable maximum length (200 chars, matching Downtime Announcements' own `Heading` limit). |
| `Description` | `string` | Required (FR-003), multi-line. Reasonable maximum length (4000 chars, matching Downtime Announcements' own `Description` limit and Uptime Request's own `Message` limit). |
| `Environment` | `string` | Required (FR-003). Value must come from the same environment-name list the Uptime Request form already uses — not independently validated against a fixed set server-side, matching how Uptime Request's own `Environment` field is handled today. |
| `ResponsiblePerson` | `string` | Required (FR-003). Value comes from the same shared "Sponsor" growable list the Uptime Request form, Environment Overview, and Feature Requests already use. |
| `ContactEmail` | `string` | Required (FR-003/FR-005). Validated server-side against the same plausible-shape regex already used for Uptime Request's `RequesterEmail` (`^[^\s@]+@[^\s@]+\.[^\s@]+$`). |
| `StartAt` | `DateTime` (`timestamp with time zone`) | Required (FR-003). Stored UTC, converted from the naive local string the form submits (research.md §5). May be in the past (FR-008) — no restriction. |
| `EndAt` | `DateTime` (`timestamp with time zone`) | Required (FR-003). Stored UTC. Must be strictly after `StartAt` (FR-004), validated both client-side and server-side. |
| `CreatedAt` | `DateTime` (`timestamp with time zone`) | Server-set at creation (`DateTime.UtcNow`). Used only to derive display color/ordering (research.md §3) and for natural audit purposes — never shown to visitors as a field in its own right. |

**Validation rules** (enforced server-side in `CalendarActivitiesAssertion.AssertCreateRequest`, mirroring `DowntimeAnnouncementsAssertion.AssertCreateRequest`'s own exact style):
- `Title`: required, not whitespace-only, ≤ 200 characters.
- `Description`: required, not whitespace-only, ≤ 4000 characters.
- `Environment`: required, not whitespace-only.
- `ResponsiblePerson`: required, not whitespace-only.
- `ContactEmail`: required, not whitespace-only, matches the plausible-email-shape regex.
- `StartAt`/`EndAt`: both must `DateTime.TryParse` successfully; `EndAt` must be strictly after `StartAt`.

**State transitions**: None beyond creation — per spec FR-015/FR-017, this pass has no edit or delete capability; once created, a `CalendarActivity` row never changes.

## Derived, non-persisted display state (computed client-side only — research.md §3)

| Concept | Derivation | Notes |
|---|---|---|
| Display color | `sortedByCreatedAtAscendingIndex % 3`, using the same 3-color palette (`blue`/`green`/`amber`) `015-yearly-calendar`'s own sample data already established | No `ColorIndex` column exists; recomputed on every fetch. |
| "Backdated" badge | `activity.startAt < todayYmd` (today's own date, recomputed on every render) | No `IsBackdated` column exists; matches how the existing "Today" cell highlight is already computed. |
| Per-week lane assignment | `CalendarActivityLaneAssignmentHelper.assignLanesForWeek(week, activities)` (revised from 015 to accept real `startAt`/`endAt` instead of fixed sample dates) | Unconditional — returns every activity's lane, with no cap; capping happens at the render site (research.md §6). |
| "Show +X More" / expanded state | A local `expandedWeekKeys: Set<string>` in `YearlyCalendarScreenController`, keyed per week (e.g. its Sunday date) | Not persisted anywhere — resets on page reload, consistent with 015's own existing UI-state conventions. |

## API contracts summary (full detail in `contracts/`)

- `POST /Api/V1/CalendarActivities` — `[Authorize(Policy = "RequireAdmin")]`. Body: `CreateCalendarActivityDTO` (Title, Description, Environment, ResponsiblePerson, ContactEmail, StartAt, EndAt). Returns the created `CalendarActivityDTO` (adds `Id`, `CreatedAt`).
- `GET /Api/V1/CalendarActivities` — public, no `[Authorize]`. Returns `List<CalendarActivityDTO>`, every activity, unfiltered (per plan.md's Constraints — no server-side date-range filtering in this pass).

## Explicitly out of scope (confirmed, not a new entity/column)

- Any edit/delete capability or corresponding DTO/endpoint (spec FR-017).
- Any ticket/reference ID column (spec FR-018).
- Any `ColorIndex`/`IsBackdated` column (research.md §3).
- Any new `ConfigurationConstants` key for Environment or Responsible Person — both reuse existing keys/queries (research.md §4).

No existing data model (Resources, Environment Overview, Uptime Requests, Downtime Announcements, Feature Requests, Configuration Constants) is changed by this feature.
