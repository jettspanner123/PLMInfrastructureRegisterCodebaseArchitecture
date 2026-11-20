# Feature Specification: Uptime Request Dashboard View

**Feature Branch**: `003-uptime-request-dashboard`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Admin-only segmented control (Dashboard / Form) on the Uptime Requests page, resolved through a comprehensive Q&A with the user (see below), mirroring the Infra Register page's existing View/Edit Mode toggle pattern."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin gets an at-a-glance overview by default (Priority: P1)

An admin opens the Uptime Requests page and, instead of landing on the submission form, sees a Dashboard: two summary cards (Total Requests, Pending) and a list of active/upcoming downtime on the left, with the full requests list on the right - the same 50:50 layout as the Form view, just with the left pane swapped from the submission form to this summary. This lets them assess the current state of uptime requests at a glance, without losing access to the full request list.

**Why this priority**: This is the core value the feature exists to deliver - everything else (the Form view, the toggle) exists in service of making this overview available.

**Independent Test**: Log in as an admin and open the Uptime Requests page. Confirm the Dashboard (not the form) is shown, laid out 50:50 with the two cards and downtime list on the left and the full requests list on the right, and that the cards reflect the real counts of existing requests.

**Acceptance Scenarios**:

1. **Given** an admin visits the Uptime Requests page, **When** the page loads, **Then** the Dashboard view is shown by default (not the submission form), laid out 50:50 like the Form view.
2. **Given** the Dashboard is showing, **When** there are a known number of requests in total and a known number Pending, **Then** each of the two cards shows exactly that count.
3. **Given** the Dashboard is showing, **When** there are existing Uptime Requests of any status, **Then** the right pane lists all of them, identical to the Form view's own request list.

---

### User Story 2 - Admin can still submit and manage requests via Form view (Priority: P2)

An admin switches to "Form" using a segmented control in the page header to get back today's exact submission form and request list feed, and can switch back to "Dashboard" at any time. Each switch animates rather than snapping instantly.

**Why this priority**: Without this, making Dashboard the default view would block admins from actually submitting or deleting requests - the existing capability must remain fully reachable.

**Independent Test**: As an admin, select "Form" in the segmented control and confirm the page shows exactly today's form + request list + banner. Select "Dashboard" again and confirm it switches back, with a visible animated transition each time.

**Acceptance Scenarios**:

1. **Given** an admin is on the Dashboard view, **When** they select "Form" in the segmented control, **Then** the page shows the existing submission form, request list feed, and Downtime Announcement banner, unchanged from today's behavior.
2. **Given** an admin switches between Dashboard and Form, **When** the view changes, **Then** the transition animates rather than swapping instantly.
3. **Given** an admin reloads the page or navigates away and back, **When** they return to the Uptime Requests page, **Then** the view resets to Dashboard regardless of which view they had selected before.

---

### User Story 3 - Admin retains downtime awareness without the banner (Priority: P3)

Because the Dashboard view does not show the Downtime Announcement banner, an admin on the Dashboard can instead see a list of every currently active and upcoming (scheduled) downtime announcement, so switching to Dashboard never costs them visibility into downtime they'd otherwise see via the banner.

**Why this priority**: This closes a real regression the Dashboard view would otherwise introduce, but it's secondary to the overview itself (User Story 1) and to preserving existing form functionality (User Story 2).

**Independent Test**: Create one active and one scheduled downtime announcement, then view the Dashboard as an admin and confirm both appear in a list with no action controls.

**Acceptance Scenarios**:

1. **Given** there is one active downtime announcement and one scheduled one, **When** an admin views the Dashboard, **Then** both appear in a list.
2. **Given** there are no active or scheduled downtime announcements, **When** an admin views the Dashboard, **Then** the list shows an appropriate empty state instead of an empty gap.
3. **Given** an admin is viewing this list on the Dashboard, **When** they look for an action like ending an announcement early, **Then** no such control is offered there - it is read-only.

---

### Edge Cases

- What happens for a non-admin user? They never see the segmented control and always see exactly today's Form view (submission form + request list feed + banner) - nothing about their experience changes.
- What happens when there are zero Uptime Requests at all? Both cards show 0, and the right-pane list shows its existing empty state, consistent with this app's existing empty-state conventions.
- What happens if the segmented control is toggled rapidly several times in a row? Each switch completes cleanly without a stacked or broken transition - the view always ends up matching whichever option is currently selected.
- What happens if an admin's session loses admin status while they're on the Dashboard (e.g. role changed by someone else)? Out of scope for this feature - same as how this app's other admin-only UI already behaves with no special handling for that case.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Uptime Requests page MUST show a segmented control with two options, "Dashboard" and "Form", in its header - visible only to admin-authenticated users.
- **FR-002**: Non-admin users MUST NOT see the segmented control, and MUST always see exactly today's existing Form view (submission form, request list feed, and Downtime Announcement banner), unchanged by this feature.
- **FR-003**: An admin visiting the Uptime Requests page MUST see the Dashboard view by default. This default MUST NOT be remembered across page loads - every fresh page load resets to Dashboard regardless of what the admin had selected previously.
- **FR-004**: Selecting "Form" MUST show exactly today's existing Form view (submission form on the left, request list feed on the right, Downtime Announcement banner above both), unchanged.
- **FR-005**: Selecting "Dashboard" MUST show the same 50:50 side-by-side layout as the Form view: the left pane replaced with two summary cards and a downtime announcements list (detailed in FR-006, FR-008, FR-009), and the right pane showing the exact same full requests list feed used by the Form view. The Downtime Announcement banner MUST NOT appear on the Dashboard view.
- **FR-006**: The "Total Requests" card MUST count all non-deleted Uptime Requests ever created, regardless of status. The "Pending" card MUST count non-deleted Uptime Requests currently in that status.
- **FR-008**: The Dashboard's downtime announcements list MUST include every announcement whose status is Active or Scheduled, MUST exclude expired ones, and MUST show all qualifying announcements with no cap on how many are listed.
- **FR-009**: The Dashboard's downtime announcements list MUST be read-only - it MUST NOT offer any action (such as ending an announcement early) that isn't already available elsewhere in the app.
- **FR-010**: Switching between Dashboard and Form MUST animate the transition rather than swapping instantly.
- **FR-011**: This feature MUST NOT introduce any new backend data-write capability - both views only present or aggregate data (Uptime Requests, Downtime Announcements) that already exists.

> **Revision (2026-11-20)**: Per direct user follow-up after initial implementation, the original FR-007 (a 30-day trend graph) and the "Approved"/"Completed" cards (originally part of FR-006) were removed, and the Dashboard's layout was changed from a single stacked column to the same 50:50 split as Form view, with the right pane reusing the Form view's own request list feed verbatim. `recharts` (added solely for the now-removed trend graph) was uninstalled as a result.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can read the current total and pending Uptime Request counts within 2 seconds of the page finishing load, without opening the full request list.
- **SC-002**: An admin can switch between Dashboard and Form views in a single action, with the transition completing in under 1 second.
- **SC-003**: An admin never loses visibility into active or upcoming downtime announcements, regardless of which view (Dashboard or Form) they are currently on.
- **SC-004**: Non-admin users experience zero observable change to the Uptime Requests page after this feature ships.

## Assumptions

- The Dashboard/Form choice is never persisted across page loads, mirroring the existing View/Edit Mode toggle on the Infrastructure Register page, which also always resets rather than remembering the admin's last choice (confirmed with the user).
- "Total Requests" and the status-specific card counts exclude soft-deleted requests, consistent with how counts and lists are already filtered elsewhere in this app.
- The transition animation's specific style/duration is left to the planning/implementation phase, consistent with how this app's existing segmented controls and animated UI are styled.
- No new backend security boundary is required: the Dashboard only aggregates data from information admins (and, for the request list, all users) can already reach today; only the frontend decides which view to render, matching the precedent already accepted for the View/Edit Mode toggle elsewhere in this app.
