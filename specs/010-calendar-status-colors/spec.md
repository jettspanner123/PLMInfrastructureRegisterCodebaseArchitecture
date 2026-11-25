# Feature Specification: Calendar Event Card Status Colors

**Feature Branch**: `010-calendar-status-colors`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "NOw what i want you to do is that, each event card will be having different colors, if pending -> #ffa826 this should be the bg color of the event card, for approved -> #26acff, for completed -> #29d944, these are the colors that i want to use for the event cards, keep the text color the same as it currently is (dark mode and light mode included), these are the base colors for the event card, please use these, according to thesse the border color should chnage, the timing pill bg should also change and the vertical scripe should also change please"

## Clarifications

### Session 2026-11-25

- Q: For each status, how should the border, timing-pill background, and vertical stripe relate to the one base color given (e.g. Pending's `#ffa826`)? → A: Same hex, different opacities — border at reduced opacity, stripe at full solid opacity (matching the card background), timing pill at a lower opacity so its text stays readable. Nothing new is invented; every part of one card traces back to that one status color.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tell a booking's status apart at a glance (Priority: P1)

A user looking at the availability calendar sees existing uptime-request bookings rendered as event cards. Today every booking looks identical regardless of whether it's still pending, has been approved, or is already completed — the only way to know is to open it. Instead, each card's whole look (its background, border, the small stripe down its left edge, and the time-range pill) should immediately say which of those three states it's in, using one dedicated color per status, without needing to click anything.

**Why this priority**: This is the entire point of the feature — everything else is just how that one color is applied consistently across the card's parts.

**Independent Test**: Open the calendar for an environment with at least one Pending, one Approved, and one Completed booking visible at once; confirm each renders with its own distinct, correct color across its background, border, stripe, and time pill, and that all three are visually distinguishable from each other and from the existing downtime (red) cards.

**Acceptance Scenarios**:

1. **Given** an existing booking with status Pending, **When** the calendar renders its event card, **Then** the card's background is the Pending color, its border, stripe, and time pill are visibly derived from that same color (not the color used for any other status), and all text on the card remains exactly as readable/colored as it is today.
2. **Given** an existing booking with status Approved, **When** the calendar renders its event card, **Then** the same rule applies using the Approved color instead.
3. **Given** an existing booking with status Completed, **When** the calendar renders its event card, **Then** the same rule applies using the Completed color instead.
4. **Given** the user's own in-progress, not-yet-submitted pick (which has no status yet, since it isn't a real booking), **When** it renders on the calendar, **Then** it keeps its current appearance unchanged — this feature only affects cards for bookings that already have one of the three statuses.
5. **Given** a downtime announcement's red event card, **When** it renders alongside status-colored booking cards, **Then** it is unaffected by this feature and stays exactly as it already looks.

---

### Edge Cases

- What happens to a booking whose status is neither Pending, Approved, nor Completed (e.g. Rejected or Cancelled)? These never render as event cards at all today (an existing rule from the calendar-backend-integration feature) and continue not to — this feature only defines colors for the three statuses that do render.
- What happens where two adjoining days' cards for the same multi-day booking meet? Each day's segment of the same booking already renders as its own card today; each still gets the one color matching that booking's single status, consistently across every day it spans.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each existing-booking event card on the calendar MUST use one of three colors based on that booking's status: `#ffa826` for Pending, `#26acff` for Approved, `#29d944` for Completed.
- **FR-002**: A card's background MUST be exactly its status's color, at full/solid opacity.
- **FR-003**: A card's border MUST be derived from that same status color at a reduced opacity, replacing today's fixed purple border.
- **FR-004**: A card's time-range pill background MUST be derived from that same status color at a lower opacity than the border, chosen so the pill's existing text color remains clearly readable against it.
- **FR-005**: A card's left-edge vertical stripe MUST be that same status color at full/solid opacity.
- **FR-006**: No text color anywhere on the card (title, time-range pill text, or subtitle) MUST change from how it renders today.
- **FR-007**: The viewer's own in-progress, not-yet-submitted pick MUST NOT be affected by this feature (it has no status to map to a color) and MUST keep rendering exactly as it does today.
- **FR-008**: Downtime announcement event cards MUST NOT be affected by this feature and MUST keep rendering exactly as they do today (their own red styling, defined separately).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can correctly identify a visible booking's status (Pending, Approved, or Completed) purely from its event card's color, without clicking it, in effectively all cases.
- **SC-002**: Every part of one event card (background, border, stripe, time pill) reads as belonging to the same single color family at a glance — nothing on one card looks like it belongs to a different status's color.

## Assumptions

- This applies only to the availability calendar's "event card" presentation (the Teams-style grid cards for existing bookings) — no other screen's status badges, pills, or cards (e.g. the Downtime Announcements list, the dashboard's downtime card, or the Submitted Requests list) are affected by this feature.
- The calendar's own visual style has no separate light-mode variant today (it is a fixed, always-dark presentation regardless of the app's own theme toggle) — "keep the text color the same... dark mode and light mode included" is satisfied by leaving every text color untouched, since there is nothing theme-conditional to preserve separately.
- Exact opacity values for the border and time-pill background are a planning-phase detail, informed by what already exists for today's purple scheme and by keeping pill text readable — not spelled out here since they don't change the user-facing requirement itself.
