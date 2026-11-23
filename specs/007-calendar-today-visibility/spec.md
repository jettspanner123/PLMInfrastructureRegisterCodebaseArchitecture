# Feature Specification: Calendar Today Visibility & Restricted-Slot Tooltip

**Feature Branch**: `007-calendar-today-visibility`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Few more things on the frontend after which we'll start with the connection with backend, first of all, in the grid, the previous sunday should not be there, there should be the coming sunday please, the current day column should have a different color, and current time cell should have a different color as well please (current date column color != current time cell color please ), also when hovering on cell's which are restrected due to time, it should show a tool tip also please with a really small message,"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See at a glance which day is today and which slot is right now (Priority: P1)

A user viewing the availability grid can immediately tell which column is today, and within that column, which single slot corresponds to the current moment - two distinct visual cues, not one.

**Why this priority**: Pure orientation - without it, a user has to read day numbers against their own memory of the date to figure out where "now" is on the grid at all.

**Independent Test**: Open the modal on a week that includes today. Confirm today's entire column has a visibly different background than other non-weekend, non-disabled columns, and that the one slot matching the current hour has a further distinct look from both the rest of its own column and from any other disabled (past) slot elsewhere in the grid.

**Acceptance Scenarios**:

1. **Given** the displayed week includes today, **When** the grid renders, **Then** every cell in today's column shows a subtle accent tint, visible regardless of whether that day is also a weekend or contains disabled slots.
2. **Given** today's column is showing its tint, **When** looking at the specific hour-slot containing the current real-world time, **Then** that one cell shows a visibly stronger/different version of the same accent - distinguishable from the rest of its own column at a glance, not just on close inspection.
3. **Given** a disabled (past) slot elsewhere in today's column that is *not* the current-time slot, **When** compared to the current-time slot, **Then** the two are visually distinct from each other (plain disabled look vs. the current-time accent).
4. **Given** the displayed week does *not* include today (the user has navigated away), **When** the grid renders, **Then** no column shows the today-tint and no cell shows the current-time accent - both are only ever shown when today is actually part of the visible week.

---

### User Story 2 - Understand why a slot can't be selected (Priority: P2)

A user hovering over a disabled (time-restricted) slot sees a short native tooltip explaining why it can't be booked, instead of just a cursor change with no explanation.

**Why this priority**: A secondary discoverability aid on top of the already-shipped not-allowed cursor (feature 006) - useful, but the cursor change alone already communicates "this isn't clickable."

**Independent Test**: Hover a disabled slot and confirm a small native browser tooltip appears with a short explanatory message after the usual native hover delay; hover a selectable slot and confirm no such tooltip appears.

**Acceptance Scenarios**:

1. **Given** a slot is disabled because its day is before today, **When** the user hovers it, **Then** a native tooltip appears with a short message.
2. **Given** a slot is disabled because it's today at-or-before the current hour, **When** the user hovers it, **Then** the same style of native tooltip appears (message content may be the same for both disabled reasons - this is a single unified "why" explanation, not two different messages).
3. **Given** a slot is selectable, **When** the user hovers it, **Then** no tooltip appears (unchanged from today).

### Edge Cases

- Today's column tint and the current-time cell's accent must remain visually distinguishable from the existing weekend-muted and disabled backgrounds already shipped in feature 006 - none of the four should be confusable with another.
- If today happens to be a weekend day, the today-tint and the weekend-muted background both apply to that column; the current-time accent still further distinguishes its one cell.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Whenever today is part of the currently displayed week, every cell in today's column MUST show a background tint of `rgba(91, 95, 199, 0.08)`, layered as an overlay so it still shows (at reduced visual strength, naturally, since it's translucent) on top of the existing weekend-muted and disabled cell backgrounds rather than being hidden by them.
- **FR-002**: The single slot matching the current real-world hour (the same slot already marked disabled per feature 006's past-time rule) MUST additionally show a stronger tint of `rgba(91, 95, 199, 0.18)`, distinguishing it from both the rest of today's column (FR-001's weaker tint) and from any other plain-disabled slot.
- **FR-003**: Today's column tint (FR-001) and current-time cell accent (FR-002) MUST NOT appear at all when the displayed week does not include today.
- **FR-004**: Hovering any disabled (time-restricted) slot MUST show a native browser tooltip (the HTML `title` attribute) with a short message explaining the slot can't be selected because it's in the past.
- **FR-005**: Selectable slots MUST NOT show any tooltip, unchanged from current behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can identify today's column and the current-time slot within it without reading any date/time labels - purely from the two distinct accent colors.
- **SC-002**: A user hovering any disabled slot sees an explanation of why it's disabled, with no extra click or action required.

## Assumptions

- **Explicitly out of scope for this spec**: the "previous Sunday shouldn't be there, coming Sunday instead" behavior from the original request is deferred - the user indicated they have a specific approach in mind and will describe it separately. Nothing about the week/day-window anchoring logic changes in this feature.
- This remains frontend-only, consistent with the rest of this calendar modal's work - no backend/query wiring.
- The tooltip's exact wording is a small, low-stakes implementation detail (not spec'd verbatim here) - any short, accurate "this time has passed" style message satisfies FR-004.
