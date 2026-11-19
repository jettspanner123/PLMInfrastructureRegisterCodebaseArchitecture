# Research: Jira Ticket Creation for Uptime Requests

## 1. HTTP client pattern for calling Jira

**Decision**: A new `JiraService`, registered as an `IHttpClientFactory` typed client (`builder.Services.AddHttpClient<JiraService>();` in `Program.cs`), exactly mirroring how `ChatAssistantService` already calls Groq's API today.

**Rationale**: This is the only external-HTTP-call pattern already established in this backend. Reusing it means `HttpClient` lifetime is DI-managed (no socket exhaustion from manually `new HttpClient()`-ing), and any future reader of this codebase already knows the shape.

**Alternatives considered**: A third-party Jira SDK/NuGet package — rejected. The feature only needs one call shape (create a sub-task issue), so a full SDK would add a dependency for a single REST call this backend can make directly with `System.Net.Http.Json`, same as it already does elsewhere.

## 2. Authentication

**Decision**: Jira Cloud's Basic Auth scheme — an `Authorization: Basic base64(email:apiToken)` header, set once on the typed client's `HttpClient` in its constructor.

**Rationale**: Confirmed with the user: this is Jira Cloud, not Server/Data Center, so this is the correct (and only) supported auth mechanism for a Cloud REST API token.

## 3. Credential & configuration source

**Decision**: Six new environment variables, read via the existing `ENValidatorHelper.Current.GetEnvKeyValue(...)` helper (the same mechanism `JWT_SIGNING_KEY` and `DATABASE_URL` already use in `Program.cs`):

- `JIRA_BASE_URL` — e.g. `https://ac-ctis.atlassian.net`
- `JIRA_EMAIL` — the Jira account email for the API token
- `JIRA_API_TOKEN` — the Cloud API token
- `JIRA_PROJECT_KEY` — `PLM`
- `JIRA_PARENT_EPIC_KEY` — `PLM-226`
- `JIRA_ISSUE_TYPE` — the sub-task issue type name (exact value to be confirmed against the real Jira instance — see §6)

**Rationale**: Matches this backend's one and only existing convention for secrets/config — never hardcoded, never sent to the frontend, never committed to source. Six separate variables (rather than one combined connection-string-style value) because each is independently something an operator might need to rotate or change (e.g. the API token, without touching the project/epic configuration).

## 4. Where in the request lifecycle Jira gets called — the TicketId ordering problem

**Decision**: The Uptime Request row is inserted into the database **first** (so Postgres assigns the real, permanent `TicketNumber`/`TicketId` via its existing `GENERATED ALWAYS AS IDENTITY` + generated-stored-column mechanism), **then** Jira is called using that real `TicketId` in the ticket's Description. If Jira creation fails, the just-inserted row is immediately **hard-deleted** (not soft-deleted) in the same request, before the failure is logged and surfaced to the user.

**Rationale**: The spec (FR-005) requires the Jira ticket's own Description to contain the Uptime Request's generated Ticket ID (e.g. `UPTM-00042`) — but that ID is a Postgres `IDENTITY` + `GENERATED ALWAYS AS ... STORED` value that does not exist until a row is actually inserted. Calling Jira *before* any insert (the more obvious reading of "don't persist on failure") would mean the real Ticket ID simply isn't available yet to put in the ticket. Insert-then-roll-back-on-failure resolves this cleanly: from any other request's point of view, a failed attempt never leaves a visible row behind — satisfying spec FR-007's intent — while the Jira ticket still gets the real, permanent Ticket ID rather than a placeholder that would need a second Jira call to patch in later.

**Trade-off accepted**: Postgres `IDENTITY` sequences never reuse a number once consumed, even on rollback/delete — so a Jira failure "burns" that Uptime Request's ticket number permanently, which can leave small, cosmetic gaps in the visible `UPTM-00041`, `UPTM-00043` sequence if Jira fails occasionally. This is the same, completely normal behavior any auto-incrementing ID exhibits after a rolled-back transaction anywhere; it has no functional impact (gaps are never reused, never collide, never confuse anything downstream) and is not expected to be visible/concerning in practice given Jira is not expected to fail often. Flagging this explicitly rather than letting it pass silently, since the user asked that nothing be assumed without being surfaced.

**Alternatives considered**:
- *Call Jira first, insert only on success*: rejected — would require generating the Ticket ID ourselves ahead of the real Postgres `IDENTITY` assignment (e.g. a manual `nextval()` call against the backing sequence, bypassing the existing generated-column setup), adding real complexity to a currently simple, atomic insert for no behavioral benefit over the chosen approach.
- *Create the Jira ticket without the Ticket ID, then PATCH its Description afterward once known*: rejected — doubles the number of Jira API calls per submission for a cosmetic ordering concern.

## 5. Human-readable CET date formatting for the ticket Description

**Decision**: A small formatting step inside `JiraService` (not a change to the shared `CETTimeZoneUtility`): call the existing `CETTimeZoneUtility.FromUtc(...)` to get the CET wall-clock `DateTime`, then format it as `"MMM d, yyyy, h:mm tt"` (e.g. `Nov 19, 2026, 5:00 PM`) with `" CET"` appended.

**Rationale**: `CETTimeZoneUtility` is deliberately scoped to *conversion* only (UTC ⇄ CET), with no display-formatting responsibility today — matching its existing single-purpose design. The frontend's own `CETDateTimeFormatUtility` is a separate, display-only class for exactly this reason; this plan keeps the same separation of concerns on the backend rather than growing the conversion utility a new, unrelated responsibility for one caller.

## 6. Resolved: Sub-task parent as a direct Epic link

**Decision**: Issue type = `Sub-task`, `parent` = Epic `PLM-226`. Confirmed working — no fallback needed.

**Verification performed (T001/T026)**: `PLM` is a **classic (company-managed)** Jira Cloud project (`GET /rest/api/3/project/PLM` → `"style": "classic"`). `createmeta` showed every issue type in the project — including `Sub-task` — exposes the same `parent` field (`schema.system: "parent"`), consistent with Jira's modern flexible issue hierarchy. Schema inspection alone can't prove the server accepts a Sub-task→Epic parent (Jira never encodes allowed-parent-type restrictions in `createmeta`), so a real test ticket was created directly against the live instance: `POST /rest/api/3/issue` with `issuetype: {name: "Sub-task"}`, `parent: {key: "PLM-226"}` → `HTTP 201`, ticket `PLM-19276` created successfully as a child of the Epic. A second real ticket created through the full application flow (`PLM-19277`, backing Uptime Request `UPTM-00019`) confirmed the same result end-to-end, with the exact Summary/Description content from §5 and §8 rendering correctly in Jira.

**Known limitation uncovered during verification**: the Jira service account behind `JIRA_API_TOKEN` does not have delete permission in `PLM` (`DELETE /rest/api/3/issue/{key}` → `403`). Both verification tickets (`PLM-19276`, `PLM-19277`) were left in Jira, clearly marked `[TEST]`/`(TEST - safe to ignore)` in their Summary, for a project admin to delete manually. This has no bearing on the feature's own design — the app never deletes Jira tickets by design (§create-only lifecycle) — but it's worth knowing if a project admin needs to clean up test data from this feature's own future testing.

## 7. Error classification and HTTP status for Jira failures

**Decision**: A new exception type, `ExternalServiceException`, caught by `EnvironmentUptimeRequestsController` and mapped to HTTP `502 Bad Gateway`, with a fixed, generic user-facing message (per spec FR-007 / User Story 2) carried as its `.Message`.

**Rationale**: None of this backend's existing exception types (`ValidationException` → 400, `ConflictException` → 409, `NotFoundException` → 404, `TooManyAttemptsException`, `ENKeyNotFoundException`) semantically fit "an upstream/external dependency failed" — 502 is the standard HTTP status for exactly that case, and the existing frontend mutation (`useCreateEnvironmentUptimeRequestMutation`'s `onError`) already surfaces any thrown error's message verbatim via a toast — so a generic, carefully-worded exception message is sufficient on its own; no new frontend error-handling code is required at all.

## 8. Error log column shape — what "every possible data" means concretely

**Decision**: `IG_TicketCreationErrorTBL` (new `JiraTicketCreationErrorNexus`) stores, per failed attempt: a timestamp; every field that was about to be sent to Jira (`Environment`, `RequesterName`, `RequesterEmail`, `FromAt`, `ToAt`, `Message`, and the Uptime Request's own `TicketId` once known — see §4); the exact `Summary` and `Description` text that was constructed; and the failure detail itself (`FailureReason` as human text, plus the raw Jira HTTP status code and response body when the failure was a rejected request rather than a connection-level failure, both nullable since a network-level failure has neither).

**Rationale**: Directly implements spec FR-011's "every field that was going to be sent to Jira... the specific error Jira returned (or the connection failure, if unreachable)" — nothing here is inferred or summarized; it is the literal attempted payload plus the literal failure response, so a developer can diagnose a failure without reproducing it.
