# Feature Specification: Calendar Activity Backend & Admin Creation

**Feature Branch**: `016-calendar-activity-backend`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "Okay the frontend is fully settled, let's add the backend and database please, let's go, admins can only see the 'Add Activity' button, and admins can only add new activities, the activity should have a heading / title, a proper description (can be multi line so textarea), which env is this on (dropdown, the same one as in the Uptime Request page form please), which person is responsible for this (dropdown, the same one as in the uptime request page form), contact email, start time / date, end time / date, this will all be a modal which admin can enter the details, this modal will open on click of the 'Add Activity' button please, the form will have the validation and all, after activity is created, it will instantly appear in the calendar view in the 'Yearly Calendar' page please, also in each of the cell, max 3 activities can be shown, if there are more than 3 activities within an overlapping span or range, there will be a 'Show +X More' button in the cell, clicking it will expand the height of the row and the rows on which the activities are so that the user can see them clearly"

## Clarifications

### Session 2026-11-26

- Q: Should a Calendar Activity get a human-readable reference/ticket ID, like every other "request" entity in this app (e.g. `UPTM-00033`)? → A: No — skip it; nothing needs to reference an activity by a short code.
- Q: Should this pass also support editing or deleting an existing activity, or is create-only the scope? → A: Create-only for now — matches how every other pass of this feature has shipped in small, focused steps. Edit/delete are explicitly deferred to a future feature.
- Q: Can an activity's start/end date be in the past (backdated)? → A: Yes, allowed — but a backdated activity (its start date is before the current date, checked live every time it's viewed, not frozen at creation) must show a small "Backdated" badge, styled the same way the existing "Today" badge is on this page.
- Q: Should every activity use one fixed color, or vary? → A: Auto-assigned from a small fixed palette, by creation order — the first-ever-created activity gets the first color, the second gets the second, and so on, cycling through the palette; admins never choose a color.
- Q: Since this is create-only, the form captures details (full description, contact email, responsible person) the grid cell itself never shows (only the title, on a colored bar) — what happens when someone clicks an existing activity? → A: Opens a read-only detail view showing everything captured at creation (title, full description, environment, responsible person, contact email, start/end) — no editing, just viewing.
- Q: Is "instantly appears" scoped to the admin's own browser (a normal refetch-after-save), or does it also need to appear live for other people who already have the page open? → A: Just the admin's own browser — a normal refetch-after-save, the same low-cost behavior every other page in this app already uses; not a live push to other open tabs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - An admin creates a new calendar activity (Priority: P1)

A visitor with an active admin session sees an "Add Activity" button on the Yearly Calendar page (hidden from everyone else). Clicking it opens a modal where they enter a title, a description, which environment it concerns, who's responsible for it, a contact email, and a start and end date/time. Submitting the form validates every field, creates the activity, and it appears on the calendar grid immediately, without reloading the page.

**Why this priority**: This is the entire point of adding a backend to the Yearly Calendar — without it, the page is permanently stuck showing only fixed preview data.

**Independent Test**: Log in as admin, confirm the "Add Activity" button is visible, open the modal, fill in every field with valid data, submit, and confirm the new activity appears on the grid in the correct month/day span without a page reload. Log out (or use a non-admin session) and confirm the button is nowhere on the page.

**Acceptance Scenarios**:

1. **Given** an admin session, **When** the Yearly Calendar page loads, **Then** the "Add Activity" button is visible.
2. **Given** no admin session, **When** the Yearly Calendar page loads, **Then** the "Add Activity" button does not appear anywhere on the page.
3. **Given** the "Add Activity" modal is open, **When** the admin submits the form with every required field completed validly, **Then** the activity is created and immediately visible on the grid, spanning the correct start-to-end date range, with no page reload.
4. **Given** the "Add Activity" modal is open, **When** the admin submits with a missing or invalid field (e.g. an improperly formatted email, or an end date/time not strictly after the start), **Then** the form shows a clear validation message for that field and does not create the activity.
5. **Given** a non-admin session somehow attempts to submit a new activity directly (bypassing the UI), **When** that attempt reaches the system, **Then** it is rejected — admin status is enforced by the system itself, not only by hiding the button.

### User Story 2 - Anyone can view an existing activity's full details (Priority: P2)

Any visitor to the Yearly Calendar — admin or not — can click on an activity shown on the grid and see everything that was captured when it was created: its full description, environment, responsible person, contact email, and exact start/end date-time, even though the grid cell itself only ever shows the activity's title.

**Why this priority**: Without this, most of what an admin enters when creating an activity (description, contact email, responsible person) would never be visible to anyone again.

**Independent Test**: With at least one activity on the grid, click it as a non-admin visitor and confirm a read-only view opens showing every field captured at creation, with no way to edit or delete it from that view.

**Acceptance Scenarios**:

1. **Given** an activity is shown on the grid, **When** any visitor clicks it, **Then** a read-only view opens showing its title, full description, environment, responsible person, contact email, and start/end date-time.
2. **Given** that read-only view is open, **When** the visitor looks for a way to change or remove the activity, **Then** none exists — this pass offers viewing only.

### User Story 3 - More than 3 overlapping activities stay reachable without cluttering the grid (Priority: P2)

When more than 3 activities occupy the same week row (whether because their date ranges genuinely overlap or simply both touch that week), only the first 3 show by default, with a "Show +X More" control revealing the rest. Expanding one week row doesn't affect any other row's height — even when the same multi-week activity continues into an adjacent row — and the row can be collapsed back down again.

**Why this priority**: Directly follows from User Story 1 shipping real, unbounded activity creation — without a display cap, a busy week could show an unbounded, cluttered stack of overlapping bars.

**Independent Test**: Create (or arrange) more than 3 activities overlapping the same week. Confirm only 3 show plus a correctly-counted "Show +X More" control; confirm clicking it reveals every activity in that week and expands only that week's row height; confirm a different week row sharing a multi-week activity with the expanded one is unaffected; confirm the expanded row can be collapsed back.

**Acceptance Scenarios**:

1. **Given** a week row where more than 3 activities occupy the same or overlapping days, **When** the grid renders, **Then** exactly 3 activities show plus a "Show +X More" control, where X is the exact count of the remaining activities in that row.
2. **Given** that "Show +X More" control, **When** a visitor clicks it, **Then** that week row's height expands to show every activity in it, and the control changes to offer collapsing back.
3. **Given** a week row has been expanded, **When** a different week row is examined (even one sharing a multi-week activity with the expanded row), **Then** its own height is unaffected by the other row's expansion.
4. **Given** an expanded week row, **When** the visitor chooses to collapse it, **Then** it returns to showing only 3 activities plus the "Show +X More" control again.

### Edge Cases

- What happens if an activity's date range crosses a month or year boundary? It still renders correctly in every week row it touches, split across however many months' views that spans — the existing per-week display logic already generalizes to this, not just to activities fully contained in one month.
- What happens to a single-day activity (start and end on the same calendar day)? It renders as a one-day-wide bar, same as any other activity, just narrower.
- What happens if many activities are created in quick succession (e.g. by two admins at once)? Each still gets a color from the fixed palette based on its actual creation order; exact ordering between near-simultaneous submissions isn't guaranteed to the millisecond, but every activity still gets a definite, consistent color once created.
- What happens when a newly-created activity pushes a previously-fine week row over the 3-activity threshold? That row now shows the cap and a freshly-correct "Show +X More" count — it does not auto-expand on its own.
- What happens to the "Backdated" badge as time passes? It's evaluated fresh every time the page renders, not fixed at creation time — an activity that starts today shows no badge today, but will show "Backdated" from tomorrow onward.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Add Activity" button MUST be visible only to visitors with an active admin session, and MUST NOT appear anywhere on the page for anyone else.
- **FR-002**: Clicking "Add Activity" MUST open a modal with these fields: Title, Description (multi-line), Environment (dropdown), Responsible Person (dropdown), Contact Email, Start date/time, End date/time.
- **FR-003**: Title, Description, Environment, Responsible Person, Contact Email, Start, and End MUST all be required; the form MUST show a clear validation message for any missing or invalid field before allowing submission.
- **FR-004**: The End date/time MUST be validated as strictly after the Start date/time, with a clear validation message when it isn't.
- **FR-005**: The Contact Email MUST be validated as a plausible email format before the form can be submitted.
- **FR-006**: Submitting a valid form MUST create the activity and make it appear on the calendar grid in the admin's own browser immediately, without requiring a page reload.
- **FR-007**: The system MUST reject an attempt to create an activity from any session that is not an active admin session, regardless of whether that attempt went through the "Add Activity" button or not.
- **FR-008**: An activity's start and end date/time MAY be in the past; the system MUST NOT block creating a backdated activity.
- **FR-009**: Any activity whose start date is before the current date MUST display a small "Backdated" badge wherever it's shown on the grid, evaluated fresh on every render (not fixed at the moment the activity was created).
- **FR-010**: Every activity MUST be automatically assigned a color from a small fixed palette, based on its creation order (first-created activity gets the palette's first color, second gets the second, and so on, cycling), with no way for an admin to choose a color.
- **FR-011**: Clicking any activity shown on the grid (including one revealed via "Show +X More") MUST open a read-only view showing its title, full description, environment, responsible person, contact email, and start/end date-time.
- **FR-012**: The read-only view from FR-011 MUST NOT offer any way to edit or delete the activity — this pass is view-only once created.
- **FR-013**: When more than 3 activities occupy the same week row, the grid MUST show only the first 3 and a "Show +X More" control stating exactly how many more exist in that row.
- **FR-014**: Clicking "Show +X More" MUST expand only that specific week row's height to show every activity in it, without changing the height of any other week row.
- **FR-015**: An expanded week row MUST offer a way to collapse it back to showing only 3 activities plus the "Show +X More" control.
- **FR-016**: Once created, activities MUST persist and remain visible to every visitor (not just the admin who created them) across page reloads and future visits.
- **FR-017**: This pass MUST NOT include any way to edit or delete an existing activity through the application.
- **FR-018**: Activities MUST NOT be given a separate human-readable reference/ticket ID — an internal identifier is sufficient.

### Key Entities

- **Calendar Activity**: A single admin-created record representing planned, ongoing, or past work shown on the Yearly Calendar. Fields: Title, Description, Environment, Responsible Person, Contact Email, Start date/time, End date/time, an internally-assigned color (from the fixed palette, by creation order), and its own creation timestamp (used to determine color and creation order, not shown to visitors). Once created, it cannot be changed or removed in this pass.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of admin sessions see the "Add Activity" button; 100% of non-admin sessions do not, across repeated checks.
- **SC-002**: 100% of valid activity submissions result in the activity appearing on the grid in the submitting admin's own browser with no page reload.
- **SC-003**: 100% of invalid submissions (missing field, bad email format, end not after start) are blocked with a clear, field-specific message, and create nothing.
- **SC-004**: 100% of direct attempts to create an activity without an active admin session are rejected by the system itself.
- **SC-005**: 100% of activities whose start date is before the current date show the "Backdated" badge, re-verified as "today" changes.
- **SC-006**: 100% of week rows with more than 3 overlapping activities show exactly 3 plus a correctly-counted "Show +X More" control; expanding and collapsing it changes only that row's height.
- **SC-007**: 100% of activity detail views (opened by clicking any activity) show every field captured at that activity's creation.
- **SC-008**: Activities created in sequence and later found to overlap show visibly different colors from the fixed palette, consistent with their creation order, in at least 90% of naturally-occurring overlap cases (the remaining cases being the expected, acceptable palette-cycling collisions once more activities exist than palette colors).

## Assumptions

- The Environment dropdown reuses the exact same environment-name list already used by the Uptime Request form (sourced from Environment Overview's own data), per the user's own explicit instruction, not a new or separate list.
- The Responsible Person dropdown reuses the exact same growable list already shared by the Uptime Request form, Environment Overview, and Feature Requests (today called "Sponsor" in this application), per the user's own explicit instruction — not a new, activity-specific list.
- Contact Email validation mirrors the same plausible-shape (not full RFC 5322) check already used for Requester Email on the Uptime Request form.
- Title and Description have reasonable maximum lengths (exact limits are a planning-level detail, not fixed in this spec), consistent with how every other free-text field in this application is bounded.
- "Create-only" is the complete scope of this pass — editing or deleting an existing activity is explicitly deferred to a future feature, consistent with how this entire Yearly Calendar effort has shipped in deliberately small, focused increments across several prior rounds.
- Server-side admin enforcement (FR-007) follows this application's own existing admin-authorization pattern already used elsewhere for admin-gated write actions, rather than introducing a new access-control mechanism.
- The color palette (FR-010) reuses the same fixed set of colors already established by the Yearly Calendar's own preview/sample data, cycling by creation order; expanding that palette, if it ever proves too small in practice, is left for a future adjustment.
- No pagination or server-side date-range filtering is introduced for fetching activities in this pass — the full activity list is fetched and rendered per the currently-viewed month on the client, consistent with how this application already fetches its other list-style data in full.
- A visitor with no admin session can still fully use User Stories 2 and 3 (viewing activity details, expanding/collapsing overlapping rows) — only creating an activity (User Story 1) is admin-gated.
