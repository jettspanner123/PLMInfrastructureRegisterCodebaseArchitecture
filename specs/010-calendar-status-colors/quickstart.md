# Quickstart: Calendar Event Card Status Colors

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP.

## Prerequisites

- Frontend dev server running; at least one existing uptime request each in Pending, Approved, and Completed status, all visible within the calendar's 5-week range for some environment (status can be changed via the existing admin status editor on the full ticket detail page if needed).
- Navigate to `/environment-uptime-requests` → **Form** tab → pick that environment → **Select dates...**.

## Scenario 1 - Each status renders its own color (User Story 1)

1. With the calendar open, locate the Pending request's event card; confirm its background is solid `#ffa826`, its border is a visibly dimmer orange edge, its left stripe is a visibly brighter/lighter orange than the card, and its time-range pill is a visibly darker orange than the card — all four distinguishable from each other, not identical.
2. Locate the Approved request's card; confirm the same relationships hold using the blue family (`#26acff` card).
3. Locate the Completed request's card; confirm the same relationships hold using the green family (`#29d944` card).
4. Confirm all three cards' title/time-range/subtitle text renders in exactly the same color/weight as before this feature (white title, light-gray time pill text and subtitle).

## Scenario 2 - Unaffected cards stay unaffected (FR-007/FR-008)

1. Pick a new date/time span (forming the viewer's own in-progress card); confirm it still renders in the existing fixed purple scheme, unaffected by this feature.
2. With a downtime announcement visible in the same range, confirm its red card is unaffected, pixel-for-pixel the same as before this feature.

## Scenario 3 - At-a-glance distinguishability (SC-001/SC-002)

1. With all three statuses' cards visible in the same viewport at once, confirm a viewer can tell which is which by color alone, without reading any text.
2. Confirm every part of one single card (background, border, stripe, pill) reads as belonging to the same color family as each other — nothing on one card looks like it belongs to a different status.

## Expected overall result

All three scenarios pass with no regression to features 006-009's calendar behavior (scrolling, jump controls, booking-selection, right-click delete, details modals, live polling).
