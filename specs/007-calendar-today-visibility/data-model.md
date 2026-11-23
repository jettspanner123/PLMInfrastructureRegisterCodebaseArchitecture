# Data Model: Calendar Today Visibility & Restricted-Slot Tooltip

No persisted/backend data model - everything below is derived display state computed fresh each render, extending feature 006's existing `SlotSelectability` concept.

## TodayColumnIndicator (derived, not stored)

| Rule | Result |
|---|---|
| `weekDays[dayIndex]` equals `todayYmd` | show the `rgba(91, 95, 199, 0.08)` overlay on every cell in that column |
| otherwise | no overlay |

Purely a function of which column index (if any) matches today within the currently displayed week - recomputed whenever the displayed week changes, naturally disappearing per FR-003 when today scrolls out of view.

## CurrentTimeCellAccent (derived, not stored)

| Rule | Result |
|---|---|
| the cell's day is today AND its hour equals the live current hour exactly | show the `rgba(91, 95, 199, 0.18)` overlay (on top of the cell's existing disabled background) |
| otherwise | no overlay |

A strict subset of feature 006's existing `SlotSelectability` "disabled" cells (every current-time cell is already disabled; not every disabled cell is the current-time cell) - this is purely an additional visual layer, not a new selectability rule.

## RestrictedSlotTooltip (derived, not stored)

| Rule | Result |
|---|---|
| the slot is disabled (feature 006's existing rule) | `title="This time has already passed"` (or equivalent short text) on the slot element |
| the slot is selectable | no `title` attribute |
