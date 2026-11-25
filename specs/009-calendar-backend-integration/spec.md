# Feature Specification: Calendar Backend Integration

**Feature Branch**: `009-calendar-backend-integration`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "Now, let's do some serious things, let's connect this calendar view to the backend, when booking a slot, the event card should show some real data, like the env, time, date things like that please, also in the calendar view a custom right click context menu is needed, which will only show when right click on a even card please, there should have 1 options only for now, 'delete' if a user has created a slot in the calendar view, they can just right click on the 'completed' event card and delelte it, so they can choose a new one, this should only work on the event card there is getting creatd in the current session please, by 'current session' i mean the event card of the current ticket user is createing ( because user has not created it yet, that means the uptime request has not yet in the db right? ), also on existing uptime requests, when user clicks on a already existing request, a new modal will open and there the details of the uptime request will be showing, also the downtime event card should also show please, it should be red color as we have already discussed, also make sure, if i create a new downtime, or create new uptime requests, it should instantly be visible in the calendar view please"

## Clarifications

### Session 2026-11-25

- Q: The downtime "get all" endpoint is admin-only, and the only public endpoint returns just the single announcement active right now. How should the calendar see downtime across its 5-week window? → A: Add a new endpoint, open to any authenticated user, that returns every downtime announcement overlapping a given date range — the calendar shows all scheduled downtime across the visible weeks: past, active, and future.
- Q: Which uptime-request statuses should render as a visible event card on the calendar? → A: Pending + Approved + Completed — anything not explicitly rejected or cancelled shows as booked.
- Q: Should the calendar show bookings for just the environment currently selected in the form, or for all environments at once? → A: Just the selected environment — the calendar answers "is THIS environment free at this time."
- Q: How much should the existing-request details modal contain? → A: A compact read-only summary (requester, environment, date/time range, status, message); admins who need to change status or add an admin message still use the existing full detail page.
- Q: What should "instantly visible" mean for a newly created uptime request or downtime announcement? → A: Cross-tab / cross-user live sync — the calendar also updates on its own if someone else submits a request or an admin changes a downtime while the calendar is open, not only after the viewer's own action.
- Q: Should a red downtime event card also be clickable to open a details modal, the same way an uptime request card is? → A: Yes — same interaction model (heading, description, affected environments, time window).

### Session 2026-11-25 (follow-up, during planning)

- Q: The calendar's picked date/time currently never reaches the outer "Submit Request" form at all (confirmed: the modal's `environment`/`fromAt`/`toAt`/`onFromChange`/`onToChange` props are declared but never used) — should wiring that connection be in scope for this feature? → A: Yes — add it now. Research during planning also found the outer form itself is already fully wired on its own side (state, submit payload, success-reset) and was simply waiting for the modal to call it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See what's already booked before picking a time (Priority: P1)

A user opens the availability calendar to pick a time for a new uptime request. Instead of an empty grid, they immediately see every other real, currently-relevant uptime request for that environment rendered as an event card with its actual date, time span, and a short label — so they can see at a glance which hours are already spoken for and pick an open slot with confidence.

**Why this priority**: Without this, the calendar is a blind scheduling tool — the whole reason to connect it to the backend is so people stop double-booking the same environment. This is the foundational piece every other story in this feature builds on.

**Independent Test**: With at least one existing uptime request already in the system for an environment, open the calendar for that same environment and confirm its real event card appears at the correct date/time with real details, without needing any of the other stories to be built.

**Acceptance Scenarios**:

1. **Given** an environment has one existing Approved uptime request for a specific date and time range, **When** a user opens the calendar for that same environment, **Then** an event card appears at that exact date/time showing the environment name and the time range.
2. **Given** an environment has a Rejected and a Cancelled uptime request on record, **When** the calendar opens for that environment, **Then** neither request renders as an event card (those slots appear free).
3. **Given** the calendar is scoped to "Production", **When** a different environment ("QA (Staging)") has its own existing uptime requests, **Then** none of that other environment's requests appear on this calendar.

---

### User Story 2 - See downtime windows alongside bookings (Priority: P1)

The same user, while picking a time, also needs to see any planned or already-announced downtime that covers this environment, rendered distinctly (in red) from ordinary uptime-request bookings, across the full 5-week range the calendar can scroll through — not only whatever downtime happens to be active at this exact moment.

**Why this priority**: Downtime is the other half of "is this environment actually usable at this time" — without it, a user could pick a slot that looks open but falls inside a planned outage.

**Independent Test**: With a downtime announcement scheduled for a future date within the visible range (not currently active), open the calendar for an environment it covers and confirm the red card appears at the correct future date, independent of whether uptime-request cards are wired up yet.

**Acceptance Scenarios**:

1. **Given** a downtime announcement is scheduled two weeks from now for an environment, **When** a user opens the calendar for that environment and scrolls to that week, **Then** a red event card appears across the announced time window.
2. **Given** a downtime announcement covers multiple environments, **When** the calendar is scoped to one of those environments, **Then** the downtime's red card still appears; **When** scoped to an environment not in that list, **Then** it does not appear.
3. **Given** a downtime announcement already ended in the past, **When** the user scrolls back to that past week (still within the calendar's lower bound), **Then** the red card still appears for historical context.

---

### User Story 3 - Open details for an existing booking (Priority: P2)

A user clicks on an existing, already-submitted event card (either an uptime request or a downtime announcement) to understand exactly what it is, without having to leave the calendar or guess from the card's short label alone.

**Why this priority**: Once real cards are visible (Stories 1-2), the next most valuable thing is letting people understand what they're looking at, since a short card label can't show everything.

**Independent Test**: Click an existing uptime request's card and confirm a details modal opens with its requester, environment, date/time range, status, and message; separately click a downtime card and confirm its own details modal opens with heading, description, affected environments, and time window.

**Acceptance Scenarios**:

1. **Given** an existing uptime request's event card is visible on the calendar, **When** the user clicks it, **Then** a modal opens showing its requester, environment, date/time range, status, and message, with no option to edit anything from this modal.
2. **Given** an existing downtime's red event card is visible on the calendar, **When** the user clicks it, **Then** a modal opens showing its heading, description, affected environments, and time window.
3. **Given** the details modal for an uptime request is open, **When** the user wants to change its status or add an admin message, **Then** the modal offers a way to go to the existing full detail page to do so, rather than allowing the edit inline.

---

### User Story 4 - Undo an in-progress slot pick before submitting (Priority: P2)

While building the current ticket, the user drags out a date/time span and commits it as their pick for this not-yet-submitted request. Before they click the form's final "Submit Request" button, they can right-click that one local, in-progress card and choose "Delete" to clear it and pick a different time instead — all without it ever having touched the backend, since nothing has been submitted yet.

**Why this priority**: This is a pure local convenience that makes the existing pick-a-slot flow friendlier, but it doesn't depend on any backend wiring and isn't required for the calendar to be useful — it's correctly lower priority than actually seeing real data.

**Independent Test**: Pick a date/time span in the calendar to form the in-progress card, right-click it, confirm only a "Delete" option appears, click it, and confirm the card is removed and the user can pick a new span — all before the outer form is ever submitted.

**Acceptance Scenarios**:

1. **Given** the user has just finished picking a date/time span for the current, not-yet-submitted request, **When** they right-click that card, **Then** a context menu appears with exactly one option, "Delete".
2. **Given** that context menu is open, **When** the user clicks "Delete", **Then** the in-progress card disappears and the user can pick a new span.
3. **Given** an existing, already-submitted uptime request's event card (real backend data, not the in-progress pick), **When** the user right-clicks it, **Then** no context menu appears at all — this delete action never applies to real, already-submitted data.
4. **Given** the user has right-clicked anywhere that is not an event card (an empty slot, the header, the mini-calendar), **When** they do so, **Then** no custom context menu appears (the browser's default behavior, or nothing, is unaffected).

---

### User Story 5 - Stay current without manual refresh (Priority: P3)

While a user has the calendar open, another user (or the same user in a different tab) submits a new uptime request, or an admin creates or ends a downtime announcement, for the same environment and overlapping the visible range. The open calendar picks up that change on its own, without the viewer needing to close and reopen the modal or reload the page.

**Why this priority**: This closes the loop on data correctness over time, but it's the least critical of the five stories — the calendar is still useful even if a viewer occasionally has to reopen it to see someone else's just-submitted change.

**Independent Test**: With the calendar open in one browser context, submit a new uptime request for the same environment from a second, independent browser context, and confirm the first context's calendar shows the new card within the defined freshness window without any manual action there.

**Acceptance Scenarios**:

1. **Given** a user has the calendar open, **When** a different user submits a new uptime request for the same environment and an overlapping time, **Then** the open calendar shows the new event card within the defined freshness window, with no action required from the viewer.
2. **Given** a user has the calendar open, **When** an admin creates a new downtime announcement covering that environment, **Then** the open calendar shows the new red card within the defined freshness window.
3. **Given** a user has the calendar open, **When** an admin ends a downtime announcement early, **Then** the open calendar's red card for it shortens or disappears accordingly within the defined freshness window.

---

### User Story 6 - The picked slot actually becomes the submitted ticket (Priority: P1)

A user opens the calendar, picks a date/time span, and sees it reflected immediately on the outer form (the "Select dates..." button already shows the picked range once it's set). If they close the calendar to fill in the rest of the ticket and reopen it later to double-check or change their mind, their picked span is still there. If they delete it (User Story 4), the outer form's picked range clears too, so submitting is blocked the same way it already is today when nothing has been picked. Once they successfully submit the ticket, the outer form resets as it already does, and reopening the calendar afterward shows no leftover in-progress pick — only whatever the submission actually created, rendered as a real card (User Story 1).

**Why this priority**: Without this, nothing a user picks in the calendar ever reaches the actual uptime request being created — the rest of this feature's "real data" value is one-directional (showing existing bookings) without this piece closing the loop on creating new ones correctly.

**Independent Test**: Pick a range, confirm the outer form's "Select dates..." button updates immediately; close and reopen the calendar, confirm the same range still shows; submit successfully, confirm the outer form resets and the calendar no longer shows that pick as in-progress.

**Acceptance Scenarios**:

1. **Given** the calendar is open with nothing picked yet, **When** the user completes a date/time span selection, **Then** the outer form's picked-range display updates immediately to reflect it.
2. **Given** a span has been picked and the calendar is closed, **When** the user reopens the calendar before submitting the ticket, **Then** the same picked span still renders as the in-progress card.
3. **Given** a span has been picked, **When** the user right-clicks it and chooses "Delete" (User Story 4), **Then** the outer form's picked-range display also clears, exactly as if nothing had ever been picked.
4. **Given** a span has been picked and the ticket is submitted successfully, **When** the user reopens the calendar afterward, **Then** no in-progress card remains for that submission.

---

### Edge Cases

- What happens when the user changes the environment selected in the form while the calendar is already open? The calendar is scoped to one environment per open; changing the environment in the form and reopening the calendar re-scopes it to the newly selected one.
- What happens when an in-progress (not-yet-submitted) card and a real, already-submitted card for someone else's request visually overlap? The in-progress card renders on top so the user can still see and interact with their own pick; the real card beneath it remains visible once the in-progress one is deleted or the modal is reopened.
- What happens if the backend is unreachable when the calendar opens? The calendar still opens and still allows the user to pick a slot for their own in-progress request; existing-bookings and downtime cards simply fail to load, with a visible, non-blocking notice that existing data couldn't be fetched.
- What happens to the in-progress card's "Delete" option the moment the outer form is actually submitted? Once submission succeeds, that pick is no longer local-only — the right-click delete no longer applies to it (per User Story 4's Acceptance Scenario 3), since it now exists in the backend like any other real request.
- What happens when a downtime announcement's window only partially overlaps the calendar's visible 5-week range? The red card still renders, clipped to the portion of the window that falls within the visible range.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The calendar MUST load and render existing uptime requests for the environment currently selected in the form, restricted to requests whose status is Pending, Approved, or Completed.
- **FR-002**: Each existing-uptime-request event card MUST display, at minimum, the environment name and the booked date/time range, without requiring a click to reveal them.
- **FR-003**: The calendar MUST load and render downtime announcements whose environments include the environment currently selected in the form, across the calendar's full 5-week visible range (not only the single announcement active at the moment of opening).
- **FR-004**: Downtime event cards MUST be visually distinct from uptime-request event cards by rendering in red.
- **FR-005**: Clicking an existing, already-submitted uptime-request event card MUST open a read-only details modal showing its requester, environment, date/time range, status, and message, with no inline editing controls.
- **FR-006**: That details modal MUST offer a way to navigate to the existing full detail page for status changes or admin messaging, rather than supporting those actions itself.
- **FR-007**: Clicking a downtime event card MUST open a read-only details modal showing its heading, description, affected environments, and time window.
- **FR-008**: Right-clicking the current, not-yet-submitted ticket's in-progress event card MUST show a custom context menu containing exactly one option, "Delete".
- **FR-009**: Choosing "Delete" from that context menu MUST remove the in-progress card and allow the user to pick a new date/time span, without any backend call (the pick was never submitted).
- **FR-010**: Right-clicking any other event card (an existing, already-submitted uptime request, or any downtime card) MUST NOT show that context menu or offer a delete action.
- **FR-011**: Once the current ticket's pick has been successfully submitted as a real uptime request, the calendar MUST stop treating that card as the local in-progress one (no further right-click delete applies to it).
- **FR-012**: While the calendar is open, newly created uptime requests and newly created, updated, or ended-early downtime announcements for the scoped environment MUST become visible on the open calendar without the viewer manually closing/reopening it or reloading the page, within a defined freshness window.
- **FR-013**: If existing bookings or downtime data fail to load, the calendar MUST still open and still allow the user to pick their own in-progress slot, with a visible, non-blocking indication that existing data could not be fetched.
- **FR-014**: Completing a date/time span selection in the calendar MUST immediately propagate that picked span to the outer form, the same way the outer form already reflects it once received.
- **FR-015**: Reopening the calendar after closing it, before the ticket is submitted, MUST still show the previously picked span as the in-progress card, reconstructed from whatever the outer form currently holds.
- **FR-016**: Deleting the in-progress pick (FR-009) MUST also clear the picked span on the outer form, not just remove the card locally.
- **FR-017**: After the ticket is submitted successfully and the outer form resets its picked span, the calendar MUST NOT continue showing that span as an in-progress card.

### Key Entities

- **Uptime Request Event Card**: A rendering, on the calendar grid, of one existing uptime request — carries the environment, date/time range, status, requester, and message needed for its summary card and its details modal. Distinct from the in-progress local pick, which has no backend identity until submitted.
- **Downtime Event Card**: A rendering, on the calendar grid, of one downtime announcement overlapping the visible range — carries heading, description, affected environments, and time window; rendered in red, clickable for its own details modal, and never subject to the right-click delete action.
- **In-Progress Pick**: The current ticket's own, not-yet-submitted date/time selection within this calendar session — the only event card eligible for the right-click "Delete" context menu, and the only one with no backend identity. Its state of record is the outer form's own picked-range values (User Story 6), not anything private to the calendar — the calendar always renders whatever the outer form currently holds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user opening the calendar for an environment with existing bookings sees every relevant existing uptime request and downtime announcement rendered correctly, with zero need to consult any other screen to know whether a given time is free.
- **SC-002**: Zero already-submitted uptime requests or downtime announcements can be deleted or modified from the calendar's right-click menu — only the viewer's own current, unsubmitted pick is ever deletable from it.
- **SC-003**: A newly submitted uptime request or downtime change made by one user becomes visible on another user's already-open calendar without that second user taking any manual action, within the defined freshness window.
- **SC-004**: A user can distinguish a downtime window from an ordinary booking at a glance, without reading any label, in at least 95% of cases (by color alone).
- **SC-005**: A user who picks a date/time span, closes and reopens the calendar, and submits the ticket ends up with a real uptime request created for exactly the span they picked — with zero cases of the submitted ticket silently missing the picked time.

## Assumptions

- "Current session"/"current ticket" (User Story 4) refers specifically to the one in-progress, not-yet-submitted date/time pick being built in this open calendar instance — not to any browser or login session concept, and not to any previously submitted request.
- The calendar's existing 5-week scrollable range (current week through four weeks ahead, per the 008 feature) is the only window these existing-bookings and downtime cards need to populate; nothing before the current week's start needs to load real data.
- "Instantly visible" (User Story 5) is satisfied by a short, bounded freshness window (on the order of tens of seconds) rather than requiring true push-based real-time delivery; the exact polling/refresh cadence is a planning-phase decision, not a product requirement captured here.
- The existing full uptime-request detail page remains the place where an admin changes a request's status or adds an admin message; this feature's new modal is read-only and only needs to link out to that existing page, not duplicate its editing functionality.
- A new backend capability is needed to let a non-admin viewer read downtime announcements over a date range (today's public endpoint only returns the single currently-active one, and the full list is admin-gated) — the exact shape of that capability is a planning-phase decision.
- Visual overlap between the in-progress pick and another existing card for the same slot is possible (two different people eyeing the same time) and is expected to resolve in the user's favor visually (their own pick stays on top) until they either submit or delete it.
- The outer form (the one hosting the "Select dates..." button and the rest of the ticket fields) already correctly holds, displays, submits, and resets its own picked-range state — confirmed during planning. User Story 6's work is entirely on the calendar's side: actually calling what the outer form already expects to be called.
