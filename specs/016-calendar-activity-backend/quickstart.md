# Quickstart: Calendar Activity Backend & Admin Creation

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server (frontend + backend) via Chrome DevTools MCP.

## Prerequisites

- Frontend and backend dev servers running, database migrated.
- An admin login available (to test User Story 1), and a way to view the page with no admin session (to test the gating in Scenario 1).

## Scenario 1 - "Add Activity" is admin-only (User Story 1, Acceptance Scenario 1-2)

1. With no admin session, open the Yearly Calendar page and confirm the "Add Activity" button does not appear anywhere.
2. Log in as admin, revisit the page, and confirm the button now appears.

## Scenario 2 - Full creation flow, instant appearance (Acceptance Scenario 3)

1. As admin, click "Add Activity." Fill in Title, Description, Environment, Responsible Person, Contact Email, Start, and End with valid data.
2. Submit and confirm: the modal closes, a success indication appears, and the new activity shows up on the grid immediately, spanning the correct day(s), with no page reload.

## Scenario 3 - Validation (Acceptance Scenario 4, SC-003)

1. Attempt to submit with each field empty in turn; confirm a clear, field-specific message blocks submission each time.
2. Enter an invalid email (e.g. `notanemail`); confirm a validation message appears and nothing is created.
3. Enter an End date/time at or before the Start date/time; confirm the "'End' must be strictly after 'Start'" message appears and nothing is created.

## Scenario 4 - Server-side admin enforcement (Acceptance Scenario 5, SC-004)

1. Attempt to call the create endpoint directly (e.g. via a manual request with no admin token, or an expired one) and confirm it is rejected (401/403), not merely hidden in the UI.

## Scenario 5 - Backdating and the "Backdated" badge (FR-008/FR-009, SC-005)

1. As admin, create an activity whose Start date is clearly in the past (e.g. last week) and End date also in the past or today.
2. Confirm creation succeeds (no block on backdating) and the activity shows a "Backdated" badge on its bar, styled like the existing "Today" badge.
3. Create a second activity whose Start date is today or in the future; confirm it shows no "Backdated" badge.

## Scenario 6 - Read-only activity details (User Story 2, SC-007)

1. Click any activity on the grid (as a non-admin visitor) and confirm a read-only view opens showing its title, full description, environment, responsible person, contact email, and start/end date-time.
2. Confirm there is no edit or delete control anywhere in that view.

## Scenario 7 - Cap-at-3 and "Show +X More" (User Story 3, SC-006)

1. Create enough overlapping activities (more than 3 touching the same week) to trigger the cap.
2. Confirm exactly 3 show plus a "Show +X More" control stating the exact remaining count.
3. Click it; confirm every activity in that week becomes visible and only that week row's height grows.
4. Confirm a different week row (even one sharing a multi-week activity with the expanded one) is unaffected.
5. Collapse the expanded row and confirm it returns to showing only 3 plus the control.

## Scenario 8 - Color varies by creation order (FR-010, SC-008)

1. Create 3-4 activities in sequence, arranged so at least two overlap.
2. Confirm each uses a different color from the small fixed palette, consistent with creation order, and that overlapping ones are visually distinguishable.

## Expected overall result

All eight scenarios pass with no regression to 015's own existing browsing/navigation experience (month/year picking, Today control, animation, theme consistency), in both light and dark mode.
