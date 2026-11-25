# Quickstart: Calendar Modal Light/Dark Theming

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP.

## Prerequisites

- Frontend dev server running.
- Navigate to the Uptime Request page and open the calendar view modal (the "availability" picker).

## Scenario 1 - Light mode renders the new palette (User Story 1)

1. With the application in light mode, open the calendar modal.
2. Confirm the sidebar, main content area, and grid all show a white/near-white background (not the current `#141414` dark backdrop).
3. Confirm every border/divider reads as a light gray line (`slate-200`), not the current dark `#2b2b2b`.
4. Confirm every text tone (the "Calendar" heading, month label, weekday headers, day numbers, hour labels) is legible dark-on-light, not the current light-on-dark.
5. Confirm weekend-day columns show a subtle, slightly-tinted background distinguishable from weekday columns, and disabled (past) time slots show a slightly dimmer background than selectable ones.
6. Confirm the scrollbar (drag the grid to make it appear) shows light-mode-appropriate track/thumb colors, not the current dark ones.

## Scenario 2 - Dark mode is pixel-identical to before (User Story 1)

1. Switch to dark mode and open the calendar modal.
2. Confirm every surface (sidebar, main area, grid, borders, text, scrollbar) looks exactly as it did before this feature - no visual regression.

## Scenario 3 - Status/event card colors are unaffected by theme (User Story 1, Acceptance Scenario 3)

1. With at least one Pending, Approved, Completed, or downtime-announcement event visible in the calendar, compare its card colors in light mode vs. dark mode.
2. Confirm the card's own background, stripe, and pill colors are identical in both themes.

## Scenario 4 - Interactive/selection states stay legible in light mode (User Story 1, Acceptance Scenario 4)

1. In light mode, hover over a selectable time slot and confirm the hover highlight is visibly distinguishable from the surrounding grid.
2. Click to start a selection, then hover a second slot to preview a range; confirm both the "start" state and the preview highlight remain clearly visible against the new light background.
3. Confirm today's column/current-hour highlight and the mini-calendar's selected-week pill both remain clearly visible in light mode.
4. Confirm the "Today" badge, the day-number accent, and the building icon (left as their existing accent-blue values, per the spec's Assumptions) still read clearly against the new light background; if any of them look washed out or low-contrast, flag it for its own light-mode adjustment rather than leaving it as-is.

## Scenario 5 - Live theme switch while the modal is open (Acceptance Scenario 5)

1. With the calendar modal open, toggle the application's theme switch.
2. Confirm the modal's own colors update immediately to match, the same way the rest of the application already does.

## Expected overall result

All five scenarios pass with no regression to any other existing screen or feature, in either light or dark mode.
