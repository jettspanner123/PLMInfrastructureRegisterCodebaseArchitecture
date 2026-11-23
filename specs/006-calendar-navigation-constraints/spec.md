# Feature Specification: Calendar Navigation & Booking Constraints

**Feature Branch**: `006-calendar-navigation-constraints`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Okay so the calendar view modal is almost completed ( without the backend and all, just the fronted ), just few more thing, user should not be able to select time/date before today and now, if today is 20th and 1pm, the user should be able to select from 20th 2.30pm onwards or something like that, also in the grild after saturday the next sunday also should be visible, the previsou sunday should not be visible please, as for not letting users book before today time and date, just make the mouse disabled and make the cursor to "not allowed" kind of cursor icons please ( native ), also the arrow button on top of the modal, they should be working, next button should move to the next week and dates, and previsou should do the opposite please, when changing from one weak to other thru arrow buttons or the calendar view in the left, the grils should have a slide animation please, like the weaks grids are sliging over to the selected weaks please, the arrow up and down arrow buttons in the left side calendar view should also change the current month, also it should have the slide animation, sliding to the next or previous month....the last thing is whereever the user is, when click on the "Today" button in the top, will slide the weaks grid and calendar view on the left to today's date and time please....this is a really large feature, so give me a comprehentisive questionare so that you and i are on the same page please"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Can't select a time that's already passed (Priority: P1)

A user opens the availability calendar to book a slot. Any day before today, and any hour on today that has already started, is clearly unselectable - the user can only ever pick a slot starting from the next full hour onward from right now.

**Why this priority**: This is a correctness/data-integrity guardrail, not a convenience feature - without it, the rest of the navigation work has no real purpose, since users could still submit a request for a moment that's already gone.

**Independent Test**: Open the calendar with the system clock at a known time (e.g. 1:15pm today). Confirm every slot before 2pm today, and every slot on any earlier day, refuses to start a selection and shows a "not allowed" cursor on hover. Confirm the 2pm slot today, and anything later, behaves exactly as it does today (fully selectable).

**Acceptance Scenarios**:

1. **Given** the current time is 1:15pm today, **When** the user hovers over today's 1pm-2pm slot, **Then** the cursor shows as "not allowed" and clicking it does nothing.
2. **Given** the current time is 1:15pm today, **When** the user clicks today's 2pm-3pm slot, **Then** it becomes the selection's start exactly as it already does for any other valid slot.
3. **Given** a day fully before today is visible in the grid, **When** the user hovers any slot on that day, **Then** every slot on that day shows "not allowed" and none are clickable.
4. **Given** the current time ticks past an hour boundary while the modal is open, **When** the user next interacts with the grid, **Then** the newly-past hour is disabled (this spec does not require a live per-second re-render while idle - re-evaluating on next interaction/open is sufficient).

---

### User Story 2 - Week navigation actually moves the grid (Priority: P2)

A user viewing one week can step forward or backward one week at a time using the arrow buttons above the grid, and sees the new week slide into view in the direction they moved.

**Why this priority**: This is the core navigation capability the whole feature is about - without it, a user can only ever see the one week they landed on.

**Independent Test**: With the modal open on a given week, click the next-week arrow and confirm the grid now shows the following Sunday-Saturday span, animating in from the right while the old week slides out to the left. Click previous and confirm the reverse.

**Acceptance Scenarios**:

1. **Given** the grid shows Sun 22-Sat 28, **When** the user clicks the next-week arrow, **Then** the grid shows Sun 29-Sat 5 (the next calendar week), sliding in from the right as the previous week slides out to the left, and the date-range label and day-column headers update together with the same motion.
2. **Given** the grid shows Sun 29-Sat 5, **When** the user clicks the previous-week arrow, **Then** the grid returns to Sun 22-Sat 28, sliding in from the left.
3. **Given** an in-progress slot selection (a "Start" slot already picked, no end yet), **When** the user clicks either week arrow, **Then** the in-progress selection is cancelled (matching how it's already cancelled when the modal closes).
4. **Given** the new week's Sunday falls in a different month than the one currently shown in the sidebar's mini-calendar, **When** the week changes, **Then** the mini-calendar also transitions to the new month (see User Story 3) so its highlighted row stays visible.

---

### User Story 3 - Mini-calendar navigation stays in sync (Priority: P3)

A user clicks a week-row in the sidebar's mini-calendar and the main grid slides to show that week. A user clicks the mini-calendar's month up/down arrows and the mini-calendar itself transitions to the adjacent month, without changing what week is currently selected in the main grid.

**Why this priority**: Builds on the navigation engine from User Story 2; it's a second, equally important entry point into the same navigation, plus the mini-calendar's own independent browsing capability.

**Independent Test**: Click a week-row several weeks away from the currently selected one and confirm the main grid slides (direction depending on whether that week is earlier or later than the current one) and the mini-calendar's highlight moves to the clicked row with its own synchronized animation. Separately, click the mini-calendar's month arrows and confirm only the mini-calendar's displayed month changes (with a horizontal slide) while the main grid's selected week is untouched, until a row is actually clicked.

**Acceptance Scenarios**:

1. **Given** the mini-calendar is showing November with "22-28" highlighted, **When** the user clicks the "15-21" row, **Then** the main grid slides left (backward) to show Sun 15-Sat 21, and the mini-calendar's highlight animates from the "22-28" row position to the "15-21" row position.
2. **Given** the user clicks a week-row that is later than the currently selected week, **When** the main grid updates, **Then** it slides right (forward), matching the same direction convention as the top arrow buttons.
3. **Given** the mini-calendar is showing November, **When** the user clicks its "next month" chevron, **Then** the mini-calendar slides horizontally to show December, while the main grid and its currently selected week remain exactly as they were.
4. **Given** the user has browsed the mini-calendar to a different month via its own arrows, **When** the user then clicks a week-row there, **Then** the main grid slides to that week exactly as in Scenario 1/2, and normal main-grid-drives-mini-calendar sync resumes from then on.

---

### User Story 4 - "Today" button returns to now from anywhere (Priority: P4)

A user who has navigated far away from the current week - in the main grid, the mini-calendar, or both - clicks "Today" and is brought back to the present: the main grid slides to the week containing today, the mini-calendar slides to the month containing today with today's week-row highlighted, and the grid's vertical scroll position moves to show the current hour.

**Why this priority**: A convenience shortcut that depends on the navigation and animation mechanics already built in User Stories 2-3; valuable but not load-bearing on its own.

**Independent Test**: Navigate several weeks and/or months away from the current one, then click "Today". Confirm the main grid, the mini-calendar, and the vertical scroll position all land back on the current week/month/hour, each animating in the correct direction given where the user was.

**Acceptance Scenarios**:

1. **Given** the user is viewing a week in the future relative to today, **When** they click "Today", **Then** the main grid slides backward (left) to the current week, the mini-calendar slides back to the current month if it had changed, and its highlight moves to the current week's row.
2. **Given** the user is viewing a week in the past relative to today, **When** they click "Today", **Then** the equivalent happens sliding forward (right).
3. **Given** the user is already viewing the current week, **When** they click "Today", **Then** no week/month slide occurs (nothing to move), but the vertical scroll position still moves to show the current hour.
4. **Given** an in-progress slot selection, **When** the user clicks "Today", **Then** the in-progress selection is cancelled, same as any other navigation action.

### Edge Cases

- A week that straddles two months (e.g. Sun 29 Nov-Sat 5 Dec) is selected: the mini-calendar follows to whichever month lets its grid actually contain that week's Sunday (per existing month-grid generation, trailing/leading days from the adjacent month are already shown faded).
- The user holds down a week-arrow button rapidly (fires several navigations before an animation finishes): each new navigation is still direction-correct and lands on the right final week; a previous in-flight slide does not need to fully settle before the next one starts, but must not leave the grid showing a visually broken/half-blended intermediate state.
- Clicking "Today" while already on today's week AND already scrolled to the current hour is a no-op with no visible change.
- A full day that is entirely in the past (not today) always shows every one of its slots as disabled, regardless of what hour "now" is.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The grid MUST treat every slot on a calendar day before today as unselectable.
- **FR-002**: On today's column specifically, the grid MUST treat every hour slot up to and including the one "now" falls within as unselectable; the next full hour after the current time is the earliest selectable slot.
- **FR-003**: An unselectable slot MUST show the browser's native "not allowed" cursor on hover, MUST show a visibly muted/dimmed background distinguishing it from a selectable slot, and MUST NOT respond to clicks (cannot become a selection start, end, or be entered via hover-preview).
- **FR-004**: This disabled state MUST visually take precedence over the existing weekend-muted styling - a past slot that also happens to fall on a weekend still simply reads as "disabled," not as some combined third visual state.
- **FR-005**: The "next week" and "previous week" arrow buttons above the main grid MUST shift the selected week forward or backward by exactly 7 days respectively, with no lower or upper bound on how far a user can navigate.
- **FR-006**: Changing the selected week (by either arrow button or a mini-calendar row click) MUST animate the main grid - day-column headers, the date-range label, and the hourly grid together - sliding out the old week and sliding in the new one, direction-matched to whether the new week is later (slides in from the right) or earlier (slides in from the left) than the old one.
- **FR-007**: Clicking a week-row in the mini-calendar MUST select that week in the main grid (triggering the same animated transition as FR-006) and MUST update the mini-calendar's own highlighted-row indicator, animating its move from the old row's position to the new one.
- **FR-008**: The mini-calendar's month navigation (up/down chevrons) MUST change the month it displays, animating with a horizontal slide, and MUST NOT by itself change the main grid's currently selected week.
- **FR-009**: Whenever the main grid's selected week changes (via FR-006/FR-007) to a week whose Sunday falls in a month other than the one the mini-calendar currently displays, the mini-calendar MUST automatically transition to that month (same sliding behavior as FR-008) so the newly-selected week's row is visible and highlighted.
- **FR-010**: The "Today" button MUST, in one action: select the week containing the current date (animated per FR-006 if different from the currently selected week), bring the mini-calendar to the month containing the current date with that week's row highlighted (animated per FR-008/FR-009 if different from the currently displayed month), and move the grid's vertical scroll position to bring the current hour into view.
- **FR-011**: Any action that changes the selected week or triggers the "Today" reset (arrows, mini-calendar row click, or the Today button) MUST cancel an in-progress slot selection (an already-picked "Start" slot with no end chosen yet), consistent with how it is already cancelled on Escape or modal close.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can never submit a selection that starts before the current date and time - every past-or-in-progress hour is unselectable regardless of which week is being viewed.
- **SC-002**: A user can reach any week before or after the one they started on using only the arrow buttons, with no dead end in either direction.
- **SC-003**: From any arbitrary week/month the user has navigated to, a single click of "Today" returns the visible week, the visible month, and the scroll position to the current date and time.
- **SC-004**: Every week, month, and Today transition is visibly animated (not an instant jump), and the direction of motion always matches whether the destination is later or earlier than where the user was.

## Assumptions

- This is a frontend-only, static-data change, consistent with the rest of this calendar modal's work so far - no backend/query wiring is introduced or required by this feature.
- No live "current time" indicator line is being added to the grid (e.g. a red line marking "now" within today's column); the user did not ask for one, and nothing in this feature strictly requires it. It would be a natural, separate follow-up.
- There is no artificial floor or ceiling on how far back or forward a user can navigate via the week arrows or the mini-calendar's month arrows - navigating far into the past simply shows a week/month made entirely of disabled slots.
- Re-evaluating which slots count as "past" happens on render/interaction, not via a live per-second timer while the modal sits open and idle.
