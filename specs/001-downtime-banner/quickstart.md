# Quickstart: Downtime Banner

Manual validation guide — this repository has no automated test suite (see plan.md's Technical Context), so every scenario below is run by hand against a local dev instance.

## Prerequisites

- Backend running locally (`dotnet run` in `PLMInfrastructureRegisterOrchestratorServiceLayerMSC`), migrated (`dotnet ef database update`) so `IG_DowntimeAnnouncementTBL` exists with its `Environments` column (iteration 2) and `IsDeleted`/`DeletedAt` columns (iteration 3).
- Frontend running locally (`npm run dev` in `PLMInfrastructureRegisterClientServiceLayerMSC`, `localhost:4637`).
- An existing admin account (see `IG_AdminAccountTBL`) to log in with.
- `JWT_SIGNING_KEY` set in the backend's local env (already required today for admin login to work at all).

## Scenario 1 — Admin creates an announcement (User Story 1)

1. Log in as admin via the profile panel's existing "Admin Login" action.
2. Open the profile panel again; confirm a "Downtime Announcement" section header appears (stacked with "Edit History"/"Settings"), containing two equal-width, side-by-side buttons: "Create Announcement" and "View Announcements".
3. Click "Create Announcement". **Expected**: a widened, two-column form opens — Heading and Description on the left, Start/End/Affected Environments on the right, with the Description textarea stretched to roughly match the right column's height (not a short fixed box). Fill in a heading, description, a start time, an end time (after start), and select at least one environment.
4. Submit. **Expected**: form closes, no error; a direct check of `IG_DowntimeAnnouncementTBL` shows the new row, with `Environments` holding a comma-separated value (e.g. `Dev1,Dev2`) for every environment selected.
5. Log out (or open an incognito window) and confirm the entire "Downtime Announcement" section (both buttons) is not present/reachable for a non-admin.

## Scenario 2 — Any user sees the banner (User Story 2)

1. With the announcement from Scenario 1 active (`StartAt` in the past, `EndAt` in the future), load the Uptime Request page as any user (admin or not, no login required).
2. **Expected**: a red banner with white text and a warning icon appears directly below the page's header, showing the announcement's heading and description.
3. Create a second announcement with an overlapping window. **Expected**: only the most recently created one is shown (confirm by checking `CreatedAt` on both rows).
4. Let the shown announcement's `EndAt` pass (or create one already expired). **Expected**: reload the page — banner is gone (or the next-most-recent active one now shows, if a second is still active).

## Scenario 3 — Admin ends an announcement early (User Story 3)

1. As admin, with an announcement currently active and shown, use the "End Now" action (surfaced alongside the banner for an admin viewer — see contracts/downtime-announcements-api.md's `EndEarly` endpoint).
2. **Expected**: banner disappears immediately on the next check of `GET /Api/V1/DowntimeAnnouncements/Active`; `EndedEarlyAt` is now set on that row.
3. As a non-admin, confirm no "End Now" control is visible even while the banner is showing.
4. Call "End Now" again on the same (already-ended) announcement. **Expected**: `200`, no error, no change — not a `404` or `500`.

## Scenario 4 — Validation and the new admin-only enforcement

1. Try to submit the create form with no environment selected, or end time before start time. **Expected**: rejected client-side before submit, and the backend also rejects it (`400`) if called directly — confirm with a direct API call bypassing the UI.
2. Using a REST client (not the browser UI), call `POST /Api/V1/DowntimeAnnouncements` with no `Authorization` header. **Expected**: `401` — this is the actual proof that FR-002/SC-003 hold at the API level, not just in the UI. Repeat for `PUT .../EndEarly`.
3. Call `GET /Api/V1/DowntimeAnnouncements/Active` with no `Authorization` header at all. **Expected**: `200` — this endpoint is intentionally open to everyone (FR-007).

## Scenario 5 — Admin views, edits, and deletes announcements (User Story 4)

1. As admin, with at least one active announcement and at least one expired/ended-early one, click "View Announcements" in the profile panel.
2. **Expected**: a separate modal lists every announcement, most recently created first, each showing its heading, description, time window, environments, and status (**Active** / **Ended Early** / **Expired** / **Scheduled** if its start time hasn't arrived yet — research.md §9).
3. As a non-admin, confirm no "View Announcements" button (or the whole "Downtime Announcement" section) is visible.
4. With no announcements existing at all (soft-delete or end all of them first), open "View Announcements". **Expected**: an empty state, not an error.
5. Edit an announcement (any status) — change its heading and its time window. **Expected**: saves successfully; if it was the active one, the live banner reflects the new heading/description on its next load.
6. Delete the currently active announcement. **Expected**: it's removed from the list, and its banner disappears immediately (same as "End Now").
7. Using a REST client, call `GET /Api/V1/DowntimeAnnouncements`, `PUT /Api/V1/DowntimeAnnouncements/{id}`, and `DELETE /Api/V1/DowntimeAnnouncements/{id}` each with no `Authorization` header. **Expected**: `401` on all three — proof FR-013 holds at the API level, not just in the UI.
8. Call `DELETE /Api/V1/DowntimeAnnouncements/{id}` twice in a row (as admin) on the same id. **Expected**: `200` the first time, `404` the second (the query filter makes the now-soft-deleted row invisible — this is a deliberate difference from "End Now"'s no-op-not-error behavior, since delete targets a specific existing row rather than an already-inactive state).

## Reference

- Data shapes: [data-model.md](./data-model.md)
- Endpoints: [contracts/downtime-announcements-api.md](./contracts/downtime-announcements-api.md)
- Technical decisions and rationale: [research.md](./research.md)
