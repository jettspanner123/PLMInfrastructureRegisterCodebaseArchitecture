# Quickstart: Calendar Today Visibility & Restricted-Slot Tooltip

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP.

## Prerequisites

- Frontend dev server running, navigate to `/environment-uptime-requests` → **Form** tab → pick any environment → **Select dates...**.

## Scenario 1 - Today's column and current-time cell (User Story 1)

1. With the modal open on the week containing today, confirm today's entire column shows a subtle purple-tinted background, visibly different from the plain background of non-weekend/non-today columns.
2. Confirm the one cell matching the current hour shows a noticeably stronger version of that same tint than the rest of its own column.
3. Confirm any other disabled cell in today's column (before the current hour) looks different from the current-time cell - plain disabled look plus the column tint, not the stronger accent.
4. Navigate to a week that does not include today (e.g. via the next-week arrow) and confirm no column shows the today-tint and no cell shows the current-time accent anywhere in that week.
5. Navigate back to today's week (or click Today) and confirm both indicators reappear correctly.

## Scenario 2 - Restricted-slot tooltip (User Story 2)

1. Hover a disabled slot (a past day, or today at-or-before the current hour) and confirm a small native tooltip appears after the browser's usual hover delay, with a short message explaining the slot is in the past.
2. Hover a selectable slot and confirm no tooltip appears.

## Expected overall result

Both scenarios pass with no regression to feature 006's navigation, animations, or past-slot disabling/cursor behavior.
