# Feature Specification: Uptime Request Availability Calendar

**Feature Branch**: `005-uptime-availability-calendar`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Replace the 'From (CET)'/'To (CET)' dropdown date pickers on the Uptime Request form with a single trigger that opens a large modal showing a Teams/Google-Calendar-style color-coded month view of existing Uptime Requests and Downtime Announcements for the selected environment, so a user can see the environment's availability before picking their own dates - read-only calendar (no click-to-select-range on the grid itself) for this phase; resolved through a comprehensive multi-round Q&A with the user (see below)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See an environment's existing bookings before picking dates (Priority: P1)

A user filling out the Uptime Request form selects an Environment, then clicks a new "Select Dates" button (which has replaced the old separate "From (CET)"/"To (CET)" fields). A large modal opens showing a month calendar for that environment: every existing Uptime Request (color-coded by status) and every active/upcoming Downtime Announcement mentioning that environment (shown in red-300) appears as a small marker on its day(s). The user can see at a glance which days already have activity before choosing their own From/To dates.

**Why this priority**: This is the entire point of the feature - letting a user avoid "blindly" double-booking an environment, which is the exact problem the user described.

**Independent Test**: Create two Uptime Requests for the same environment with overlapping date ranges (as two different browser sessions/users would). Open the form as a third user, select that environment, open the calendar, and confirm both existing requests appear as distinct, correctly color-coded markers on their respective days.

**Acceptance Scenarios**:

1. **Given** a user has selected an Environment on the form but has not yet selected dates, **When** they click "Select Dates", **Then** a large modal opens showing a month calendar scoped to that environment.
2. **Given** the modal is open, **When** the displayed month contains an existing Pending, Approved, or Completed Uptime Request for that environment, **Then** each day that request spans shows a marker in that status's existing app-wide color (Pending=amber, Approved=sky/blue, Completed=emerald/green).
3. **Given** the modal is open, **When** the displayed month contains an Active or Scheduled Downtime Announcement that lists that environment, **Then** each day it spans shows a marker in red-300.
4. **Given** a day has both an Uptime Request marker and a Downtime Announcement marker, **When** the user looks at that day, **Then** both markers are visible (stacked), each distinguishable by a small icon (one icon style for Uptime Requests, a different one for Downtime Announcements).
5. **Given** the user clicks a marker, **When** the popover opens, **Then** it shows that record's full detail (Uptime Request: ticket ID, environment, CET time range, status - no requester name/email; Downtime Announcement: heading, description, CET time range, status) without needing to leave the modal.

---

### User Story 2 - Select the actual From/To dates and times for the new request (Priority: P1)

Within that same modal, alongside the read-only calendar, the user sets their own request's From and To date/time (reusing this app's existing date/time picker control, just relocated into this modal instead of living as two separate fields on the main form). Closing the modal with valid dates selected populates the "Select Dates" button with a human-readable summary of the chosen range.

**Why this priority**: Equally critical to User Story 1 - without this, the form has no way to actually set the dates it needs to submit a request. Both stories ship together as a single indivisible unit of value (there is no useful intermediate state where only one exists).

**Independent Test**: Open the modal, pick a From date/time and a To date/time via the relocated picker controls, close the modal, and confirm the "Select Dates" button now shows the chosen range and the form submits with those exact values.

**Acceptance Scenarios**:

1. **Given** the modal is open, **When** the user sets a From date/time and a To date/time using the picker controls inside the modal, **Then** those values are held exactly as the old separate dropdown fields would have held them (same validation: both required, same CET semantics).
2. **Given** the user has set valid From/To values and closes the modal, **When** they look at the main form, **Then** the "Select Dates" button displays a human-readable summary of the selected range instead of a placeholder.
3. **Given** the user selects a range that overlaps an existing Uptime Request or Downtime Announcement visible on the calendar, **When** they submit the form, **Then** submission proceeds normally - overlap is informational only and never blocks submission.

---

### Edge Cases

- What happens if no Environment is selected yet? The "Select Dates" button is disabled with a hint to select an environment first - identical in spirit to how required-field dependencies already behave elsewhere in this app.
- What happens if the selected environment has zero existing Uptime Requests or Downtime Announcements at all? The calendar renders normally with no markers anywhere - an empty calendar, not an error or special empty state.
- What happens to Rejected/Cancelled Uptime Requests, or Expired/EndedEarly Downtime Announcements? They never appear on the calendar - they never represented real, current, or expected activity.
- What happens if the user switches the Environment selection after already viewing the calendar once? The calendar's markers refresh to reflect the newly selected environment the next time it's opened (or live, if already open - left to implementation to decide which is simpler, as long as stale-environment markers are never shown).
- What happens on a day where many bookings overlap? Markers stack within the day cell; this feature does not need to handle an unbounded number gracefully in any special way beyond what a normal compact marker list can show - this is explicitly out of scope for this phase's complexity (see Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Uptime Request form MUST replace its existing separate "From (CET)" and "To (CET)" fields with a single "Select Dates" trigger.
- **FR-002**: The "Select Dates" trigger MUST be disabled, with an explanatory hint, until an Environment has been selected on the form.
- **FR-003**: Clicking the "Select Dates" trigger MUST open a single large modal containing both a read-only availability calendar and the actual From/To date-and-time selection controls.
- **FR-004**: The availability calendar MUST display a month-grid view, scoped to the currently selected Environment, with navigation between months.
- **FR-005**: The calendar MUST show a marker for every non-deleted Uptime Request for that environment whose status is Pending, Approved, or Completed, on every day that request's date range spans. Rejected and Cancelled requests MUST NOT appear.
- **FR-006**: Each Uptime Request marker MUST be colored using this app's existing status color convention (the same colors already used elsewhere for Pending/Approved/Completed).
- **FR-007**: The calendar MUST also show a marker, in a fixed `red-300` color, for every Downtime Announcement whose status is Active or Scheduled and whose environments list includes the currently selected environment, on every day that announcement's date range spans. Expired and EndedEarly announcements MUST NOT appear.
- **FR-008**: Each marker MUST carry a small icon distinguishing an Uptime Request marker from a Downtime Announcement marker, since neither shows ticket ID or time range as on-calendar text.
- **FR-009**: Markers MUST render as day-cell-scoped indicators (e.g. small dots/pills), not as continuous bars spanning across multiple day cells - this phase explicitly does not implement cross-cell multi-day bar rendering or row-packing layout.
- **FR-010**: Clicking a marker MUST open a popover showing that record's full detail: for an Uptime Request, its ticket ID, environment, CET time range, and status (explicitly without requester name or email); for a Downtime Announcement, its heading, description, CET time range, and status.
- **FR-011**: The modal MUST let the user set the new request's From date/time and To date/time using this app's existing date/time picker control, functionally equivalent to what the two removed form fields previously provided (same required validation, same CET semantics).
- **FR-012**: Once both From and To are set and the modal is closed, the "Select Dates" trigger MUST display a human-readable summary of the selected range instead of its placeholder text.
- **FR-013**: The calendar MUST NOT block or restrict date selection based on overlaps with existing Uptime Requests or Downtime Announcements - overlap is informational only, and submission behavior is otherwise completely unchanged from today.
- **FR-014**: This feature MUST NOT introduce any new backend endpoint, schema change, or data write capability - the calendar only presents data (Uptime Requests, Downtime Announcements) that this app already stores and already fetches elsewhere.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can determine whether an environment already has activity planned around a given date range without leaving the Uptime Request form, in a single modal interaction.
- **SC-002**: A user can fully set a new request's From and To date/time inside the same modal that shows the calendar, with no loss of capability compared to today's two separate dropdown fields.
- **SC-003**: Submitting an Uptime Request whose dates overlap an existing one is never blocked by this feature - the only change is visibility, not restriction.
- **SC-004**: No other person's name or email is ever visible through this calendar - only ticket/record-level detail (ticket ID, time range, status, or announcement heading/description) is shown.

## Assumptions

- **Phased scope, confirmed directly with the user**: this feature (Phase 1) is deliberately read-only for the calendar grid itself - the user cannot click or drag on a day cell to set their From/To range directly. That richer interaction (replacing the relocated picker controls with true click/drag-to-select on the calendar) was explicitly deferred to a separate, future feature once this phase is in real use, specifically because of its much higher implementation complexity (continuous multi-day bar rendering with row-packing, akin to building a scaled-down Google Calendar).
- **Rendering fidelity, confirmed directly with the user**: markers are simple per-day indicators, not continuous cross-cell bars - chosen explicitly over higher-fidelity "real Google Calendar" rendering to keep this phase's complexity bounded, per the user's own stated concern about this feature's complexity.
- Default displayed month: if dates are already selected, the month containing the current From date; otherwise the current calendar month. Standard prev/next month navigation and a visual marker for "today" are assumed, consistent with ordinary calendar UI conventions, and were not treated as open questions.
- No new backend work: both data sources (Uptime Requests, Downtime Announcements) are already fully fetched elsewhere in this app; this feature only adds new client-side filtering/rendering logic, not new queries' underlying data.
- The existing date/time picker control (already used for From/To today) is relocated into the new modal as-is, with no functional changes to how it validates or stores CET date/time values - only its location in the UI changes.
