# Tasks: Downtime Banner (Revision 3 — "View Announcements")

**Input**: Design documents from `/specs/001-downtime-banner/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/downtime-announcements-api.md, quickstart.md — all revised for this change.

**Scope note**: Supersedes the revision-2 `tasks.md` (all 10 of its tasks are already implemented and checked off). This revision covers only User Story 4 from spec.md: the "View Announcements" admin history list (list, edit, soft-delete) and the profile-panel section-header restructure. User Stories 1–3 (create, banner display, "End Now") need zero changes — confirmed by plan.md's Project Structure, which marks `DowntimeAnnouncementBannerSharedComponent.tsx`, `ApplicationRouteFactory.cs`'s existing routes, and `Program.cs` as unchanged.

**Tests**: Not requested, and this repo still has no test framework — verified manually via quickstart.md Scenario 5.

**Organization**: Everything here is **US4** — it's the only user story this revision touches.

## Path Conventions

- Backend: `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/`
- Frontend: `PLMInfrastructureRegisterClientServiceLayerMSC/`

---

## Phase 1: Setup

No new dependencies or project-structure changes needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Every US4 frontend task depends on all of these — the list/edit/delete endpoints and the `Status` field must exist first.

- [X] T001 Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/Models/DowntimeAnnouncementNexus.cs`: add `IsDeleted` (`bool`, default `false`) and `DeletedAt` (`DateTime?`) — per data-model.md, "same convention as `EnvironmentUptimeRequestNexus.IsDeleted`/`DeletedAt`".
- [X] T002 Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Data/ApplicationDatabaseContext.cs`: add `entity.HasQueryFilter(announcement => !announcement.IsDeleted);` to the existing `DowntimeAnnouncementNexus` `modelBuilder.Entity<>` block. Depends on: T001.
- [X] T003 Generate an EF Core migration (`dotnet ef migrations add AddDowntimeAnnouncementSoftDelete`) adding `IsDeleted`/`DeletedAt` to `IG_DowntimeAnnouncementTBL`; review it, then apply (`dotnet ef database update`). Depends on: T002.
- [X] T004 [P] Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/Models/DowntimeAnnouncementDTO.cs`: add `Status` (`string`). Create `UpdateDowntimeAnnouncementDTO.cs` with the identical shape to `CreateDowntimeAnnouncementDTO` (`Heading`, `Description`, `StartAt`, `EndAt`, `Environments: List<string>`) — per data-model.md, every field is editable (FR-018).
- [X] T005 [P] Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Factories/ApplicationRouteFactory.cs`'s `DowntimeAnnouncementsRoutes`: add `GetAllDowntimeAnnouncement = ""` (GET, same empty route as Create, differentiated by HTTP verb), `UpdateDowntimeAnnouncement = "{id}"` (PUT), `DeleteDowntimeAnnouncement = "{id}"` (DELETE) — per research.md §11.
- [X] T006 Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/Assertion/DowntimeAnnouncementsAssertion.cs`: add `AssertUpdateRequest(UpdateDowntimeAnnouncementDTO? request)` with the same validation rules as `AssertCreateRequest` ("Heading"/"Description" required after trim; `StartAt`/`EndAt` valid and "`EndAt` strictly after `StartAt`"; `Environments` "must contain at least one entry"). Depends on: T004.
- [X] T007 Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/Services/DowntimeAnnouncementsService.cs`:
  - `MapToDTO`: compute `Status` — `"EndedEarly"` if `EndedEarlyAt != null`; else `"Expired"` if `now >= EndAt`; else `"Active"` if `StartAt <= now`; else `"Scheduled"` (research.md §9).
  - Add `GetAllDowntimeAnnouncementsAsynchronous()`: query all (the `IsDeleted` filter excludes soft-deleted automatically), `OrderByDescending(CreatedAt)`, map each to DTO.
  - Add `UpdateDowntimeAnnouncementAsynchronous(Guid id, UpdateDowntimeAnnouncementDTO request)`: validate via T006, load by id (`NotFoundException` if missing/soft-deleted), overwrite `Heading`/`Description`/`StartAt`/`EndAt` (CET-converted, same as create)/`Environments` (re-joined from the de-duplicated list), save, return the updated DTO.
  - Add `DeleteDowntimeAnnouncementAsynchronous(Guid id)`: validate id non-empty, load by id (`NotFoundException` if missing/already soft-deleted), set `IsDeleted = true`, `DeletedAt = DateTime.UtcNow`, save, return `true`.
  Depends on: T001, T004, T006.
- [X] T008 Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/DowntimeAnnouncementsController.cs`: add `[HttpGet]` GetAll (`[Authorize(Policy = "RequireAdmin")]`, 200/401/500), `[HttpPut("{id}")]` Update (`[Authorize(Policy = "RequireAdmin")]`, 200/400/401/404/500), `[HttpDelete("{id}")]` Delete (`[Authorize(Policy = "RequireAdmin")]`, 200/400/401/404/500) — per contracts/downtime-announcements-api.md, same try/catch-per-exception-type shape as the existing actions. Depends on: T005, T007.

**Checkpoint**: Backend builds clean; all 3 new endpoints exist and are admin-gated. US4's frontend work can now begin.

---

## Phase 3: User Story 4 - Admin reviews, edits, and deletes announcements (Priority: P3)

**Goal**: A "Downtime Announcement" section header with two 50:50 buttons replaces the single button; "View Announcements" opens a list of every announcement (active + historical) that an admin can edit or soft-delete.

**Independent Test**: As admin, open the profile panel, confirm the section header + two buttons; "Create Announcement" still opens the unchanged create form; "View Announcements" opens a list showing every announcement's status, with working Edit and Delete per row — see quickstart.md Scenario 5.

- [X] T009 [P] [US4] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Models/DowntimeAnnouncementInterfaceModel.ts`: add `status: string`. Create `UpdateDowntimeAnnouncementInputInterfaceModel.ts` with the identical shape to `CreateDowntimeAnnouncementInputInterfaceModel`.
- [X] T010 [US4] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/DowntimeAnnouncements/Services/DowntimeAnnouncementsService.ts`: add `getAllDowntimeAnnouncements`, `updateDowntimeAnnouncement`, `deleteDowntimeAnnouncement` — all three attach the admin `Authorization` header (same pattern as `createDowntimeAnnouncement`/`endDowntimeAnnouncementEarly`). Depends on: T009.
- [X] T011 [US4] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Services/TanstackQueryClientService.ts`: add `useAllDowntimeAnnouncementsQuery`, `useUpdateDowntimeAnnouncementMutation`, `useDeleteDowntimeAnnouncementMutation` under the existing `downtimeAnnouncements` object — both mutations invalidate **both** `ACTIVE_DOWNTIME_ANNOUNCEMENT` and a new `ALL_DOWNTIME_ANNOUNCEMENTS` query key on success, since editing/deleting can change what the banner shows too. Add the new query key to `TanstackQueryKeysCON.ts`. Depends on: T010.
- [X] T012 [US4] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/DowntimeAnnouncements/Components/DowntimeAnnouncementFormModalController.tsx`: add an optional `editingAnnouncement?: DowntimeAnnouncementInterfaceModel` prop. When present: pre-fill all fields from it on open, change the modal title to "Edit Downtime Announcement", and submit calls `useUpdateDowntimeAnnouncementMutation` (with the announcement's `id`) instead of create — per research.md §10 (reuse, not a second form). Depends on: T011.
- [X] T013 [US4] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/DowntimeAnnouncements/Components/DowntimeAnnouncementHistoryModalController.tsx`: `ModalSharedComponent` listing every announcement from `useAllDowntimeAnnouncementsQuery`, each row showing heading, description, time window, environments, and a status badge (Active / Ended Early / Expired / Scheduled); an empty state when the list is empty; per-row "Edit" (opens `DowntimeAnnouncementFormModalController` with `editingAnnouncement` set) and "Delete" (via `ConfirmationModalSharedComponent`, matching the "End Now" confirmation pattern, then `useDeleteDowntimeAnnouncementMutation`). Depends on: T011, T012.
- [X] T014 [US4] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Shared/Components/ProfileSettingsSharedComponent.tsx`: replace the single "Create Downtime Announcement" button with a "Downtime Announcement" section header containing two buttons of equal (50:50) width, side by side — "Create Announcement" (existing `handleOpenCreateDowntimeAnnouncement`, unchanged) and "View Announcements" (new state + handler opening `DowntimeAnnouncementHistoryModalController`), both still inside the existing `isAdmin &&` block. Depends on: T013.

**Checkpoint**: All of User Story 4 functional; User Stories 1–3 remain untouched and working.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T015 [P] Run `dotnet build` (backend) and `tsc -b --force` (frontend) clean.
- [ ] T016 Walk through quickstart.md Scenario 5 end-to-end through the actual UI (view, edit, delete, empty state, the three `401` checks, and the delete-twice `200`-then-`404` check), then spot-check Scenarios 1–4 still pass unchanged.
- [ ] T017 Live-verify the section header, two buttons, and history modal in both light and dark mode (no console errors); confirm a non-admin sees neither button nor any trace of the "Downtime Announcement" section.

---

## Dependencies & Execution Order

- **Foundational (Phase 2)**: T001 → T002 → T003 (DB chain); T004, T005 can run parallel to that chain; T006 depends on T004; T007 depends on T001, T004, T006; T008 depends on T005, T007. Blocks Phase 3 entirely.
- **User Story 4 (Phase 3)**: T009 (parallel-safe) → T010 → T011 → T012 → T013 → T014, strictly sequential after that (each layers on the previous file's new exports).
- **Polish (Phase 4)**: Depends on Phase 3 complete.

### Parallel Opportunities

- T004 and T005 can run in parallel (distinct files, both only depend on nothing already done).
- T009 can run in parallel with any Phase 2 backend task (distinct project, no shared files) — though functional testing still needs Phase 2 done first.
- T015's two build commands can run in parallel.

## Implementation Strategy

Small enough for one pass: Phase 2 (backend: soft-delete column, 3 new methods, 3 new endpoints) end to end, then Phase 3 (frontend: models → service → hooks → form reuse → history modal → profile panel wiring) end to end, then Phase 4 (verify). No meaningful sub-MVP split within this revision — the history list is useless without edit/delete, and edit/delete need the list to reach them.
