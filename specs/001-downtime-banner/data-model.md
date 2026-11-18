# Data Model: Downtime Banner

Follows this codebase's existing `<Name>Nexus` (EF entity) + `<Name>DTO` convention exactly (see `EnvironmentUptimeRequestNexus`/`EnvironmentUptimeRequestDTO` as the reference).

## `DowntimeAnnouncementNexus` → `IG_DowntimeAnnouncementTBL`

| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | PK |
| `Heading` | `string` | Required, trimmed, reasonable max length (e.g. 200 chars) |
| `Description` | `string` | Required, trimmed, reasonable max length (e.g. 4000 chars, matching `EnvironmentUptimeRequestNexus.Message`'s existing cap) |
| `StartAt` | `DateTime` | Stored UTC, same convention as `EnvironmentUptimeRequestNexus.FromAt` |
| `EndAt` | `DateTime` | Stored UTC. Validated `EndAt > StartAt` (FR-004) |
| `CreatedAt` | `DateTime` | UTC, set server-side on insert. Drives "most recently created" (FR-009) |
| `EndedEarlyAt` | `DateTime?` | UTC, set by the "End Now" action (FR-008). `NULL` = not manually ended |
| `Environments` | `string` | **Revised** (was a separate join table — see below). One comma-separated value, e.g. `"Dev1,Dev2"`. Non-empty (FR-004); at least one environment name required |
| `IsDeleted` | `bool` | **New** (revision 3, FR-017). Default `false`. Soft-delete flag, same convention as `EnvironmentUptimeRequestNexus.IsDeleted` |
| `DeletedAt` | `DateTime?` | **New** (revision 3). UTC, set when soft-deleted. `NULL` = not deleted |

**"Active" is derived, not stored** (the `IsActive` field on the DTO): `StartAt <= now AND now < EndAt AND EndedEarlyAt IS NULL` (see research.md §6) — no separate `Status` *column* in the table, since all four possible states (Active/Ended Early/Expired/Scheduled — see research.md §9) are fully determined by existing columns, unlike `EnvironmentUptimeRequestNexus.Status`, which needs a real enum column because its states (Pending/Approved/Rejected) are not time-derivable. A `Status` *field* does now exist on the response DTO (see DTOs below) — computed at read time, same as `IsActive`, just more granular.

**Soft-delete** (revision 3): same convention as `EnvironmentUptimeRequestNexus.IsDeleted`/`DeletedAt` — an `entity.HasQueryFilter(announcement => !announcement.IsDeleted)` on `DowntimeAnnouncementNexus` excludes soft-deleted rows from every normal query automatically (research.md §8), so `GetActive`, the new `GetAll`, `Update`, and `EndEarly` never need to repeat `!IsDeleted` by hand, and a delete on an already-deleted or nonexistent id naturally 404s.

### Superseded: `DowntimeAnnouncementEnvironmentNexus` → `IG_DowntimeAnnouncementEnvironmentTBL`

The first implementation split environments into their own join table (one row per announcement + environment pair). The stakeholder rejected this after seeing it built — all of an announcement's data, including its environments, belongs in the single `IG_DowntimeAnnouncementTBL` row (research.md §1, revised). This table and its EF entity are removed; the migration that created it is followed by a new migration that drops it and adds the `Environments` column above.

## DTOs

- **`CreateDowntimeAnnouncementDTO`**: `Heading`, `Description`, `StartAt` (string, same `<input type="datetime-local">` shape as `CreateEnvironmentUptimeRequestDTO.FromAt`), `EndAt` (string), `Environments` (`List<string>`, non-empty) — unchanged at the API boundary; the service joins this list into the stored comma-separated string on write.
- **`UpdateDowntimeAnnouncementDTO`** (**new**, revision 3, FR-018): identical shape to `CreateDowntimeAnnouncementDTO` — `Heading`, `Description`, `StartAt`, `EndAt`, `Environments` — since every field is editable (research.md §10).
- **`DowntimeAnnouncementDTO`** (response/read shape): `Id`, `Heading`, `Description`, `StartAt`, `EndAt`, `CreatedAt`, `EndedEarlyAt`, `Environments` (`List<string>`), `IsActive` (bool, computed server-side at query time per research.md §6), `Status` (**new**, revision 3, string: `"Active"` | `"EndedEarly"` | `"Expired"` | `"Scheduled"` — computed per research.md §9) — `IsActive`/`Environments` unchanged at the API boundary from revision 2; `Status` is additive.

## Relationships

- No relationship/join table for environments anymore — `Environments` is a plain column on `DowntimeAnnouncementNexus` itself (research.md §1, revised).
- No relationship to `EnvironmentUptimeRequestNexus` — confirmed independent entities per spec Assumptions.
- `Environment` (both here and in the existing Uptime Request feature) is a plain string name, not a foreign key to a dedicated Environments table — this codebase has no such table; environment names come from `EnvironmentOverviewNexus` rows (read-only reuse, same as the existing Uptime Request form already does).

## Validation rules (→ `DowntimeAnnouncementsAssertion`, mirrors `EnvironmentUptimeRequestsAssertion`)

- `Heading`, `Description` required (non-blank after trim).
- `StartAt`, `EndAt` must parse as valid date/times; `EndAt` strictly after `StartAt` (FR-004, matches the existing `'To' must be strictly after 'From'` check).
- `Environments` must contain at least one entry (FR-004). Duplicate entries are de-duplicated (case-insensitive) before being joined into the stored comma-separated value — there's no DB-level unique index to rely on now that this lives in one column instead of a join table, so the service is the only place this is enforced.
- "End Now" (`AssertValidId` equivalent): the target `Id` must be non-empty and must resolve to an existing, not-already-ended announcement (ending an already-ended/expired one is a no-op per the spec's edge case, not an error — see contracts).
- **Update** (revision 3, FR-016/FR-018): same field validation as create (`Heading`/`Description` required, `EndAt` strictly after `StartAt`, at least one environment) — reuses `AssertCreateRequest`'s logic against the `UpdateDowntimeAnnouncementDTO` shape. No restriction based on the announcement's current status (FR-016) — any announcement, active or historical, can be edited.
- **Delete** (revision 3, FR-017): the target `Id` must be non-empty and must resolve to an existing, not-already-soft-deleted announcement; deleting a nonexistent or already-deleted id 404s (the query filter makes an already-deleted row invisible to the lookup), matching `EnvironmentUptimeRequestsService.DeleteEnvironmentUptimeRequestAsynchronous`'s exact behavior.
