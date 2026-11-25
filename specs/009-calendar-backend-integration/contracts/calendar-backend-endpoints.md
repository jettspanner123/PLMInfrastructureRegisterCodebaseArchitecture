# API Contracts: Calendar Backend Integration

Both responses use the existing `APIResponse<T>` envelope. **Corrected during implementation**: the actual wire format is camelCase, not PascalCase as originally assumed here — confirmed via `System.Text.Json`'s default naming policy (ASP.NET Core's `AddControllers()` default, not overridden by this app's `Program.cs`) and the existing `EnvironmentUptimeRequestInterfaceModel.ts`/`DowntimeAnnouncementInterfaceModel.ts`, both of which already document this exact behavior. Query parameter names are case-insensitive either way (ASP.NET model binding), shown here in the actual lowercase-first form this feature's own code uses.

## 1. Extended: `GET /Api/V1/EnvironmentUptimeRequests`

**Change**: three new optional query parameters. No change to the response DTO shape. No change to behavior when called with none of them.

### Request

```text
GET /Api/V1/EnvironmentUptimeRequests
GET /Api/V1/EnvironmentUptimeRequests?environment=Production
GET /Api/V1/EnvironmentUptimeRequests?environment=Production&fromAt=2026-11-22T00:00:00.000Z&toAt=2026-12-27T00:00:00.000Z
```

| Param | Type | Required | Behavior when present |
|---|---|---|---|
| `environment` | string | No | Exact match against the stored request's `Environment`. |
| `fromAt` | DateTime (ISO 8601, UTC) | No | Only requests whose `[FromAt, ToAt]` window overlaps `[query fromAt, query toAt]` are returned. Must be paired with `toAt` to have effect. |
| `toAt` | DateTime (ISO 8601, UTC) | No | See above. |

### Response (unchanged shape, camelCase)

```json
{
  "status": true,
  "message": "Uptime requests retrieved successfully.",
  "data": [
    {
      "id": "a1b2c3-...",
      "ticketNumber": 42,
      "ticketId": "UPTM-00042",
      "environment": "Production",
      "requesterName": "Jane Doe",
      "requesterEmail": "jane.doe@company.com",
      "fromAt": "2026-11-26T09:00:00Z",
      "toAt": "2026-11-26T11:00:00Z",
      "message": "Routine patching window.",
      "status": "Approved",
      "adminMessage": null,
      "createdAt": "2026-11-20T14:03:00Z",
      "jiraTicketKey": null,
      "jiraTicketUrl": null
    }
  ],
  "errors": []
}
```

**Backward compatibility**: a request with zero query parameters MUST return byte-for-byte the same result shape and contents it does today — confirmed live during implementation (`GET /Api/V1/EnvironmentUptimeRequests` with no params still returns every request, unfiltered).

## 2. New: `GET /Api/V1/DowntimeAnnouncements/InRange`

Unauthenticated (no `[Authorize]`), same public tier as the existing `GET /Api/V1/DowntimeAnnouncements/Active`.

### Request

```text
GET /Api/V1/DowntimeAnnouncements/InRange?fromAt=2026-11-22T00:00:00.000Z&toAt=2026-12-27T00:00:00.000Z
```

| Param | Type | Required | Behavior |
|---|---|---|---|
| `fromAt` | DateTime (ISO 8601, UTC) | Yes | Start of the range to search for overlapping downtime windows. |
| `toAt` | DateTime (ISO 8601, UTC) | Yes | End of the range. Every non-deleted downtime announcement whose `[StartAt, EndAt]` overlaps `[fromAt, toAt]` is returned — past, currently-active, and future-scheduled alike. Not filtered by environment (every environment's downtime in range is returned; the client filters by environment). |

Missing/invalid `fromAt` or `toAt` → `400 Bad Request` via `DowntimeAnnouncementsAssertion.AssertDateRangeQuery`.

### Response (existing DTO shape, unchanged, camelCase)

```json
{
  "status": true,
  "message": "Downtime announcements retrieved successfully.",
  "data": [
    {
      "id": "d9e8f7-...",
      "heading": "Scheduled network maintenance",
      "description": "Core switch firmware upgrade.",
      "startAt": "2026-12-06T22:00:00Z",
      "endAt": "2026-12-07T02:00:00Z",
      "createdAt": "2026-11-18T10:00:00Z",
      "endedEarlyAt": null,
      "environments": ["Production", "QA (Staging)"],
      "isActive": false,
      "status": "Scheduled"
    }
  ],
  "errors": []
}
```

Confirmed live during implementation: this endpoint is reachable with no `Authorization` header and returns `200` with an empty `data` array when nothing is in range.
