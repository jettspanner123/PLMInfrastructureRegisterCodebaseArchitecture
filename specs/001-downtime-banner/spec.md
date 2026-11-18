# Feature Specification: Downtime Banner

**Feature Branch**: `001-downtime-banner`

**Created**: 2026-11-17 (revised)

**Status**: Draft

**Input**: User description: "Let's create the downtime banner feature now, what the basic idea is that in the 'Uptime Request' page just below the Top header of the page there will be a red banner with white text inside it along with the description of the text an icon will also be showing inside the banner. That banner will be basically the downtime of environments notification basically which is going to be showing into that page. And how that downtime is going to be created is that when the user is in the admin account in the profile panel, there should be a button just below/above the settings with the name of 'create downtime [something]'. It will open a form which will have: heading, description, from time to time, and environments it's going to affect. After a downtime thing is created via the admin user, all the users will be able to see a banner."

**Note**: This replaces an earlier draft of this same feature, which had incorrectly assumed the banner would be auto-derived from existing Uptime Request approvals and shown on different pages. This version reflects the corrected model: a standalone, admin-created "Downtime Announcement" shown only on the Uptime Request page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin creates a downtime announcement (Priority: P1)

An admin user needs to warn everyone that one or more environments will be (or currently are) unavailable, without having to notify people individually.

**Why this priority**: Without the ability to create an announcement, there is nothing for anyone to see. This is the entry point for the whole feature.

**Independent Test**: Log in as an admin, open the profile panel, use the new "Create Downtime Announcement" action, fill in a heading, description, start time, end time, and at least one affected environment, and submit. Confirm the announcement is created successfully.

**Acceptance Scenarios**:

1. **Given** an admin is viewing their profile panel, **When** they open it, **Then** they see a "Create Downtime Announcement" action positioned alongside the existing admin-only actions near Settings.
2. **Given** the admin opens the Create Downtime Announcement form, **When** they fill in a heading, description, start time, end time, and select one or more affected environments, and submit, **Then** the announcement is created and no longer requires further action to become visible to users.
3. **Given** a non-admin user, **When** they open their own profile panel, **Then** no "Create Downtime Announcement" action is shown or reachable to them.

---

### User Story 2 - Any user sees the downtime banner (Priority: P1)

A user (admin or not) visiting the Uptime Request page needs to immediately know, without digging, that an environment is affected by a downtime announcement.

**Why this priority**: This is the other half of the feature's core value — the announcement only matters if people actually see it. Equal priority to User Story 1, since neither half delivers value alone.

**Independent Test**: With an active downtime announcement already created (per User Story 1), load the Uptime Request page as any user and confirm a red banner appears directly below the page's top header, showing a warning icon plus the announcement's heading and description.

**Acceptance Scenarios**:

1. **Given** a downtime announcement is currently active, **When** any user (admin or not) opens the Uptime Request page, **Then** a red banner with white text and a warning icon appears directly below the page's top header, showing that announcement's heading and description.
2. **Given** no downtime announcement is currently active, **When** a user opens the Uptime Request page, **Then** no downtime banner is shown.
3. **Given** more than one downtime announcement is active at the same time, **When** a user opens the Uptime Request page, **Then** only the single most recently created active announcement is shown.

---

### User Story 3 - Admin ends an announcement early (Priority: P2)

An admin needs to take an active announcement down before its scheduled end time, e.g. because the underlying issue was resolved sooner than expected or the announcement was created by mistake.

**Why this priority**: Automatic expiry (User Story 1/2) already covers the common case correctly; this adds control for the exception, so it's valuable but not required for the feature's core value.

**Independent Test**: With an active downtime announcement, use an admin-only "End Now" action to end it before its scheduled end time, then confirm its banner no longer appears on the Uptime Request page.

**Acceptance Scenarios**:

1. **Given** an active downtime announcement, **When** an admin uses the "End Now" action on it, **Then** it immediately stops being treated as active and its banner no longer shows.
2. **Given** a non-admin user, **When** they view the Uptime Request page, **Then** no "End Now" or similar management action is available to them.

---

### User Story 4 - Admin reviews every announcement, active and past (Priority: P3)

An admin wants to see every downtime announcement that's ever been created — the currently active one (if any) alongside everything that's expired or been ended early — without needing direct database access.

**Why this priority**: Purely a visibility/review capability; creating (User Story 1), showing (User Story 2), and ending (User Story 3) announcements all already work without it. Valuable, but the newest and most peripheral addition.

**Independent Test**: As admin, open the profile panel, confirm a "Downtime Announcement" section header with two side-by-side buttons; click "View Announcements" and confirm every announcement that exists (active and historical) appears in the resulting list.

**Acceptance Scenarios**:

1. **Given** an admin opens their profile panel, **When** they look at the Downtime Announcement section, **Then** they see a section header labeled "Downtime Announcement" containing two buttons of equal (50:50) width, side by side: "Create Announcement" and "View Announcements".
2. **Given** the admin clicks "Create Announcement", **When** it opens, **Then** it is the exact same Create Downtime Announcement form already specified in User Story 1 — unchanged.
3. **Given** the admin clicks "View Announcements", **When** it opens, **Then** a separate modal lists every downtime announcement that exists — the currently active one (if any) together with every past one (expired naturally or ended early) — each showing its status (Active / Ended Early / Expired).
4. **Given** no downtime announcement has ever been created, **When** the admin opens "View Announcements", **Then** the modal shows an empty state rather than an error.
5. **Given** the admin is viewing the list, **When** they edit an entry (any status) and change any of its fields, **Then** the change is saved and reflected immediately — including on the live banner, if the edited entry is the currently active one.
6. **Given** the admin is viewing the list, **When** they delete an entry, **Then** it's soft-deleted — removed from the list and, if it was the active one, its banner disappears immediately — but the record itself isn't permanently destroyed.

---

### Edge Cases

- An admin enters an end time that is earlier than or equal to the start time — the system MUST reject the submission rather than create an invalid announcement.
- An admin creates an announcement without selecting any environment — the system MUST reject the submission; at least one environment is required.
- Two or more downtime announcements are active at the same time — only the single most recently created one is shown (see User Story 2, Scenario 3); when that one expires or is ended early, whichever remaining announcement is now the most recently created active one is shown instead.
- An admin submits an announcement whose start time is in the future — per this feature's model, the announcement becomes part of what's shown as soon as it's created (see Assumptions), so this is expected, not an error.
- An admin uses "End Now" on an announcement that has already expired on its own — this MUST have no effect (it's already inactive), not produce an error.
- No downtime announcement has ever been created — "View Announcements" MUST show an empty state, not an error (see User Story 4, Scenario 4).
- An admin edits the currently active announcement's start/end time or environments while it's actively shown to users — the live banner MUST reflect the edited values on its next load, same as any other change (see User Story 4, Scenario 5).
- An admin deletes the currently active announcement — its banner MUST disappear immediately, the same as using "End Now" (see User Story 4, Scenario 6); deleting a soft-deleted announcement again, or an already-deleted one, MUST have no effect, not produce an error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let an admin user create a downtime announcement consisting of a heading, a description, a start time, an end time, and one or more affected environments.
- **FR-002**: The system MUST restrict creating and ending downtime announcements to admin users; a non-admin user MUST NOT see or be able to use either action.
- **FR-003**: The "Create Downtime Announcement" action MUST be reachable from the admin's profile panel, positioned alongside the existing admin-only actions near Settings.
- **FR-004**: The system MUST validate that a downtime announcement's end time is after its start time, and that at least one environment is selected, before the announcement can be created.
- **FR-005**: The system MUST display a banner on the Uptime Request page, positioned directly below that page's top header, whenever at least one downtime announcement is currently active.
- **FR-006**: The banner MUST show a warning icon together with the active announcement's heading and description, using a red background with white text.
- **FR-007**: The banner MUST be visible to every user who can view the Uptime Request page — admin and non-admin alike — with no additional permission needed to see it.
- **FR-008**: A downtime announcement MUST automatically stop being treated as active once its end time passes, with no admin action required; an admin MUST also be able to end an announcement early (before its end time) via an "End Now" action, which immediately stops it being treated as active.
- **FR-009**: When more than one downtime announcement is active at the same time, the system MUST show only the single most recently created one; the rest remain active in the background (so FR-008 and ending behavior still apply to them) but are not shown until they become the most recently created active one.
- **FR-010**: The system MUST store each downtime announcement durably, so it survives an application restart and is not lost if the admin who created it closes their browser or ends their session.
- **FR-011**: The system MUST make a downtime announcement's data available to every user's session independently — a user MUST be able to see an active announcement's banner without the admin who created it being currently online, on the same device, or in the same browser session.
- **FR-012**: The profile panel MUST show a "Downtime Announcement" section header containing two buttons of equal width, side by side: "Create Announcement" (opens the existing Create Downtime Announcement form from FR-001/FR-003) and "View Announcements" (opens a separate list, FR-013).
- **FR-013**: "View Announcements" (and the list it opens) MUST be restricted to admin users, matching where its button sits — a non-admin MUST NOT see or reach it, same restriction as "Create Announcement".
- **FR-014**: Each entry in the "View Announcements" list MUST show its heading, description, time window, affected environments, and a status that distinguishes **Active**, **Ended Early** (an admin used "End Now" on it), and **Expired** (its end time passed on its own).
- **FR-015**: The "View Announcements" list MUST be actionable, not read-only: an admin can edit and delete any announcement directly from the list, in addition to ending the active one early (which may replace or duplicate the banner's own "End Now" action — see FR-016/FR-017 below for the open questions this raises).
- **FR-016**: Editing a downtime announcement from the list MUST be possible for any announcement regardless of its status (active, ended early, or expired) — no restriction based on status.
- **FR-017**: Deleting a downtime announcement from the list MUST be a soft delete — hidden from the list and any banner, but the row is kept, matching this codebase's existing soft-delete convention used elsewhere (e.g. `EnvironmentUptimeRequestNexus.IsDeleted`).
- **FR-018**: Editing a downtime announcement MUST allow changing all of its fields — heading, description, start time, end time, and affected environments — the same fields available when creating one.

### Key Entities

- **Downtime Announcement**: An admin-created record with a heading, a description, a start time, an end time, and one or more affected environments (stored together as one record, not split across tables), plus whether it has been ended early by an admin, and whether it has been soft-deleted. Fully editable (all fields) and soft-deletable by an admin at any time, regardless of its current status. Stored durably and shared across every user's session (not kept only in the creating admin's browser). Independent of the existing Uptime Request entity — creating or approving an Uptime Request does not create a Downtime Announcement, and vice versa.
- **Environment** *(existing entity)*: The thing a downtime announcement points at. This feature reads the existing list of environments to populate the announcement's environment selection; it does not change how environments themselves are defined or managed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can create a downtime announcement, from opening the profile panel to a successfully submitted announcement, in under 1 minute.
- **SC-002**: Every user who loads the Uptime Request page while a downtime announcement is active sees its banner on that same page load, with no extra navigation required.
- **SC-003**: Zero non-admin users are able to create, end, or even see the option to create or end, a downtime announcement.
- **SC-004**: The banner's visibility always matches whether a downtime announcement is currently active — no banner is shown when none is active, and an active announcement's banner is never missing.
- **SC-005**: An admin can end an active announcement early, and its banner stops showing immediately, with no delay or page-specific workaround needed.
- **SC-006**: A downtime announcement created by one admin is visible to every other user, on any device or browser session, without depending on that admin's own browser or session still being open.
- **SC-007**: An admin can see every downtime announcement ever created — active and historical — in one place, and correct a mistake (edit or remove it) without needing direct database access.

## Assumptions

- The banner is not dismissible by the viewer; it remains visible for as long as its downtime announcement is active, consistent with it being a persistent warning rather than a casual notification.
- A downtime announcement becomes part of what's shown as soon as it's created — there is no separate "scheduled, not yet started" state; this matches the user's own description ("after a downtime thing is created... all users will be able to see a banner").
- "Most recently created" (for choosing which single announcement to show when several are active) is based on when the announcement was created, not when its window starts or ends.
- Editing and soft-deleting an already-created downtime announcement are in scope, available to admins from "View Announcements," for any announcement regardless of status (FR-015 through FR-018). An earlier draft of this spec had called editing out of scope entirely — superseded by this revision.
- A downtime announcement can reference multiple environments at once; this is a different shape from the existing Uptime Request entity, which is tied to a single environment, and this feature does not change that existing entity.
- This feature's banner is scoped to the Uptime Request page only; it does not appear on Environment Overview, Infrastructure Register, or any other page unless a future feature extends it there.
- "View Announcements" lists every announcement ordered most-recently-created first, with no pagination — consistent with this feature's existing assumption that announcement volume stays small (a handful at a time), not thousands.

## Implementation Notes *(stakeholder-directed, binding on `/speckit-plan`)*

<!--
  A spec normally stays implementation-agnostic (see FR-010/FR-011 and SC-006
  above, which capture the actual need — durable, cross-session persistence —
  without naming a technology). The two items below are an explicit exception:
  the user gave exact technical direction and asked for it to be recorded
  here directly, rather than left for the planning phase to decide. Existing
  code confirms both are consistent with how this codebase already works:
  every persisted entity already has its own `IG_<Name>TBL` table (e.g.
  `IG_EnvironmentUptimeRequestTBL`, `IG_ResourcesTBL`, `IG_AdminAccountTBL`),
  and every feature area already has its own dedicated backend controller
  (e.g. `EnvironmentUptimeRequestsController`, `ResourcesController`) rather
  than sharing one generic controller.
-->

- The downtime announcement data MUST be persisted in its own database table named `IG_DowntimeAnnouncementTBL`.
- The backend MUST expose this feature through its own dedicated controller (and supporting service), separate from the controllers for other features (e.g. the existing Environment Uptime Requests controller), matching this codebase's existing one-controller-per-feature convention.
- All of a downtime announcement's data, including its affected environments, MUST live in that single `IG_DowntimeAnnouncementTBL` table — no separate table for the environment list. Multiple environments are stored as one comma-separated text value in a single column (e.g. `"Dev1,Dev2"`), not a native array/JSON column.
- The "Create Downtime Announcement" form MUST use a two-column layout, widened from the form's previous single-column width: the left column holds only Heading and Description; the right column holds Start, End, and the environment selector. The overall form height MUST stay the same as the current single-column version — the Description field grows to match the right column's height rather than keeping a fixed row count, so neither column ends up visibly shorter than the other.
- The profile panel's single "Create Downtime Announcement" button is replaced by a "Downtime Announcement" section header containing exactly two buttons, each exactly 50% of the section's width, side by side: "Create Announcement" (left) and "View Announcements" (right).
