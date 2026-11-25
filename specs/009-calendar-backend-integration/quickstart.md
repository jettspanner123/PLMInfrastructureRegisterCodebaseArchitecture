# Quickstart: Calendar Backend Integration

Manual validation guide (no automated test framework exists in this repo). Backend checks via direct HTTP calls (e.g. the running API's Swagger UI or `curl`); frontend checks via the live dev server through Chrome DevTools MCP.

## Prerequisites

- Backend API and frontend dev server both running.
- At least one existing uptime request (Pending, Approved, or Completed) for some environment, with a date/time within the next 5 weeks.
- At least one downtime announcement scheduled within the next 5 weeks, covering that same environment.
- Navigate to `/environment-uptime-requests` → **Form** tab → pick the environment used above → **Select dates...**.

## Scenario 1 - Backward compatibility of the extended endpoint (contracts §1)

1. Call `GET /Api/V1/EnvironmentUptimeRequests` with no query parameters; confirm the response is identical in shape and content to the endpoint's behavior before this feature (every existing request still returned, regardless of status).
2. Call it again with `?Environment=<some environment>`; confirm only that environment's requests are returned.
3. Add `&FromAt=...&ToAt=...` spanning a narrower window; confirm only requests overlapping that window remain.

## Scenario 2 - New downtime range endpoint (contracts §2)

1. Call `GET /Api/V1/DowntimeAnnouncements/InRange?FromAt=<5-weeks-ago>&ToAt=<5-weeks-ahead>` with no auth header; confirm `200 OK` and that the future-scheduled downtime from the Prerequisites appears in the result, alongside any past/active ones in range.
2. Call it again with the range narrowed to exclude that downtime's window entirely; confirm it no longer appears.
3. Call it with a missing `ToAt`; confirm a `400` validation error, not a server error.

## Scenario 3 - Real bookings render on the calendar (User Story 1-2)

1. Open the calendar for the environment used in Prerequisites; confirm the existing uptime request appears as an event card at its real date/time, labeled with the environment name and time range.
2. Confirm the existing downtime appears as a **red** event card at its real scheduled date, even though it isn't active yet.
3. Switch the form's environment to one with no existing bookings; reopen the calendar; confirm the grid is empty of real cards (only the viewer's own in-progress pick, if any, shows).

## Scenario 4 - Details modals (User Story 3)

1. Click the existing uptime-request card; confirm a modal opens showing requester, environment, date/time range, status, and message, with no editable fields, and a link to the existing full detail page.
2. Click the downtime card; confirm a modal opens showing heading, description, affected environments, and time window.
3. Right-click either of these two real cards; confirm no custom context menu appears (and no broken-looking native browser menu either).

## Scenario 5 - In-progress pick delete still local-only (User Story 4, unchanged from before this feature but re-verify no regression)

1. Pick a date/time span to form the in-progress card; right-click it; confirm exactly one option, "Delete", appears.
2. Click "Delete"; confirm the card disappears with no network request fired (check the Network panel).
3. Submit the form's request successfully; reopen the calendar; confirm the now-real request's card no longer offers right-click delete.

## Scenario 6 - Cross-tab live update (User Story 5)

1. With the calendar open in one browser tab, submit a new uptime request for the same environment and an overlapping time from a second, independent tab/session.
2. Within 15 seconds, confirm the first tab's open calendar shows the new card with no manual action there.
3. From an admin session, end a downtime early that was showing as a red card in the first tab; within 15 seconds, confirm that red card shortens or disappears there too.

## Scenario 7 - Backend-unreachable fallback (Edge Case)

1. Simulate the two new queries failing (e.g. stop the backend, or block the two endpoints in DevTools' network conditions).
2. Confirm the calendar still opens, still allows picking a new in-progress slot, and shows a small, non-blocking notice that existing data couldn't be loaded.

## Scenario 8 - The picked slot actually reaches the submitted ticket (User Story 6)

1. On the outer form, pick an environment, then open the calendar and complete a date/time span selection; confirm the outer form's "Select dates..." button immediately updates to show that picked range (no modal interaction needed beyond completing the pick).
2. Close the calendar (X button) without submitting; reopen it; confirm the same picked span still renders as the in-progress card.
3. Right-click that card and choose "Delete"; confirm the outer form's "Select dates..." button reverts to its placeholder text (the picked range is gone there too, not just visually in the calendar).
4. Pick a span again, fill in the rest of the ticket, and submit successfully; confirm the outer form resets (per its existing behavior); reopen the calendar and confirm no in-progress card remains, and (per Scenario 3) the new request now appears as a real card instead.

## Expected overall result

All eight scenarios pass with no regression to features 006/007/008's booking-selection, today/current-time coloring, weekend muting, scroll-to-now-on-open, or scrollable-weeks behavior.
