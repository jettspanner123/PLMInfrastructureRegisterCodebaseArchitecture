# Quickstart: Scrollable Multi-Week Calendar Grid

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP.

## Prerequisites

- Frontend dev server running, navigate to `/environment-uptime-requests` → **Form** tab → pick any environment → **Select dates...**.

## Scenario 1 - Continuous horizontal scroll with hard bounds (User Story 1)

1. With the modal freshly open (scrolled to the start), confirm the current week's days are showing with today's week's Sunday flush at the left edge.
2. Scroll the grid horizontally to the right (e.g. via `scrollLeft` or a wheel/drag simulation); confirm new days keep appearing continuously as you go, with no flash/swap, up through the 5th week.
3. Keep scrolling past the end of the 5th week; confirm the scroll simply stops there - no further content, no wrap.
4. Scroll back left to the very start; confirm it stops exactly at the current week's Sunday (even if that date is before today) and cannot go further left.
5. Stop scrolling at a position straddling two weeks (e.g. mid-week); confirm the view can rest there with no snap-back to a week boundary.

## Scenario 2 - Mini-calendar follows the leading week (User Story 2)

1. Scroll the grid until a new week's Sunday becomes the leftmost visible column; confirm the mini-calendar's highlighted row updates to that week immediately.
2. Scroll further until the leading week crosses into a different month; confirm the mini-calendar's displayed month transitions too.
3. Scroll continuously (one long gesture) across more than one week boundary; confirm the mini-calendar's highlight keeps pace throughout the gesture, not just once scrolling stops.

## Scenario 3 - Jump controls land predictably (User Story 3)

1. From any scroll position, click the next-week arrow; confirm the grid smoothly scrolls so the following week's Sunday sits flush at the left edge.
2. Click the previous-week arrow repeatedly until back at the start; confirm it stops at the current week with no further effect.
3. Click a mini-calendar row for a week within the reachable range; confirm the same flush-left landing as the arrows.
4. Click a mini-calendar row for a week before the current week (reachable only via the mini-calendar's own unrestricted past browsing); confirm the main grid does not move.
5. Scroll somewhere in the middle of the range, then click Today; confirm the grid returns to the exact start (scrollLeft 0) and the vertical scroll also moves to the current hour (feature 007, unchanged).
6. Start a slot selection (click once to set a "Start" slot), then click any jump control; confirm the in-progress selection is cancelled.

## Scenario 4 - Disabled slots are visually obvious without hovering (User Story 4)

1. Without hovering anything, look at a disabled (past) slot; confirm it shows a small lock icon in addition to the existing muted background.
2. Confirm a selectable slot shows no such icon.
3. Hover a disabled slot; confirm the existing native tooltip (feature 007) still appears alongside the icon - no regression.

## Expected overall result

All four scenarios pass with no regression to features 006/007's booking-selection, today/current-time coloring, or scroll-to-now-on-open behavior.
