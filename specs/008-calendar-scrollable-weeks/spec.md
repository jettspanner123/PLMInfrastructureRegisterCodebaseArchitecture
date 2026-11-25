# Feature Specification: Scrollable Multi-Week Calendar Grid

**Feature Branch**: `008-calendar-scrollable-weeks`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "okay what should happen is that, the grid thing should be horizontally scrollable please, as you scroll you should be abel to to see other dates please, the lower limit should be this week, like if today is wed, then it should show from last sunday, and keep a high upper limit please, like about 4 weeks, it should be scrollable please, and as you scroll, let's say you scroll and a new set of days of the weak appear, let's say the next weak, the the calendar weak indicator in the left should also update the current selected weak also please, also in the cells which are no loger selectable can you please put a muted color and icon in that so that user can straight up tell that it's not selectable please"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scroll continuously across several weeks (Priority: P1)

A user viewing the availability grid can scroll it horizontally (trackpad, mouse wheel, or scrollbar drag) to reveal days beyond the current week, all the way out to several weeks in the future, without needing to click a button for every single week.

**Why this priority**: This is the core of the request - the grid moves from "one week at a time, click to switch" to "one continuous horizontal timeline you explore by scrolling," while still starting from and never going before the current week.

**Independent Test**: Open the modal and scroll the grid to the right; confirm new days keep appearing in order, continuously, up to the 5-week limit, and that scrolling stops there (no further content, no wrap-around). Scroll back left; confirm it stops exactly at the current week's Sunday and goes no further back.

**Acceptance Scenarios**:

1. **Given** the modal has just opened, **When** the user scrolls the grid to the right, **Then** days from the following week (and beyond) become visible, continuously, without any page-swap or flash - this is one continuous scrollable surface, not separate pages.
2. **Given** the user has scrolled some distance to the right, **When** they continue scrolling further right, **Then** they can keep revealing days up to 4 full weeks beyond the current week (5 weeks of content total: the current week plus 4 more), and no further - scrolling simply cannot go past the last day of the 5th week.
3. **Given** the user has scrolled right and is now viewing a future week, **When** they scroll back left, **Then** they can return all the way to the current week's Sunday (even if that date is in the past relative to today, e.g. if today is Wednesday, the grid still starts from the Sunday three days prior) - but cannot scroll any further left than that; there is nothing before it.
4. **Given** the grid is scrolled to any position, **When** the user stops scrolling, **Then** the view can rest at any position, including showing parts of two adjacent weeks at once at the edges - there is no snapping to whole-week boundaries.

---

### User Story 2 - The mini-calendar always reflects what's actually in view (Priority: P2)

As a user scrolls the main grid, the mini-calendar in the sidebar - its highlighted week-row, and the month it displays - updates to match whichever week has now come into view, without the user needing to separately interact with the mini-calendar.

**Why this priority**: Keeps the sidebar meaningful as a "where am I" indicator once scrolling (not clicking) becomes the primary way of moving through weeks - without this, the mini-calendar would silently go stale the moment someone scrolls instead of clicking a row.

**Independent Test**: Scroll the main grid until a new week's Sunday is the leftmost visible column; confirm the mini-calendar's highlighted row updates to that week (and its displayed month updates too, if the new week falls in a different month), without any click.

**Acceptance Scenarios**:

1. **Given** the user scrolls the grid such that a new week's Sunday becomes the leftmost day-column currently visible on screen, **When** that happens, **Then** the mini-calendar's highlighted row immediately updates to that week.
2. **Given** that newly-leading week falls in a month different from what the mini-calendar currently displays, **When** the highlight updates, **Then** the mini-calendar also transitions to show that month (consistent with the existing month-follow behavior from feature 006).
3. **Given** the user is scrolling continuously (not using any button), **When** the leading week changes multiple times during one continuous scroll gesture, **Then** the mini-calendar's highlight keeps pace, always reflecting the current leading week, not just the final resting position.

---

### User Story 3 - Jumping to a specific week still works, and lands in a predictable spot (Priority: P2)

A user can still click the top arrow buttons, a mini-calendar row, or the Today button to jump directly to a specific week, and the grid scrolls there smoothly and lands in a consistent, predictable position every time.

**Why this priority**: Preserves the existing, already-shipped quick-navigation entry points from feature 006 - scrolling is the new primary interaction, but deliberate jumps still need to work.

**Independent Test**: From any scroll position, click next-week, previous-week, a mini-calendar row, or Today; confirm the grid smoothly scrolls so the target week's Sunday sits flush against the left edge of the view every time.

**Acceptance Scenarios**:

1. **Given** the grid is scrolled to any position, **When** the user clicks the next-week arrow, **Then** the grid smoothly scrolls forward so the week immediately after the current leading week has its Sunday flush against the left edge.
2. **Given** the grid is scrolled to any position, **When** the user clicks the previous-week arrow, **Then** the grid smoothly scrolls backward the same way (and does nothing if already at the leftmost/current week, since there's nothing before it).
3. **Given** the user clicks a mini-calendar row (for a week within the allowed range), **When** the scroll completes, **Then** that week's Sunday sits flush against the left edge, exactly as with the arrows.
4. **Given** the user clicks Today from any scroll position, **When** the scroll completes, **Then** the view lands at the very start of the scrollable range (the current week's Sunday flush left) - the same absolute position every time, since the current week is always the first thing in the range - and the vertical scroll still also moves to the current hour (unchanged from feature 007).
5. **Given** an in-progress slot selection (a "Start" slot already picked), **When** any of these jumps happen, **Then** the in-progress selection is cancelled, consistent with existing behavior.

---

### User Story 4 - See at a glance, without hovering, which slots can't be picked (Priority: P3)

A user scanning the grid can tell which slots are unselectable just by looking - not just a muted background (already shipped), but now also a small icon in each such cell, making it obvious without needing to hover for the tooltip.

**Why this priority**: A visibility improvement on top of the already-shipped muted background/tooltip from feature 007 - useful, but the existing muting and cursor already communicate "this isn't clickable" to some degree.

**Independent Test**: Open the grid and look (without hovering) at a disabled slot; confirm a small icon is visible in it, distinct from any selectable slot.

**Acceptance Scenarios**:

1. **Given** a slot is disabled (its day is before today, or it's today at-or-before the current hour), **When** the grid renders, **Then** that cell shows a small, low-opacity lock icon centered in it, in addition to the existing muted background.
2. **Given** a slot is selectable, **When** the grid renders, **Then** no icon appears in it.

### Edge Cases

- The current week's Sunday is always the leftmost reachable point - if today itself is a Sunday, the grid simply starts exactly at today with nothing before it, same rule as any other day of the week.
- Rapidly scrolling or repeatedly clicking an arrow/row/Today before a previous scroll finishes must still end up in the correct final position - a newer jump request takes over the current one rather than queuing or visibly fighting with it.
- The mini-calendar's own month browsing (its up/down chevrons) is unlimited into the past, same as it already is today - only the main grid's scrollable range has a lower bound of the current week. Clicking a mini-calendar row for a week before the current week's Sunday (reachable only by browsing the mini-calendar into the past) has no effect on the main grid, since that week no longer exists in its scrollable range.
- A booking selection (the existing click-to-set-start, click-to-set-end interaction) must keep working correctly for a start and end slot that span across what used to be a "week boundary," now that many weeks exist side by side on one continuous grid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The main grid MUST render as one continuous horizontally-scrollable surface spanning exactly 5 weeks of days (the current week plus 4 more weeks forward), rather than showing one week at a time with a swap transition between weeks.
- **FR-002**: The scrollable range's lower bound MUST be the Sunday of the week containing today, even when that date is itself in the past relative to today (e.g. today is Wednesday, the range still starts from the preceding Sunday) - the grid MUST NOT allow scrolling to any date before that.
- **FR-003**: The scrollable range's upper bound MUST be the last day of the 5th week (current week + 4 more) - the grid MUST NOT allow scrolling past that point.
- **FR-004**: Scrolling MUST be continuous/free, with no snapping to week boundaries - the view may rest showing parts of two adjacent weeks at once.
- **FR-005**: The "currently leading" week for mini-calendar sync purposes MUST be determined as whichever week's Sunday is the leftmost day-column still visible in the viewport at any given scroll position.
- **FR-006**: Whenever the leading week (per FR-005) changes - whether from a scroll gesture or a jump (FR-007) - the mini-calendar's highlighted week-row MUST update to match it, and the mini-calendar's displayed month MUST also update if the new leading week falls in a different month (consistent with feature 006's existing month-follow behavior).
- **FR-007**: The next-week/previous-week arrow buttons, mini-calendar row clicks, and the Today button MUST each smoothly scroll the grid so the target week's Sunday sits flush against the left edge of the view, replacing feature 006's discrete slide-swap transition for the main grid (the mini-calendar's own highlight-pill and month-view animations are unaffected).
- **FR-008**: The Today button's scroll target MUST always be the very start of the scrollable range (the current week's Sunday flush left) - it MUST also continue to move the vertical scroll position to the current hour, unchanged from feature 007.
- **FR-009**: The mini-calendar's own independent month-browsing (its up/down chevrons) MUST remain unrestricted into the past, as it already is today; only the main grid's own scrollable range is bounded.
- **FR-010**: Every disabled (time-restricted) slot MUST show a small, low-opacity lock icon centered within it, in addition to the existing muted background and native tooltip (feature 007) - selectable slots MUST show no such icon.
- **FR-011**: Any arrow click, mini-calendar row click, or Today click MUST cancel an in-progress slot selection, consistent with existing behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can reach any day within 4 weeks of the current week purely by scrolling, without clicking any button.
- **SC-002**: A user can never scroll the main grid to a date before the current week's Sunday, nor past the end of the 5th week.
- **SC-003**: At any moment, the mini-calendar's highlighted week and displayed month accurately reflect the leftmost visible week in the main grid, whether the user got there by scrolling or by clicking a jump control.
- **SC-004**: A user can identify every unselectable slot in the grid at a glance, without hovering any of them.

## Assumptions

- This remains frontend-only, consistent with the rest of this calendar modal's work - no backend/query wiring.
- The main grid's week-to-week slide-swap animation from feature 006 is removed for the main grid (replaced by native scroll); the mini-calendar's own highlight-pill animation and its month-view slide transition are unaffected and unchanged.
- "5 weeks of content" means 35 fixed day-columns rendered once on a continuous horizontal strip - not a lazily-extending or infinitely-loading range; the user explicitly asked for a finite, if generous, upper limit.
- The lock icon's exact visual weight/size is a small implementation detail, not spec'd to the pixel - any small, clearly-secondary (not competing with real content) lock icon satisfies FR-010.
