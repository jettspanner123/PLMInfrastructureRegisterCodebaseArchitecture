# Research: Downtime Banner

## 1. How to model "one or more affected environments" per announcement

**Decision (revised)**: A single comma-separated text column (`Environments`, e.g. `"Dev1,Dev2"`) on `IG_DowntimeAnnouncementTBL` itself. No separate table.

**Rationale**: The stakeholder explicitly rejected the join-table split after seeing the first implementation ("you're not storing the environment name in the same table... store the entire announcement data in a single table") — every field of one downtime announcement, including its environment list, belongs in one row of one table. Nothing in this feature ever needs to query "which announcements affect environment X" independently (the only read path is "the single most recently created active announcement," which already returns its full environment list inline), so there's no query-performance cost to paying for the simpler shape.

**Original decision (superseded)**: A separate join table `IG_DowntimeAnnouncementEnvironmentTBL` (one row per announcement + environment pair). Rejected on revision — see above. The migration that created it is dropped by a new migration; see data-model.md.

**Alternatives considered for the single-column encoding**: A native Postgres array (`text[]`) column was considered and rejected in favor of plain comma-separated text — simpler, and nothing in this feature queries by individual environment, so the array type's query/indexing advantages aren't needed.

## 2. How the frontend selects multiple environments

**Decision**: Reuse `CustomSelectSharedComponent` in its existing `multiple` mode (`values`/`onChangeMultiple` props), exactly as `ResourcesScreenController.tsx` already uses it for its column-header multi-select filters.

**Rationale**: This component already supports multi-select; no new picker component is needed. The existing single-environment picker in `EnvironmentUptimeRequestFormStaticComponent.tsx` uses the same component in single-select mode, reading environment names from `EnvironmentNameListUtility`/`environmentOverview.useEnvironmentOverviewsQuery()` — the new form reuses that same data source.

**Alternatives considered**: A bespoke checkbox-list component — rejected as unnecessary duplication of an already-existing, already-used capability.

## 3. Modal/form shell for "Create Downtime Announcement"

**Decision**: `ModalSharedComponent` (title/subtitle/footer shell), with `InputSharedComponent` for heading/description, `CustomDateTimePickerSharedComponent` for start/end time, and `CustomSelectSharedComponent` (multiple) for environments — the same composition `AdminLoginModalController.tsx` already uses for its own admin-only form, and the same date/time picker already used by `UptimeScheduleModalController.tsx`.

**Rationale**: Directly satisfies the user's explicit instruction to reuse existing forms/buttons/inputs rather than building new ones. The "End Now" action reuses `ConfirmationModalSharedComponent` (already used elsewhere for a confirm/cancel action with no form fields), matching how sign-out confirmation already works in `ProfileSettingsSharedComponent.tsx`.

**Alternatives considered**: A new bespoke modal shell — rejected, no need exists; the existing shell already supports everything this form needs.

## 4. Where the new admin button goes in the profile panel

**Decision**: Immediately above the existing "Settings" button, inside the same `isAdmin &&` conditional block that already wraps "Edit History" in `ProfileSettingsSharedComponent.tsx` — i.e. it becomes a third admin-only action stacked in that already-existing group, not a new UI area.

**Rationale**: The user asked for it "just below the settings or above the settings" and explicitly admin-only — this codebase already has exactly that pattern (an `isAdmin &&`-gated action stacked with Settings), so the new button slots into the existing group rather than inventing a new placement convention.

## 5. Real server-side admin enforcement (the user's chosen option)

**Decision**: Add `AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(...)` and `AddAuthorization(options => options.AddPolicy("RequireAdmin", policy => { policy.RequireAuthenticatedUser(); policy.RequireClaim("role", "Admin"); }))` in `Program.cs`, then `app.UseAuthentication()` before `app.UseAuthorization()` (both before `app.MapControllers()`), and `[Authorize(Policy = "RequireAdmin")]` on the controller's Create and EndEarly actions only. The frontend attaches `Authorization: Bearer <token>` (from `AdminIdentityUtility.current.getAdminToken()`) on those two calls only.

**Rationale**: `AdminService.IssueJwt` already signs tokens with `HmacSha256` using the `JWT_SIGNING_KEY` env var and a custom short `"role"` claim (not the long-form `ClaimTypes.Role` URI) — `RequireClaim("role", "Admin")` matches that claim exactly, avoiding the need to also configure `TokenValidationParameters.RoleClaimType`. The existing token carries no `iss`/`aud` claims, so validation must be configured with `ValidateIssuer = false, ValidateAudience = false, ValidateIssuerSigningKey = true, ValidateLifetime = true` and the same symmetric key — otherwise every admin token already issued and stored in a browser today would suddenly fail validation. Verified against the current official ASP.NET Core JWT-bearer sample (`MinimalJwtBearerSample`), which uses this exact `AddAuthentication().AddJwtBearer()` + policy + `RequireAuthorization("policy")` shape for Minimal-hosting APIs.

**Alternatives considered**: `[Authorize(Roles = "Admin")]` — rejected in favor of an explicit claim-based policy, since `Roles=` depends on `RoleClaimType` mapping to the token's actual claim name and a custom policy is more explicit about exactly what's being checked. Validating issuer/audience — rejected, since the existing token format has neither and changing `AdminService.IssueJwt` to add them is unnecessary scope for this feature.

**Correction found during implementation**: `RequireClaim("role", "Admin")` initially returned `403` even with a valid token, because `JwtBearerOptions` defaults to remapping short inbound claim names (like `"role"`) to their long `ClaimTypes` URI equivalent before the `ClaimsPrincipal` is built — so the policy was checking for a claim type that no longer existed under that name. Fixed by setting `options.MapInboundClaims = false` alongside the `TokenValidationParameters`. Confirmed via direct `curl` calls: no header → `401`; valid admin token → `201`/`200`.

**Second correction found during implementation**: the "End Now" `PUT` call failed in the browser with `net::ERR_FAILED` (not a server error code at all) even with a valid token — the backend's CORS policy in `Program.cs` only allowed the `Content-Type` header (`policy.WithHeaders("Content-Type")`), so the browser's own CORS preflight blocked the `Authorization` header before the request ever reached the server. Fixed by adding `"Authorization"` to that `WithHeaders(...)` call. This is this app's first fetch call to ever send that header (research.md §5a), so no prior feature had hit this.

## 5a. Frontend must start actually sending the token

**Decision**: Only the two new mutations (create, end-early) in the new `DowntimeAnnouncementsService.ts` attach the `Authorization` header; every other existing fetch call in the app is left untouched.

**Rationale**: Confirmed via search that no existing frontend code sends `Authorization: Bearer ...` anywhere today — `AdminIdentityUtility` only decodes the token locally for display purposes. This feature's two admin-only calls are the first to actually transmit it, which is the other half of making FR-002/SC-003 real (a valid token must reach the server, not just exist in storage).

## 6. "Currently active" determination and the "most recently created" tie-break

**Decision**: "Active" = `StartAt <= now AND now < EndAt AND EndedEarlyAt IS NULL`. The get-active endpoint orders by `CreatedAt DESC` and returns only the first matching row (or none), computed server-side in UTC — consistent with `EnvironmentUptimeRequestNexus.FromAt/ToAt`, which are also stored as UTC.

**Rationale**: Matches the spec's resolved clarifications (FR-008, FR-009) exactly, and keeps the "only one visible at a time" rule enforced once, server-side, rather than duplicated in frontend logic.

**Alternatives considered**: Returning all active announcements and letting the frontend pick the most recent — rejected; computing it once server-side is simpler and removes any chance of the frontend and backend disagreeing on which one should show.

## 7. Create form layout revision: single column → two columns, widened

**Decision**: `ModalSharedComponent` `maxWidth` changes from `"md"` to `"xl"`. Body becomes a `grid grid-cols-2 gap-x-6` (Tailwind), left column = Heading + Description, right column = Start, End, Affected Environments (same fields as before, just regrouped). Description's `<textarea>` drops its fixed `rows={4}` and instead gets `className="flex-1"` inside a `flex flex-col` left column, so it stretches to match the right column's natural height instead of leaving leftover space.

**Rationale**: Direct stakeholder revision after seeing the first (single-column, `md`-width) implementation — explicit 2-column split, explicit field grouping, explicit "keep the same overall height" constraint resolved via Q3 (the taller column sets the height, the other field grows to meet it) and explicit width resolved via Q2 (`xl`).

**Alternatives considered**: Keeping `rows={4}` fixed and accepting a shorter left column — rejected per Q3's answer (grow to match, so the two columns end at the same point, consistent with the "same height" instruction applying to the overall modal rather than to each field individually).

## 8. Soft-delete shape for "View Announcements"

**Decision**: Add `IsDeleted` (`bool`, default `false`) and `DeletedAt` (`DateTime?`) to `DowntimeAnnouncementNexus`, plus `entity.HasQueryFilter(announcement => !announcement.IsDeleted)` in `ApplicationDatabaseContext`.

**Rationale**: Exact match for `EnvironmentUptimeRequestNexus`'s existing soft-delete shape and its own query filter — the stakeholder explicitly asked for soft delete "matching this codebase's existing convention" (spec.md FR-017, Q5). The query filter means every existing query (`GetActive`, the new `GetAll`) automatically excludes soft-deleted rows without repeating `!IsDeleted` by hand, and a delete on an already-deleted (or nonexistent) id naturally 404s, matching `EnvironmentUptimeRequestsService.DeleteEnvironmentUptimeRequestAsynchronous`'s exact behavior.

**Alternatives considered**: Hard delete — rejected per Q5.

## 9. Computing the list's status (Active / Ended Early / Expired) — and the gap a future `StartAt` exposes

**Decision**: `Status` (string) computed server-side per row: `"EndedEarly"` if `EndedEarlyAt != null`; else `"Expired"` if `now >= EndAt`; else `"Active"` if `StartAt <= now` (i.e. the existing `IsActive` condition); else `"Scheduled"` (`now < StartAt`).

**Rationale**: The spec names exactly three statuses (FR-014, Q2: Active/Ended Early/Expired), but the data model already allows a `StartAt` in the future (an admin can create or edit one with a start time that hasn't arrived yet) — existing `GetActiveDowntimeAnnouncementAsynchronous` already correctly excludes such a row from the banner until its window starts, so the same row needs *some* label in the history list rather than silently matching none of the three named buckets. `"Scheduled"` is the only accurate description of that state and costs nothing extra to compute from data already on the row.

**Alternatives considered**: Leaving it out of the three-way enum and letting a not-yet-started row show as blank/unlabeled — rejected as strictly worse (less informative) with no corresponding simplicity gain. Not re-opening a clarification round for this — it's a narrow completion of the already-answered three-status design, not a new product decision with competing reasonable answers.

## 10. Editing: reuse the create form, or build a separate edit form?

**Decision**: Reuse `DowntimeAnnouncementFormModalController` for both create and edit, via an optional `editingAnnouncement` prop. When present, the form pre-fills from it, the title becomes "Edit Downtime Announcement", and submit calls the new update mutation instead of create.

**Rationale**: FR-018 makes every field editable — exactly the same fields the create form already has. A second, near-duplicate form component would just be the same JSX with a different submit handler; reusing it is the direct application of this app's own established pattern (one modal, one set of fields, parameterized by mode) and avoids drift between the two over time.

**Alternatives considered**: A separate `DowntimeAnnouncementEditModalController` — rejected as unnecessary duplication given the field sets are identical.

## 11. New endpoints' routes and admin gating

**Decision**: `GET /Api/V1/DowntimeAnnouncements` (list all, admin-only — new `GetAllDowntimeAnnouncement = ""` route, same empty string as `Create`, differentiated by HTTP verb, exactly like `EnvironmentUptimeRequestsRoutes.GetAllEnvironmentUptimeRequests`/`CreateEnvironmentUptimeRequest` already do), `PUT /Api/V1/DowntimeAnnouncements/{id}` (edit, admin-only — new `UpdateDowntimeAnnouncement = "{id}"` route), `DELETE /Api/V1/DowntimeAnnouncements/{id}` (soft-delete, admin-only — reuses the same `"{id}"` route string, differentiated by HTTP verb). All three carry `[Authorize(Policy = "RequireAdmin")]`, the same policy added in §5. `GetActive` stays un-gated (unchanged, FR-007).

**Rationale**: Mirrors this codebase's existing route-naming convention exactly (verb-differentiated routes sharing a literal string, as already seen in `EnvironmentUptimeRequestsRoutes`). FR-013 requires List/Edit/Delete to be admin-only, same as Create/EndEarly already are.
