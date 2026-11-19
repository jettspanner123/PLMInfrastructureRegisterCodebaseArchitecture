# Quickstart: Jira Ticket Creation for Uptime Requests

## Prerequisites

- Backend environment variables set (see research.md §3 for what each means):
  `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`, `JIRA_PARENT_EPIC_KEY`, `JIRA_ISSUE_TYPE`.
- EF Core migrations applied (`dotnet ef database update`) — adds `RequesterEmail`/`JiraTicketKey`/`JiraTicketUrl` to the Uptime Request table and creates `IG_TicketCreationErrorTBL`.
- Both dev servers running (backend `:8294`, frontend `:4637`).
- A real Jira Cloud instance reachable from this machine, with the configured project/Epic/issue-type actually existing (see contracts/jira-ticket-creation.md's "Pre-implementation verification required" section — confirm this against the real instance before relying on these scenarios).

## Scenario 1 — Happy path: submitting an Uptime Request creates a linked Jira ticket

1. Open the Uptime Request page, fill in Environment, Requester Name, **Requester Email** (new field), From (CET), To (CET), and an optional Message.
2. Submit.
3. **Expected**: a success toast appears; the new request shows up in the Submitted Requests list with a clickable Jira ticket badge (e.g. `PLM-227`).
4. Click the badge — it opens the real Jira ticket in a new tab.
5. In Jira, confirm: the ticket is a sub-task under the configured parent Epic, its Summary is `"Uptime Request - {environment} - {requesterName}"`, and its Description contains the request's own generated Ticket ID (e.g. `UPTM-00042`), Requester Name, Requester Email, Environment, and From/To in human-readable format (e.g. `Nov 20, 2026, 9:00 AM CET`) — not raw timestamps.
6. Confirm directly against the database: the new row in `IG_EnvironmentUptimeRequestTBL` has `JiraTicketKey`/`JiraTicketUrl` populated matching the ticket from step 4.

## Scenario 2 — Missing Requester Email is blocked client-side

1. Fill in every field except Requester Email, then try to submit.
2. **Expected**: submission is blocked with an inline validation message, the same way the existing required fields already behave — no network call is made at all.

## Scenario 3 — Malformed Requester Email is rejected

1. Fill in every field, but enter something that isn't a plausible email (e.g. `not-an-email`) for Requester Email.
2. Submit.
3. **Expected**: `400 Bad Request` from the backend (or blocked client-side first, if client-side format validation is also added) — no Uptime Request is created, no Jira call is attempted.

## Scenario 4 — Jira is unreachable or misconfigured → submission is fully blocked

1. Temporarily break the Jira configuration (e.g. set `JIRA_API_TOKEN` to an invalid value, or `JIRA_PROJECT_KEY` to a project that doesn't exist) and restart the backend.
2. Submit an otherwise fully valid Uptime Request.
3. **Expected**: a `502` response; the generic failure toast appears (*"Couldn't create the Jira ticket for this request — please try again or contact an admin."*); the Submitted Requests list does **not** gain a new entry.
4. Confirm directly against the database:
   - No new row exists in `IG_EnvironmentUptimeRequestTBL` for this attempt (even transiently — check immediately after the failed request).
   - A new row exists in `IG_TicketCreationErrorTBL` containing the full attempted request data (Environment, Requester Name, Requester Email, From/To, Message), the constructed Summary/Description text, and the actual failure detail (Jira's HTTP status + response body, or the connection error).
5. Restore the correct Jira configuration, restart the backend, and confirm Scenario 1 succeeds again.

## Scenario 5 — Create-only: later changes never touch Jira

1. Complete Scenario 1 successfully, noting the Jira ticket key.
2. As an admin, change the new Uptime Request's status (e.g. Pending → Approved), and separately, delete the request entirely.
3. **Expected**: the Jira ticket is completely unaffected by either action — no comment, no status transition, no change at all. Confirm by reloading the ticket in Jira before and after each action.
