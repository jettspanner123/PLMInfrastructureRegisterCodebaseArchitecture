# Contract: Create Calendar Activity

## Endpoint

`POST /Api/V1/CalendarActivities`

**Access**: Admin-only — `[Authorize(Policy = "RequireAdmin")]` (server-enforced, per spec FR-007). The client attaches `Authorization: Bearer <admin JWT>`, the same way every other admin-gated call in this application already does (`AdminIdentityUtility.current.getAdminToken()`).

## Request Body (`CreateCalendarActivityDTO`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `Title` | string | Yes | ≤ 200 characters, not whitespace-only. |
| `Description` | string | Yes | ≤ 4000 characters, not whitespace-only. |
| `Environment` | string | Yes | Not whitespace-only. From the same environment-name list the Uptime Request form uses. |
| `ResponsiblePerson` | string | Yes | Not whitespace-only. From the shared "Sponsor" growable list. |
| `ContactEmail` | string | Yes | Must match `^[^\s@]+@[^\s@]+\.[^\s@]+$` (plausible-shape only). |
| `StartAt` | string | Yes | Naive local datetime, `"YYYY-MM-DDTHH:mm"`. May be in the past (FR-008). |
| `EndAt` | string | Yes | Naive local datetime, `"YYYY-MM-DDTHH:mm"`. Must be strictly after `StartAt`. |

## Response

**Success (201 Created)** — `APIResponse<CalendarActivityDTO>.Succeeded(...)`:

| Field | Type | Notes |
|---|---|---|
| `Id` | guid | Server-generated. |
| `Title` | string | Echoed back. |
| `Description` | string | Echoed back. |
| `Environment` | string | Echoed back. |
| `ResponsiblePerson` | string | Echoed back. |
| `ContactEmail` | string | Echoed back. |
| `StartAt` | datetime (UTC, ISO 8601) | Converted from the submitted naive local string. |
| `EndAt` | datetime (UTC, ISO 8601) | Converted from the submitted naive local string. |
| `CreatedAt` | datetime (UTC, ISO 8601) | Server-set at creation; used only for client-side color/ordering derivation (not shown as a field to the user). |

**Validation failure (400 Bad Request)** — `APIResponse<CalendarActivityDTO>.Failed(message, validationErrors, 400)`, one clear message per failing rule above (e.g. "Title is required.", "'End' must be strictly after 'Start'.", "Contact email is not a valid email address.").

**Unauthorized (401/403)** — returned automatically by the `[Authorize(Policy = "RequireAdmin")]` policy when no admin session is present, per FR-007/SC-004 — no custom handling needed beyond the existing policy.

**Unexpected error (500 Internal Server Error)** — generic failure message, logged server-side, matching every other feature's own catch-all.
