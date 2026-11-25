# Data Model: Scrollable Multi-Week Calendar Grid

No persisted/backend data model - everything below is transient client-side view state and derived values inside the one modal component, extending the entities from features 006/007.

## AllDays (derived, not stored)

Replaces feature 006's 7-entry `weekDays` as the thing everything renders from.

| Field | Type | Notes |
|---|---|---|
| 35 entries | `WeekDay[]` (existing shape, unchanged fields) | `allDays[i] = addDays(getSundayOfWeek(todayYmd), i)` for `i` in `0..34` - recomputed fresh every render, same pattern as `todayYmd`/`currentHour` already use. Index `0` is always the current week's Sunday (even if in the past relative to today); index `34` is the last day of the 5th week. |

Always fully rendered - this array's length and contents never change while the modal is open (no scrolling, clicking, or navigating changes *what* exists, only what's currently synced/displayed as "leading" - see `LeadingWeekIndex`).

## LeadingWeekIndex (state: `0..4`)

Replaces `selectedWeekStart` as the thing that drives mini-calendar sync and the header's date-range label. Unlike `selectedWeekStart`, it is a derived display concern, not a rendering input.

| Field | Type | Notes |
|---|---|---|
| `leadingWeekIndex` | `number` (`0..4`) | The week whose Sunday is the leftmost day-column still visible in the scroll container, per research.md §4's formula. Drives: the mini-calendar's highlighted row, the mini-calendar's displayed month (if different), and the header's date-range label text (reusing `formatWeekRangeLabel(allDays[leadingWeekIndex*7], allDays[leadingWeekIndex*7+6])`). |

**Transitions**:
- A native scroll event (drag, wheel, trackpad) recomputes it continuously (research.md §4) - only triggers a state update when the computed value actually changes.
- A "jump" action (next/previous week arrow, mini-calendar row click for a reachable week, Today) triggers a smooth programmatic scroll (research.md §5); the same scroll-listener mechanism updates `leadingWeekIndex` progressively as that animation plays, with no separate manual set needed.
- A mini-calendar row click for an unreachable week (before index 0, or beyond index 4) is a no-op - research.md §8.

## ScrollJumpTarget (derived, not stored)

A one-off computed value at the moment of a jump action, not persisted.

| Rule | Result |
|---|---|
| Next/previous week arrow | `clamp(leadingWeekIndex ± 1, 0, 4) * containerClientWidth` |
| Mini-calendar row click, week reachable | `weekIndexOf(clickedSunday) * containerClientWidth` |
| Mini-calendar row click, week unreachable | no scroll call (no-op) |
| Today | `0` (always the absolute start of the range) |

## SlotSelectability (derived, not stored)

Unchanged rule from feature 006/007, now indexed across the full `0..34` range instead of `0..6`: a day before today, or today at-or-before the current hour, is disabled - native not-allowed cursor, muted background, tooltip (feature 007), and now also a centered lock icon (FR-010).

## TeamsCalendarEvent (existing entity, field range widened)

| Field | Type | Notes |
|---|---|---|
| `day` | `number` | Previously implicitly `0..6` (one displayed week); now `0..34` (absolute index into `AllDays`) - no type change, no logic change to how it's read/written, since the existing multi-day booking span math already resolves days generically through one linear `getSlotIndex(day, hour)` formula with no hardcoded 7-day boundary. |
