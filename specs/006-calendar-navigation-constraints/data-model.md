# Data Model: Calendar Navigation & Booking Constraints

This feature introduces no persisted/backend data model - everything below is transient client-side view state and derived values inside the one modal component. Entities are described in terms of their fields and validation rules, not as database tables.

## SelectedWeek

The single source of truth for which week the main grid displays.

| Field | Type | Notes |
|---|---|---|
| `year` / `monthIndex` / `day` | number | The Sunday that anchors the displayed 7-day span (existing `YearMonthDay` shape already in the component) |

**Derivation of the 7 displayed days**: `weekDays[i] = selectedWeek + i days` for `i` in `0..6` (already-existing logic, unchanged).

**Transitions**:
- Next/Previous week arrow → `selectedWeek ± 7 days`, tagged with a `forward`/`backward` direction for the slide animation.
- Mini-calendar row click → `selectedWeek = clicked row's Sunday`, direction derived by comparing the clicked week's date to the current `selectedWeek` (later → forward, earlier → backward, equal → no transition).
- Today button → `selectedWeek = Sunday of the week containing today`, direction derived the same comparison way (and skipped entirely if already equal, per Acceptance Scenario 3 of User Story 4).

## DisplayedMonth

What month the sidebar mini-calendar is currently showing (independent of `SelectedWeek`, but normally kept in sync with it - see research.md §4).

| Field | Type | Notes |
|---|---|---|
| `year` / `monthIndex` | number | Drives the existing `weeksMatrix` month-grid generator (unchanged) |

**Transitions**:
- Mini-calendar's own up/down chevrons → `±1 month` (with month/year rollover), tagged with a direction for its own slide, and does **not** change `SelectedWeek`.
- Whenever `SelectedWeek` changes to a week whose Sunday falls outside the currently `DisplayedMonth`, `DisplayedMonth` is updated to contain it (FR-009), with its own direction-tagged slide.

## SlotSelectability (derived, not stored)

A pure function of `(day, hour, now)` - not its own piece of state, recomputed from the existing `weekDays`/`HOUR_ROWS` data plus a `now` snapshot.

| Rule | Result |
|---|---|
| `day` is before today (any hour) | disabled |
| `day` is today AND `hour <= now.hour` | disabled |
| `day` is today AND `hour > now.hour` | selectable |
| `day` is after today (any hour) | selectable |

Disabled slots never become a selection's start or end and never participate in hover-preview; their visual treatment (muted background + native not-allowed cursor) overrides the existing weekend-muted look rather than combining with it (FR-004).

## SlideDirection (derived, not stored)

A transient value computed at the moment of a navigation action (arrow click, row click, month chevron, Today), passed as framer-motion's `custom` prop for that one transition. Not persisted - each transition computes its own direction from a simple date/month comparison (see research.md §1 and §4) and is discarded once the animation completes.
