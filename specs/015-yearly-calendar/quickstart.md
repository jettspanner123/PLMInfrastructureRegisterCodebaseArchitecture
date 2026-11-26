# Quickstart: Yearly Maintenance Calendar Page

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP.

## Prerequisites

- Frontend dev server running.
- No admin session active (test the public/no-login path first), then repeat key checks while logged in as admin.

## Scenario 1 - Page opens with no login, from the top navigation (User Story 1, Acceptance Scenario 1 & 6)

1. With no admin session, load the application and click the "Yearly Calendar" link in the top navigation.
2. Confirm the page opens immediately with no login prompt of any kind.
3. Confirm the page's main content starts directly with the calendar's own view controls (Today / prev / next month / month-year label) — no "Yearly Calendar" title/subtitle block like other pages show.

## Scenario 2 - Sidebar month/year picking updates the main grid (Acceptance Scenario 2 & 3)

1. In the sidebar, click several different months within the current year; confirm the main grid updates each time to show that month's full set of days, correctly positioned under Sunday-Saturday columns.
2. Use the sidebar's year navigator to move to a different year; confirm its 12-month selector updates to that year, then pick a month and confirm the main grid shows that month/year combination.
3. Repeat for at least one 28-day February, one 29-day (leap-year) February, a 30-day month, and a 31-day month; confirm each renders the correct number of weeks (4-6 rows) with no missing or extra days.

## Scenario 3 - "Today" control and today's highlight (Acceptance Scenario 4 & 5)

1. Navigate away from the current month, then use the "Today" control; confirm the view returns to the current month/year.
2. With the current month in view, confirm today's date cell is visually distinguished from every other day shown.

## Scenario 4 - Admin session sees the identical experience

1. Log in as admin (profile dropdown) and revisit the Yearly Calendar page.
2. Confirm it looks and behaves identically to the logged-out experience — no additional controls, since event creation is out of scope for this pass.

## Scenario 5 - Design system and theme consistency (FR-008, SC-005)

1. In both light and dark mode, confirm the page's colors, corner rounding, and typography match this application's own existing design system (not the reference file's own fixed dark-only Teams palette).

## Scenario 6 - Overlapping multi-day sample activities (User Story 2, FR-009-FR-012, SC-006)

1. Navigate to a month whose sample data includes an activity spanning multiple consecutive days; confirm its full span renders as one continuous bar from its start day through its end day.
2. Navigate to a month whose sample data includes two or more overlapping activities; confirm every one of them is individually visible (its own distinct bar/lane), with none hidden behind another.
3. Confirm the sample activities read clearly as a preview, not as real operational data.

## Scenario 7 - Directional slide animation on month change (FR-013, SC-007, Acceptance Scenario 7)

1. Use the next-month arrow button; confirm both the month/year label and the day grid slide together in the same direction (toward "later").
2. Use the previous-month arrow button; confirm both slide together in the opposite direction (toward "earlier").
3. Pick a month from the sidebar and use the Today control; confirm both trigger the same directional slide behavior, matching whether the target month is later or earlier than the one just left.

## Expected overall result

All seven scenarios pass with no regression to any other existing page, nav item, or route, in either theme, for both logged-out and admin sessions.
