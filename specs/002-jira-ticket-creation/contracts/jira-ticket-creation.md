# Contracts: Jira Ticket Creation for Uptime Requests

## 1. `POST /Api/V1/EnvironmentUptimeRequests` (existing endpoint, changed behavior)

Unchanged route, unchanged verb. Request and response shapes both gain fields; the endpoint now also has a new failure mode.

### Request body — additions only

```jsonc
{
  "environment": "Production",
  "requesterName": "Jane Doe",
  "requesterEmail": "jane.doe@company.com", // NEW — required
  "fromAt": "2026-11-20T09:00",
  "toAt": "2026-11-20T17:00",
  "message": "Patching window"
}
```

- `requesterEmail` is required and must be a plausible email format. Missing or malformed → `400 Bad Request` (existing `ValidationException` path, same shape as every other field's validation failure today).

### Success response — additions only

```jsonc
{
  "status": true,
  "message": "Uptime request submitted successfully.",
  "statusCode": 201,
  "data": {
    "id": "…",
    "ticketNumber": 42,
    "ticketId": "UPTM-00042",
    "environment": "Production",
    "requesterName": "Jane Doe",
    "requesterEmail": "jane.doe@company.com",     // NEW
    "fromAt": "2026-11-20T08:00:00Z",
    "toAt": "2026-11-20T16:00:00Z",
    "message": "Patching window",
    "status": "Pending",
    "adminMessage": null,
    "createdAt": "2026-11-19T12:00:00Z",
    "jiraTicketKey": "PLM-227",                    // NEW
    "jiraTicketUrl": "https://ac-ctis.atlassian.net/browse/PLM-227" // NEW
  }
}
```

### New failure mode — Jira ticket creation failed

```jsonc
// HTTP 502 Bad Gateway
{
  "status": false,
  "message": "Couldn't create the Jira ticket for this request — please try again or contact an admin.",
  "statusCode": 502,
  "data": null
}
```

- Thrown as a new `ExternalServiceException`, caught by `EnvironmentUptimeRequestsController` alongside its existing `ValidationException`/`ConflictException` catches.
- No Uptime Request row exists after this response — any row briefly inserted during the attempt (see research.md §4) is deleted before this response is returned.
- Full diagnostic detail is written to `IG_TicketCreationErrorTBL` (not returned to the client — see data-model.md §2) before this response is returned.
- The frontend requires no new error-handling code: the existing `useCreateEnvironmentUptimeRequestMutation`'s `onError` already surfaces any thrown error's `.message` verbatim via a toast, and this message is already the exact FR-007-compliant generic text.

## 2. Outbound call: this backend → Jira Cloud REST API v3

Not an endpoint this app exposes — documented here because it's the other external interface this feature depends on, and its exact shape drives `JiraService`'s implementation.

### `POST {JIRA_BASE_URL}/rest/api/3/issue`

**Headers**:
- `Authorization: Basic base64({JIRA_EMAIL}:{JIRA_API_TOKEN})`
- `Content-Type: application/json`

**Body** (Jira's Atlassian Document Format is required for `description` on API v3 — plain strings are not accepted):

```jsonc
{
  "fields": {
    "project": { "key": "{JIRA_PROJECT_KEY}" },
    "issuetype": { "name": "{JIRA_ISSUE_TYPE}" },
    "parent": { "key": "{JIRA_PARENT_EPIC_KEY}" },
    "summary": "Uptime Request - Production - Jane Doe",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Uptime Request: UPTM-00042" }
          ]
        }
        // one paragraph per line: Requester Name, Requester Email,
        // Environment, From (CET) / To (CET) in human-readable format
        // (research.md §5), and Message if provided.
      ]
    }
  }
}
```

**Success response** (`201 Created`):

```jsonc
{
  "id": "10091",
  "key": "PLM-227",
  "self": "https://ac-ctis.atlassian.net/rest/api/3/issue/10091"
}
```

- `key` is what gets stored as `JiraTicketKey`.
- `JiraTicketUrl` is constructed as `{JIRA_BASE_URL}/browse/{key}` — Jira's own `self` field points at the REST resource, not the human-browsable page, so it is not used for the link shown to the requester.

**Failure response** (`400 Bad Request` is the most common case — invalid field, unknown project/issue type, or a `parent` Jira rejects):

```jsonc
{
  "errorMessages": [],
  "errors": {
    "parent": "The parent issue key is invalid."
  }
}
```

- `JiraService` never throws on this — it returns a result object (`JiraTicketCreationResultModel`) carrying `IsSuccess = false`, the HTTP status code, and the raw response body, letting `EnvironmentUptimeRequestsService` decide how to log and propagate the failure (research.md §7).
- A connection-level failure (DNS, timeout, Jira unreachable) is caught the same way — `IsSuccess = false`, `StatusCode = null`, `ResponseBody = null`, `FailureReason` set from the caught exception's message instead.

### Verification performed (resolved)

Confirmed against the real Jira instance (research.md §6): `issuetype.name = "Sub-task"` with `parent.key = "PLM-226"` is accepted as-is — `PLM` is a classic project whose `Sub-task` type exposes a `parent` field that accepts the Epic directly, verified by an actual `201` creation (`PLM-19276`, and end-to-end via the app as `PLM-19277`). No fallback to a standard issue type + Epic Link was needed; this contract's payload shape matches the implementation exactly.
