# Quickstart: Calendar Navigation & Booking Constraints

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP, same as every prior round of this calendar feature.

## Prerequisites

- Frontend dev server running (`PLMInfrastructureRegisterClientServiceLayerMSC`, default port already in use this session).
- Navigate to `/environment-uptime-requests`, switch to the **Form** tab, pick any environment, click **Select dates...** to open the calendar modal.

## Scenario 1 - Past slots are disabled (User Story 1)

1. Note the real current date/time.
2. Hover any hour slot on a day before today → cursor shows "not allowed"; background is visibly muted; clicking does nothing.
3. On today's column, hover the slot matching the current hour (e.g. if it's 1:15pm, hover the 1pm-2pm row) → same disabled treatment.
4. Hover the next hour's slot (2pm-3pm in the example above) → normal selectable styling and cursor; click it → becomes a valid "Start" slot exactly as before.
5. Confirm a disabled slot that also falls on a weekend (e.g. a past Saturday) shows only the disabled look, not a combined/different third style.

## Scenario 2 - Week arrows navigate with animation (User Story 2)

1. Note the currently displayed date range in the top bar.
2. Click the next-week arrow → grid shows the following Sunday-Saturday span; old content visibly slides out left as new content slides in from the right; date-range label and day headers move together with the grid.
3. Click the previous-week arrow twice → returns past the original week into the week before it, sliding right-to-left.
4. Pick a Start slot (don't finish the selection), then click either arrow → the in-progress selection is gone (no stray "Start" badge/pulse left behind).

## Scenario 3 - Mini-calendar sync (User Story 3)

1. In the sidebar mini-calendar, click a week-row several weeks in the past → main grid slides left (backward) to that week; the mini-calendar's own highlighted-row indicator animates from the old row to the new one.
2. Click a week-row later than the one just selected → main grid slides right (forward).
3. Click the mini-calendar's own month-down/up chevrons → only the mini-calendar changes (slides horizontally to the adjacent month); the main grid's selected week and displayed content are untouched.
4. From that different month, click a week-row → main grid slides to it exactly as in step 1/2.
5. Select a week whose Sunday falls in a different month than what the mini-calendar currently shows (e.g. navigate the main grid via its own arrows across a month boundary) → mini-calendar automatically slides to the correct month, with that week's row already highlighted.

## Scenario 4 - Today button (User Story 4)

1. Navigate several weeks into the future (or past) and, separately, browse the mini-calendar to a different month via its own arrows.
2. Click **Today** → main grid slides directly back to the current week (correct direction for wherever it was), mini-calendar slides back to the current month with the current week's row highlighted, and the grid's vertical scroll position moves to show the current hour.
3. Click **Today** again immediately (already on today's week) → no week/month slide occurs, but the scroll position still re-centers on the current hour if it had drifted.
4. Pick a Start slot, then click **Today** → in-progress selection is cancelled, same as Scenario 2 step 4.

## Expected overall result

All four scenarios pass with no regressions to the existing static behavior already verified in prior rounds (seed-less empty grid, 24-hour AM/PM rows, weekend muting on non-disabled days, the modal's own adaptive sizing, the click-to-book multi-day interaction).
