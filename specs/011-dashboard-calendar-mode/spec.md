# Feature Specification: Dashboard Calendar Mode

**Feature Branch**: `011-dashboard-calendar-mode`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "okay so a big feature we are going to have is that, in the "Uptime Request" page, when in the "Dashboard View Mode" there is going to be one more segmented controller right next to it, with 2 options, a. calendar mode, b. dashboard mode, the "Dashboard Mode" will be same as whatever we already have, but in calendar mode, we will be showing the "Calendar View" modal there, without the modal please, bascailly the enter calendar thing with the calendar and event cards and everything but without a modal please"

## Clarifications

### Session 2026-11-25

- Q: Dashboard View Mode shows requests across all environments with no environment concept at all, but the calendar needs exactly one environment. How should Calendar Mode let the admin pick which environment's calendar to view? → A: A new, standalone environment dropdown inside Calendar Mode, starting empty until an environment is chosen.
- Q: Today, picking an empty time slot starts a new in-progress booking that feeds into the Form's From/To fields. What should picking an empty slot do in Calendar Mode, where there's no form on screen? → A: Nothing — Calendar Mode is read-only browsing only; starting a new request still requires switching to Form View Mode.
- Q: Dashboard Mode shows a 50:50 split (summary cards left, requests list right). Should Calendar Mode share that space or take it over? → A: Full-width calendar — summary cards and the requests list are both hidden while Calendar Mode is active.
- Q: Should this new inner toggle persist its last choice across reloads, like most preferences in this app, or reset like the outer Dashboard View Mode/Form View Mode toggle does? → A: Never persist — always starts on Dashboard Mode on a fresh page load, matching the outer toggle's own behavior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View an environment's calendar without a modal (Priority: P1)

An admin viewing the Uptime Request page's Dashboard View Mode switches a new inner toggle to "Calendar Mode," picks an environment from a dropdown, and sees that environment's full availability calendar — the same 5-week grid, mini-calendar, jump controls, and status-colored event cards used today inside the booking-selection modal — rendered directly on the page, with no dialog, overlay, or backdrop.

**Why this priority**: This is the entire feature — without it, there is nothing new to deliver. Every other story depends on this calendar actually being on the page.

**Independent Test**: Can be fully tested by switching to Calendar Mode, picking an environment with known bookings/downtime, and confirming the calendar renders inline with the correct data and no modal chrome.

**Acceptance Scenarios**:

1. **Given** an admin is in Dashboard View Mode showing the existing Dashboard Mode content, **When** they switch the new inner toggle to Calendar Mode, **Then** the summary cards and requests list are replaced by an environment dropdown (empty by default) and an empty-state prompt to pick an environment.
2. **Given** Calendar Mode is active with no environment picked, **When** the admin selects an environment from the dropdown, **Then** the full availability calendar renders for that environment, showing the same grid, navigation, and event cards (colored by status, with downtime windows) as today's modal.
3. **Given** an environment's calendar is already showing, **When** the admin picks a different environment from the dropdown, **Then** the calendar updates to show the newly selected environment's bookings and downtime instead, replacing the previous environment's data.

---

### User Story 2 - Browse bookings and downtime read-only (Priority: P2)

While viewing a Calendar Mode environment's calendar, an admin clicks an existing booking or downtime event card to see its full details, without being able to start a new booking from this view.

**Why this priority**: Delivers the actual value of "browsing at a glance" — without detail access, the calendar is just colored blocks with no way to drill in. Lower priority than Story 1 since the calendar itself must exist first.

**Independent Test**: Can be fully tested by clicking a real booking card and a downtime card in Calendar Mode and confirming each opens its existing detail modal, then confirming clicking/dragging an empty slot does nothing.

**Acceptance Scenarios**:

1. **Given** a real uptime-request event card is visible in Calendar Mode, **When** the admin clicks it, **Then** its existing read-only detail modal opens showing the full request information.
2. **Given** a downtime announcement event card is visible in Calendar Mode, **When** the admin clicks it, **Then** its existing read-only detail modal opens showing the full announcement information.
3. **Given** an empty, unbooked time slot is visible in Calendar Mode, **When** the admin clicks or drags across it, **Then** nothing happens — no highlight, no "Start" marker, no in-progress selection.

---

### User Story 3 - Switch between Dashboard Mode and Calendar Mode (Priority: P3)

An admin freely switches between the existing Dashboard Mode content and the new Calendar Mode using the new inner segmented control, with the page always starting in Dashboard Mode on a fresh load.

**Why this priority**: Polish on top of Stories 1-2 — confirms the toggle itself behaves predictably and doesn't leak state across reloads or interfere with non-admin access. Lowest priority since it's about the surrounding toggle behavior, not the calendar's own content.

**Independent Test**: Can be fully tested by reloading the page and confirming it lands on Dashboard Mode, then switching modes repeatedly and confirming no persistence across a reload.

**Acceptance Scenarios**:

1. **Given** an admin is in Dashboard View Mode, **When** the page first loads, **Then** the inner toggle defaults to Dashboard Mode, matching today's summary cards + list feed layout.
2. **Given** an admin has switched to Calendar Mode and then reloads the page, **When** the page finishes loading, **Then** the inner toggle has reset to Dashboard Mode (not persisted).
3. **Given** a non-admin user visits the Uptime Request page, **When** the page renders, **Then** neither the outer Dashboard View Mode/Form View Mode toggle nor the new inner Calendar Mode/Dashboard Mode toggle is shown, unchanged from today.

---

### Edge Cases

- What happens when no environments exist at all (no data to populate the dropdown)? The dropdown shows no options, and the same "pick an environment" empty-state prompt remains.
- What happens when the selected environment has zero bookings and zero downtime announcements? The calendar renders its normal grid with no event cards, exactly as the modal does today for a sparse environment.
- What happens if an admin switches to Form View Mode, submits or browses a different environment there, then returns to Dashboard View Mode's Calendar Mode? Calendar Mode's own environment selection is independent of whatever is selected in the Form — it is unaffected by Form View Mode activity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: While Dashboard View Mode is active, admins MUST see a new segmented control, positioned next to the existing Dashboard View Mode/Form View Mode toggle, offering "Calendar Mode" and "Dashboard Mode" options.
- **FR-002**: The Calendar Mode/Dashboard Mode toggle MUST only appear while the outer toggle is on Dashboard View Mode — it MUST NOT appear while Form View Mode is active.
- **FR-003**: The Calendar Mode/Dashboard Mode toggle MUST default to Dashboard Mode on every page load and MUST NOT persist its last-selected value across reloads.
- **FR-004**: When Dashboard Mode is active, the screen MUST show the existing summary cards (Total Requests, Pending, Active & Upcoming Downtime) and the full requests list feed, unchanged from current behavior.
- **FR-005**: When Calendar Mode is active, the screen MUST hide the summary cards and the requests list feed entirely, showing only the Calendar Mode content in their place.
- **FR-006**: Calendar Mode MUST present a dropdown for selecting exactly one environment, using the same list of environment names as the Form View Mode's own Environment field, with no environment selected by default.
- **FR-007**: Until an environment is selected in Calendar Mode, the screen MUST show an empty-state prompt instructing the admin to pick an environment, instead of a calendar.
- **FR-008**: Once an environment is selected, Calendar Mode MUST render that environment's full availability calendar directly on the page — the same scrollable multi-week grid, mini-calendar, jump controls, and event-card rendering used by today's booking-selection modal — with no modal dialog, overlay, or backdrop.
- **FR-009**: The calendar's event cards in Calendar Mode MUST show the selected environment's real uptime-request bookings (colored by status, per existing status-color behavior) and downtime announcements (fixed red styling), identical to the modal's existing rendering.
- **FR-010**: Clicking a real booking or downtime event card in Calendar Mode MUST open its existing read-only detail modal, identical to today's modal behavior.
- **FR-011**: Calendar Mode MUST NOT allow starting a new in-progress booking pick — clicking or dragging an empty time slot MUST have no visible effect (no highlight, no "Start" marker, no date selection).
- **FR-012**: Changing the environment dropdown's selection MUST update the calendar to show the newly selected environment's bookings and downtime, replacing whatever the previous environment showed.
- **FR-013**: Non-admin users MUST continue to see only the Form View Mode content, with neither the outer nor the inner toggle visible, unchanged from current behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can view any environment's full booking/downtime calendar from Dashboard View Mode without opening any dialog or leaving the page.
- **SC-002**: Switching between Calendar Mode and Dashboard Mode feels instantaneous, matching the existing Dashboard View Mode/Form View Mode toggle's own responsiveness.
- **SC-003**: Every real booking and downtime window visible in the existing booking-selection modal for a given environment is also visible in Calendar Mode for that same environment, with no omissions.
- **SC-004**: 100% of page loads land on Dashboard Mode by default, with zero page loads unexpectedly starting in Calendar Mode.

## Assumptions

- The environment dropdown's selected value is plain in-session state: it resets to empty on a page reload, but is retained while merely switching between Dashboard Mode, Calendar Mode, and Form View Mode without a reload.
- Calendar Mode reuses the exact same calendar grid, event-card rendering, status colors, and detail-modal behavior already shipped for the booking-selection modal (specs 005 through 010) — the only new work is removing the modal's own chrome (overlay, close button, dialog frame) and adding the environment dropdown and empty state.
- The existing right-click "Delete," which today is scoped only to the viewer's own in-progress pick, has nothing to act on in Calendar Mode, since Calendar Mode never creates an in-progress pick (per FR-011) — this is a natural consequence of read-only browsing, not new behavior to build.
- This feature only changes the Uptime Request page's Dashboard View Mode. The Form View Mode's own booking-selection modal, with its full pick-and-submit flow, is untouched and remains the only way to submit a new uptime request.
- Non-admin behavior, the outer Dashboard View Mode/Form View Mode toggle's own admin gating, and all backend endpoints/data remain unchanged.
