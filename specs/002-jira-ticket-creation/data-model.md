# Data Model: Jira Ticket Creation for Uptime Requests

## 1. `EnvironmentUptimeRequestNexus` (existing table, extended)

Table: `IG_EnvironmentUptimeRequestTBL` (unchanged name).

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `RequesterEmail` | `text` | No | **NEW**. Required at submission time (spec FR-001/FR-002); validated as a plausible email format before any Jira call is attempted. |
| `JiraTicketKey` | `text` | Yes | **NEW**. e.g. `PLM-227`. Set only after the Jira ticket is created successfully (see §4 of research.md — the row exists in the database before this value is known, so it starts `null` and is filled in by a second, immediate save). |
| `JiraTicketUrl` | `text` | Yes | **NEW**. The full browsable URL (`{JIRA_BASE_URL}/browse/{JiraTicketKey}`), set alongside `JiraTicketKey`. Stored rather than reconstructed on every read, since the base URL is config that could change later without the historical link breaking. |

All other existing columns (`Id`, `TicketNumber`, `TicketId`, `Environment`, `RequesterName`, `FromAt`, `ToAt`, `Message`, `Status`, `AdminMessage`, `CreatedAt`, `IsDeleted`, `DeletedAt`) are unchanged.

**Validation rules** (extending `EnvironmentUptimeRequestsAssertion.AssertCreateRequest`):
- `RequesterEmail` is required (same "required field" treatment as `Environment`/`RequesterName` today).
- `RequesterEmail` must match a standard email-shape pattern (new `Regex`-based check, mirroring this assertion class's own existing `HexColorPattern`-style convention used elsewhere in this codebase for format validation).

**Lifecycle note**: `JiraTicketKey`/`JiraTicketUrl` are write-once — nothing in this feature ever updates them again after the row is created (spec FR-012, create-once integration).

## 2. `JiraTicketCreationErrorNexus` (new table)

Table: `IG_TicketCreationErrorTBL`.

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | Primary key, application-generated (`Guid.NewGuid()`), same convention as every other Nexus in this codebase. |
| `CreatedAt` | `timestamp with time zone` | No | UTC, when the failed attempt occurred. |
| `AttemptedTicketId` | `text` | Yes | The Uptime Request's own `TicketId` (e.g. `UPTM-00042`), if a row had already been inserted before Jira was called (see research.md §4) — the row this referred to was then deleted, so this column is the only remaining record that number was ever attempted. |
| `Environment` | `text` | No | Copied from the attempted request. |
| `RequesterName` | `text` | No | Copied from the attempted request. |
| `RequesterEmail` | `text` | No | Copied from the attempted request. |
| `FromAt` | `timestamp with time zone` | No | Copied from the attempted request (UTC). |
| `ToAt` | `timestamp with time zone` | No | Copied from the attempted request (UTC). |
| `Message` | `text` | Yes | Copied from the attempted request. |
| `AttemptedSummary` | `text` | No | The exact Jira ticket Summary text that was about to be sent. |
| `AttemptedDescription` | `text` | No | The exact Jira ticket Description text that was about to be sent. |
| `FailureReason` | `text` | No | Human-readable explanation of what went wrong (e.g. `"Jira returned HTTP 400: field 'parent' is invalid."` or `"Could not connect to Jira: <exception message>."`). |
| `JiraStatusCode` | `int` | Yes | The HTTP status Jira itself returned, when the failure was a rejected request. `null` for connection-level failures (Jira unreachable, timeout, DNS failure), since there was no response to have a status code. |
| `JiraResponseBody` | `text` | Yes | The raw response body Jira returned, when available. `null` for connection-level failures. |

**Lifecycle note**: Insert-only — nothing ever updates or reads these rows back within the running application (spec FR-013: backend-only, no UI in this revision). Rows are expected to be queried directly against the database if and when a failure needs investigating.

**Relationships**: None — intentionally not a foreign key to `EnvironmentUptimeRequestNexus`. A failed attempt either never had a row (if Jira was called before insert — not the chosen design, see research.md §4) or had its row deleted (the chosen design), so there is nothing valid to reference by the time this error row is written. All the data needed to understand the failure is copied inline instead.

## 3. `EnvironmentUptimeRequestDTO` / `CreateEnvironmentUptimeRequestDTO` (backend DTOs)

- `CreateEnvironmentUptimeRequestDTO`: add `RequesterEmail` (`string`, required).
- `EnvironmentUptimeRequestDTO`: add `RequesterEmail` (`string`), `JiraTicketKey` (`string?`), `JiraTicketUrl` (`string?`) — mirrors the Nexus additions field-for-field, matching this DTO's existing convention.

## 4. Frontend models

- `CreateEnvironmentUptimeRequestInputInterfaceModel`: add `requesterEmail: string`.
- `EnvironmentUptimeRequestInterfaceModel`: add `requesterEmail: string`, `jiraTicketKey: string | null`, `jiraTicketUrl: string | null`.

No new frontend entities — both existing interfaces are extended in place, field-for-field matching the backend DTOs (this codebase's existing convention, confirmed by the comment already on `EnvironmentUptimeRequestInterfaceModel`: *"Mirrors the backend's EnvironmentUptimeRequestDTO field-for-field"*).
