# Feature Specification: Jira Ticket Creation for Uptime Requests

**Feature Branch**: `002-jira-ticket-creation`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "whenever a user creates an 'Uptime Request' then with that request a jira ticket will be created" — fully clarified across two rounds of questions (see Assumptions).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Requester submits an Uptime Request and it's tracked in Jira automatically (Priority: P1)

A requester fills out the existing Uptime Request form (now also providing their email) and submits it. Behind the scenes, a Jira ticket is created for this request before it's saved, and once both succeed, the requester sees their request on the page with a link to the Jira ticket.

**Why this priority**: This is the entire feature — every other story only exists to handle this one correctly.

**Independent Test**: Submit a valid Uptime Request with all fields filled in (including the new Requester Email) and confirm a Jira ticket appears under the configured Epic, with the matching ticket key shown as a link on the newly created request.

**Acceptance Scenarios**:

1. **Given** a requester has filled in Environment, Requester Name, Requester Email, From (CET), To (CET), and an optional Message, **When** they submit the form, **Then** a Jira sub-task is created under the configured parent Epic with Summary `"Uptime Request - {environment} - {requesterName}"` and a Description containing the request's generated Ticket ID, Requester Name, Requester Email, Environment, From/To in human-readable CET format, and the Message if provided.
2. **Given** the Jira ticket was created successfully, **When** the Uptime Request is saved, **Then** the request is persisted with the Jira ticket's key and URL attached, and the requester immediately sees a clickable Jira ticket link on their new request's card.
3. **Given** a requester omits the Requester Email, **When** they try to submit, **Then** the form blocks submission the same way it already does for other required fields, with a clear inline validation message.

---

### User Story 2 - A Jira outage or misconfiguration never silently loses a request (Priority: P2)

If Jira can't be reached, rejects the request, or is misconfigured, the requester's Uptime Request is not created at all — they see a clear error and know to try again later, rather than believing their request succeeded when no Jira ticket (and no tracking) actually exists.

**Why this priority**: Without this, a Jira hiccup would produce silent data loss or confusion about whether a request was actually submitted.

**Independent Test**: Temporarily break the Jira connection (bad credentials, wrong project key) and attempt to submit an otherwise-valid Uptime Request; confirm the request is not created and the requester sees a clear, generic failure message.

**Acceptance Scenarios**:

1. **Given** Jira ticket creation fails for any reason (network, auth, invalid project/issue type, rejected field), **When** the requester submits the form, **Then** no Uptime Request row is created, and the requester sees a generic message (e.g. "Couldn't create the Jira ticket for this request — please try again or contact an admin.") rather than the raw Jira error.
2. **Given** a ticket-creation failure just occurred, **When** the requester corrects nothing and simply resubmits, **Then** the system attempts ticket creation again from scratch (no retry queue, no automatic background retry).

---

### User Story 3 - Support can diagnose a failed ticket-creation attempt (Priority: P3)

When a ticket-creation attempt fails, enough detail is captured server-side that a developer or admin with database access can work out exactly what went wrong without needing to reproduce the failure live.

**Why this priority**: Valuable for operability, but the feature is still usable end-to-end (Stories 1 and 2) without it — it only affects how easily failures get diagnosed after the fact.

**Independent Test**: Trigger a ticket-creation failure (as in Story 2) and confirm a new row exists in the error log table containing the full attempted request data, the reason/response Jira gave, and a timestamp.

**Acceptance Scenarios**:

1. **Given** a ticket-creation attempt fails, **When** the failure is logged, **Then** the log entry includes the timestamp, every field that was going to be sent to Jira (Environment, Requester Name, Requester Email, From/To, Message), the constructed Summary/Description, and the specific reason Jira gave for rejecting or failing the request (status code and error body, or the connection error if Jira was unreachable).
2. **Given** this log exists only in the database, **When** anyone looks for a UI to browse these failures, **Then** there is none in this revision — it is intentionally backend-only for now.

---

### Edge Cases

- Requester Email is present but not a plausible email format → submission is blocked by the same client-side validation pattern as other required fields, before any Jira call is attempted.
- The configured parent Epic no longer exists, is archived, or the sub-task issue type is disabled on that project → treated as a ticket-creation failure per User Story 2 (blocked, logged, generic message).
- Jira's required-fields configuration for the target project/issue-type demands a field this feature doesn't send → treated as a ticket-creation failure per User Story 2.
- Two requests submitted back-to-back where Jira is flaky for one attempt but recovers for the next → each submission is independent; one failing never affects the other.
- Deleting an Uptime Request after its Jira ticket was created → the Jira ticket is left exactly as it is; this feature never deletes, updates, or comments on Jira tickets after creation (see FR-012).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Uptime Request submission form MUST include a new required "Requester Email" field, in addition to the existing Environment, Requester Name, From (CET), To (CET), and optional Message fields.
- **FR-002**: System MUST validate Requester Email is a plausible email address before attempting ticket creation, using the same inline validation pattern as the form's other required fields.
- **FR-003**: On every Uptime Request submission, system MUST attempt to create a corresponding Jira ticket (a sub-task under a pre-configured parent Epic) before persisting the Uptime Request.
- **FR-004**: The Jira ticket's Summary MUST be formatted as `"Uptime Request - {environment} - {requesterName}"`.
- **FR-005**: The Jira ticket's Description MUST include, at minimum: the Uptime Request's own generated Ticket ID, Requester Name, Requester Email, Environment, From (CET) and To (CET) each in human-readable format (not raw timestamps), and the Message if one was provided.
- **FR-006**: If Jira ticket creation succeeds, system MUST persist the Uptime Request and store the resulting Jira ticket's key and URL against it.
- **FR-007**: If Jira ticket creation fails for any reason, system MUST NOT persist the Uptime Request, MUST show the requester a generic, non-technical failure message, and MUST record full diagnostic detail about the failure (see FR-011) before returning the error.
- **FR-008**: This ticket-creation flow applies to every Uptime Request submission without exception — there is no per-environment or per-user opt-out.
- **FR-009**: Once a Jira ticket exists for a request, its key MUST be shown as a clickable link on that Uptime Request's card, opening the ticket in Jira in a new tab.
- **FR-010**: Jira connection details (base URL, account email, API token, target project key, parent Epic key, sub-task issue type) MUST be supplied to the backend exclusively via environment variables, never hardcoded, never exposed to the frontend, and never committed to source control.
- **FR-011**: Every failed ticket-creation attempt MUST be recorded in a dedicated backend error log, capturing at minimum: the timestamp, every field that was going to be sent to Jira, the constructed Summary/Description, and the specific error Jira returned (or the connection failure, if Jira was unreachable).
- **FR-012**: This feature creates each Jira ticket exactly once, at Uptime Request submission time. No later change to the Uptime Request (status transitions, admin notes, deletion) ever updates, comments on, or otherwise touches the Jira ticket again.
- **FR-013**: The ticket-creation error log is backend-only in this revision — no admin-facing page or list is required to view it.

### Key Entities

- **Uptime Request** (existing entity, extended): now also carries the requester's email, plus the created Jira ticket's key and URL once ticket creation has succeeded.
- **Ticket Creation Error Log** (new entity): one record per failed Jira ticket-creation attempt, holding the attempted request's full data, the constructed ticket content, the specific failure reason, and when it happened. Exists purely for after-the-fact diagnosis; nothing in the app reads it back at runtime.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Uptime Requests that exist in the system have a corresponding, reachable Jira ticket — there is no way for a request to exist without one, or vice versa.
- **SC-002**: 100% of submission attempts that would have failed to create a Jira ticket are rejected outright, with no Uptime Request left behind and no silent partial success.
- **SC-003**: Every failed ticket-creation attempt has a complete, usable diagnostic record afterward — none go unlogged.
- **SC-004**: A requester can reach their request's Jira ticket in a single click from the Uptime Request page, with no separate lookup needed.

## Assumptions

- Jira deployment is Cloud (`https://ac-ctis.atlassian.net`), using Basic Auth with an account email and API token.
- All Uptime Request tickets go to one fixed, pre-configured destination: the `PLM` project, as sub-tasks under the parent Epic `PLM-226`. This is not configurable per-environment or per-request in this revision.
- Whether Jira's issue-type/hierarchy configuration on this specific project actually permits a Sub-task's parent to be an Epic directly is unconfirmed as of this spec — standard Jira hierarchies normally require an intermediate Story/Task. This will be validated against the real Jira instance during implementation (via its `createmeta` endpoint); if a direct Epic parent isn't accepted, the documented fallback is linking through a standard issue type and the Epic Link field instead of a literal Sub-task — to be confirmed with the user if it comes to that.
- Jira credentials and configuration (base URL, email, API token, project key, parent Epic key, issue type) are supplied later directly as backend environment variables by the user, not recorded in this spec or any other project file.
- No retry queue or automatic background retry exists for failed ticket-creation attempts in this revision; a failed submission simply has to be resubmitted manually by the requester.
- Status transitions, admin notes, and deletion of an Uptime Request never propagate to its Jira ticket — this is a create-once integration, not a two-way sync.
- The backend already has an established pattern for reading required secrets from environment variables (`ENValidatorHelper.GetEnvKeyValue`, used today for `JWT_SIGNING_KEY` and `DATABASE_URL`) — the new Jira configuration values follow that same convention.
