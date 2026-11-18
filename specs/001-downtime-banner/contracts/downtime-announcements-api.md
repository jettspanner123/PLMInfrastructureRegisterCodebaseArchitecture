# API Contract: Downtime Announcements

Base route: `ApplicationRouteFactory.DowntimeAnnouncementsRoutes.ControllerURL = "/Api/V1/DowntimeAnnouncements"` (new, alongside `EnvironmentUptimeRequestsRoutes`). All responses wrapped in the existing `APIResponse<T>` envelope, same as every other controller in this backend.

## `POST /Api/V1/DowntimeAnnouncements`

Create a downtime announcement. **Admin only** — requires `Authorization: Bearer <admin JWT>`; see research.md §5.

**Request body** (`CreateDowntimeAnnouncementDTO`):
```json
{
  "heading": "string, required",
  "description": "string, required",
  "startAt": "YYYY-MM-DDTHH:mm, required",
  "endAt": "YYYY-MM-DDTHH:mm, required, must be after startAt",
  "environments": ["string", "..."]
}
```

**Responses**:
- `201` — `APIResponse<DowntimeAnnouncementDTO>.Succeeded(...)` — created announcement.
- `400` — validation failure (missing heading/description, invalid/out-of-order times, empty `environments`).
- `401` — missing/invalid admin token.
- `500` — unexpected error.

## `GET /Api/V1/DowntimeAnnouncements/Active`

Get the single currently-active announcement (FR-009 / research.md §6), if any. **No auth required** — every user, admin or not, can call this (FR-007).

**Responses**:
- `200` — `APIResponse<DowntimeAnnouncementDTO?>.Succeeded(...)` — the active announcement, or `null` inside the envelope if none is active. (`null`-on-success rather than `404`, since "nothing is active" is an ordinary, expected outcome, not an error — matches how this app already treats similarly expected empty states.)
- `500` — unexpected error.

## `PUT /Api/V1/DowntimeAnnouncements/{id}/EndEarly`

End an announcement before its scheduled end time (FR-008, User Story 3). **Admin only** — requires `Authorization: Bearer <admin JWT>`.

**Responses**:
- `200` — `APIResponse<DowntimeAnnouncementDTO>.Succeeded(...)` — the now-ended announcement. If it was already ended (manually or by expiry), this is a no-op that still returns `200` with its current state (edge case in spec.md: "MUST have no effect... not produce an error").
- `400` — invalid/empty `id`.
- `401` — missing/invalid admin token.
- `404` — no announcement with that `id` exists.
- `500` — unexpected error.

## `GET /Api/V1/DowntimeAnnouncements`

List every downtime announcement (active and historical), most recently created first (FR-013). **Admin only** — requires `Authorization: Bearer <admin JWT>`.

**Responses**:
- `200` — `APIResponse<List<DowntimeAnnouncementDTO>>.Succeeded(...)` — every announcement, each with its `Status` (`"Active"` | `"EndedEarly"` | `"Expired"` | `"Scheduled"` — research.md §9). An empty list (not an error) when none exist (spec edge case).
- `401` — missing/invalid admin token.
- `500` — unexpected error.

## `PUT /Api/V1/DowntimeAnnouncements/{id}`

Edit an existing announcement — all fields (FR-016/FR-018). **Admin only** — requires `Authorization: Bearer <admin JWT>`. Works regardless of the announcement's current status (active, ended early, or expired).

**Request body** (`UpdateDowntimeAnnouncementDTO`, identical shape to `CreateDowntimeAnnouncementDTO`):
```json
{
  "heading": "string, required",
  "description": "string, required",
  "startAt": "YYYY-MM-DDTHH:mm, required",
  "endAt": "YYYY-MM-DDTHH:mm, required, must be after startAt",
  "environments": ["string", "..."]
}
```

**Responses**:
- `200` — `APIResponse<DowntimeAnnouncementDTO>.Succeeded(...)` — the updated announcement.
- `400` — validation failure (same rules as create).
- `401` — missing/invalid admin token.
- `404` — no (non-deleted) announcement with that `id` exists.
- `500` — unexpected error.

## `DELETE /Api/V1/DowntimeAnnouncements/{id}`

Soft-delete an announcement (FR-017). **Admin only** — requires `Authorization: Bearer <admin JWT>`. If the deleted announcement was the currently active one, its banner disappears immediately (same effect as "End Now").

**Responses**:
- `200` — `APIResponse<bool>.Succeeded(true, ...)` — same response shape as `EnvironmentUptimeRequestsController`'s own soft-delete endpoint.
- `400` — invalid/empty `id`.
- `401` — missing/invalid admin token.
- `404` — no (non-deleted) announcement with that `id` exists — including one already soft-deleted.
- `500` — unexpected error.

## Not exposed

- No hard-delete endpoint — delete is always soft (FR-017).
