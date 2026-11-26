# Contract: List Calendar Activities

## Endpoint

`GET /Api/V1/CalendarActivities`

**Access**: Public — no `[Authorize]` attribute, reachable by any visitor regardless of admin session (per spec User Stories 2/3; research.md §2 explains this deliberate divergence from Downtime Announcements' own admin-only `GetAll`).

## Request

No parameters. Returns every activity that exists — no server-side date-range filtering or pagination in this pass (per plan.md Constraints); the client filters/renders per the currently-viewed month itself.

## Response

**Success (200 OK)** — `APIResponse<List<CalendarActivityDTO>>.Succeeded(...)`, a list of `CalendarActivityDTO` (same shape as the create endpoint's own response — see `create-calendar-activity.md`), ordered however the database naturally returns them (the client is responsible for sorting by `CreatedAt` to derive each activity's display color, per research.md §3 — the server does not pre-sort or pre-assign a color).

**Unexpected error (500 Internal Server Error)** — generic failure message, logged server-side, matching every other feature's own catch-all.
