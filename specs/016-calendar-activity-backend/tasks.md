---

description: "Task list for 016-calendar-activity-backend"
---

# Tasks: Calendar Activity Backend & Admin Creation

**Input**: Design documents from `/specs/016-calendar-activity-backend/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test framework exists in this project; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) plus `dotnet build` (from `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/`) to confirm a clean baseline before this feature's new files/edits.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The entire backend feature (entity, migration, validation, service, controller, routes, DI) plus the frontend data layer and real-data wiring every user story needs before it can be independently demonstrated — none of the three user stories can show anything real without this phase complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Backend

- [X] T002 [P] Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/CalendarActivities/Models/CalendarActivityNexus.cs`: EF Core entity with `Id (Guid)`, `Title (string)`, `Description (string)`, `Environment (string)`, `ResponsiblePerson (string)`, `ContactEmail (string)`, `StartAt (DateTime)`, `EndAt (DateTime)`, `CreatedAt (DateTime)` — per data-model.md's `CalendarActivity` entity table (no ticket-ID column, no `ColorIndex`/`IsBackdated` column, per research.md §1/§3).
- [X] T003 [P] Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/CalendarActivities/Models/CreateCalendarActivityDTO.cs` (inbound: `Title`, `Description`, `Environment`, `ResponsiblePerson`, `ContactEmail` as `string`, `StartAt`/`EndAt` as naive `"YYYY-MM-DDTHH:mm"` strings, no data-annotation attributes per research.md §1) and `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/CalendarActivities/Models/CalendarActivityDTO.cs` (outbound: adds `Id` and `CreatedAt` to the same fields, per `contracts/create-calendar-activity.md`).
- [X] T004 In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Data/ApplicationDatabaseContext.cs`, add `public DbSet<CalendarActivityNexus> CalendarActivities => Set<CalendarActivityNexus>();`, matching the existing `DowntimeAnnouncements`/`EnvironmentUptimeRequests` DbSet lines exactly (depends on T002).
- [X] T005 Generate an EF Core migration (`dotnet ef migrations add AddCalendarActivities`) creating table `IG_CalendarActivityTBL` with columns matching data-model.md exactly: `Id (uuid, PK)`, `Title (text)`, `Description (text)`, `Environment (text)`, `ResponsiblePerson (text)`, `ContactEmail (text)`, `StartAt (timestamp with time zone)`, `EndAt (timestamp with time zone)`, `CreatedAt (timestamp with time zone)` — hand-verify the generated `Up()`/`Down()` against `IG_DowntimeAnnouncementTBL`'s own migration shape (depends on T004).
- [X] T006 Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/CalendarActivities/Assertion/CalendarActivitiesAssertion.cs` with a singleton `.Current` and an `AssertCreateRequest(CreateCalendarActivityDTO? request)` method throwing `ValidationException`, enforcing data-model.md's exact rules: `Title` required, not whitespace-only, "Title cannot exceed 200 characters."; `Description` required, not whitespace-only, "Description cannot exceed 4000 characters."; `Environment` required, not whitespace-only; `ResponsiblePerson` required, not whitespace-only; `ContactEmail` required, not whitespace-only, matching `^[^\s@]+@[^\s@]+\.[^\s@]+$`; `StartAt`/`EndAt` must both `DateTime.TryParse` successfully; `EndAt` must be strictly after `StartAt` ("'End' must be strictly after 'Start'.") — mirroring `DowntimeAnnouncementsAssertion.AssertCreateRequest`'s own exact style (depends on T003).
- [X] T007 Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/CalendarActivities/Services/CalendarActivitiesService.cs`: `CreateCalendarActivityAsynchronous` (calls `CalendarActivitiesAssertion.Current.AssertCreateRequest`, parses `StartAt`/`EndAt` via `DateTime.Parse(..., CultureInfo.InvariantCulture, DateTimeStyles.None)`, converts to UTC via the existing `CETTimeZoneUtility.ToUtc(...)`, builds a `CalendarActivityNexus` with `Guid.NewGuid()`/`CreatedAt = DateTime.UtcNow`, persists via `_dbContext.CalendarActivities.AddAsync(...)` + `SaveChangesAsync()`) and `GetAllCalendarActivitiesAsynchronous` (returns every row, no filtering per plan.md's Constraints), plus a private `MapToDTO` — mirroring `DowntimeAnnouncementsService`'s own structure (depends on T005, T006).
- [X] T008 [P] Add a `CalendarActivitiesRoutes` nested static class to `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Factories/ApplicationRouteFactory.cs`: `ControllerURL = "/Api/V1/CalendarActivities"`, `CreateCalendarActivity = ""` (POST), `GetAllCalendarActivities = ""` (GET) — same empty-route-differentiated-by-verb pattern as `DowntimeAnnouncementsRoutes`.
- [X] T009 Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/CalendarActivities/CalendarActivitiesController.cs`: `[Authorize(Policy = "RequireAdmin")]` on the `POST` create action (per `contracts/create-calendar-activity.md`), no `[Authorize]` on the `GET` list action (per `contracts/list-calendar-activities.md` and research.md §2 — a deliberate divergence from `DowntimeAnnouncementsController`'s own admin-only `GetAll`), both wrapped in the same try/catch (`ValidationException` → 400, generic `Exception` → 500) and `APIResponse<T>.Succeeded`/`.Failed` pattern as `DowntimeAnnouncementsController` (depends on T007, T008).
- [X] T010 In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Program.cs`, add `builder.Services.AddScoped<CalendarActivitiesService>();` alongside the existing feature-service registrations (depends on T007).
- [X] T011 Apply the migration (`dotnet ef database update`) so `IG_CalendarActivityTBL` exists (depends on T005).

### Frontend data layer

- [X] T012 [P] Add a `CALENDAR_ACTIVITIES` query key to `PLMInfrastructureRegisterClientServiceLayerMSC/src/Constants/TanstackQueryKeysCON.ts`.
- [X] T013 Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Services/CalendarActivitiesService.ts`: a plain fetch class with `createCalendarActivity` (attaches `Authorization: Bearer <token>` via `AdminIdentityUtility.current.getAdminToken()`, matching `DowntimeAnnouncementsService.ts`'s own `buildAdminAuthorizationHeaders()` pattern) and `getAllCalendarActivities` (no auth header, public, per `contracts/list-calendar-activities.md`).
- [X] T014 In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Services/TanstackQueryClientService.ts`, add a new `calendarActivities` section: `useCalendarActivitiesQuery()` (public list query, `queryKey: TanstackQueryKeysCON.CALENDAR_ACTIVITIES`) and `useCreateCalendarActivityMutation(options?)` (invalidates `CALENDAR_ACTIVITIES` on success, fires a `sonner` success/error toast) — same shape as the existing `useAllDowntimeAnnouncementsQuery`/`useCreateDowntimeAnnouncementMutation` pair exactly (depends on T012, T013).

### Frontend real-data wiring

- [X] T015 In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Constants/YearlyCalendarCON.ts`, remove the static `CALENDAR_ACTIVITY_SAMPLES` array and the now-unused `CalendarActivitySample` sample-specific shape, keeping `MONTH_NAMES`/`WEEKDAY_ABBREVIATIONS` (per plan.md's Project Structure).
- [X] T016 In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Helpers/CalendarActivityLaneAssignmentHelper.ts`, change `assignLanesForWeek` to accept the real fetched activity list (real `startAt`/`endAt` values from `CalendarActivityDTO`) instead of `YearlyCalendarCON.CALENDAR_ACTIVITY_SAMPLES`, continuing to return every assigned lane unconditionally with no internal cap (research.md §6 — capping happens at the render site, not here) (depends on T015).
- [X] T017 In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/YearlyCalendarScreenController.tsx`, replace all usage of the static sample data with `TanstackQueryClientService.current.calendarActivities.useCalendarActivitiesQuery()`; sort the fetched list by `createdAt` ascending and derive each activity's display color via `sortedIndex % 3` against the existing 3-color palette (`ACTIVITY_COLOR_CLASSNAMES`); derive each activity's "Backdated" state via `activity.startAt < todayYmd` (re-evaluated on every render, per research.md §3) and render a small "Backdated" text badge on its bar, styled the same way the existing "Today" badge already is on this page (depends on T014, T016).

**Checkpoint**: Real activities (once any exist) render correctly on the grid with correct color and "Backdated" badging — nothing can be created or viewed in detail yet, and overlap is not yet capped.

---

## Phase 3: User Story 1 - An admin creates a new calendar activity (Priority: P1) 🎯 MVP

**Goal**: An admin sees "Add Activity," opens a modal, fills in every field, and on valid submission the activity is created and appears on the grid immediately; a non-admin sees no button and any direct creation attempt is rejected server-side.

**Independent Test**: Log in as admin, confirm the button appears, submit the form with valid data, and confirm the activity appears on the grid without a reload; confirm the button is absent with no admin session.

### Implementation for User Story 1

- [X] T018 [US1] In `YearlyCalendarScreenController.tsx`, wrap the existing `<PrimaryActionButtonSharedComponent label="Add Activity" />` in `{useIsAdmin() && (...)}` (research.md §7) and wire its `onClick` to a new local `isCreateModalOpen` state.
- [X] T019 [US1] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Components/CalendarActivityFormModalController.tsx`: a modal with Title (text input, required, ≤ 200 characters per data-model.md), Description (`<textarea>`, required, ≤ 4000 characters per data-model.md), Environment (`CustomSelectSharedComponent`, `searchable`, options from the same `environmentOptions` derivation the Uptime Request form uses, required), Responsible Person (`CustomSelectSharedComponent`, `searchable`, options from `useOptionsQuery('Sponsor')`, required), Contact Email (`InputSharedComponent` `type="email"`, required, validated against `^[^\s@]+@[^\s@]+\.[^\s@]+$` per data-model.md), Start and End date/time (`datetime-local` inputs, both required, End validated strictly after Start per data-model.md) — client-side validation matching every rule above exactly before calling `useCreateCalendarActivityMutation`.
- [X] T020 [US1] Wire `CalendarActivityFormModalController` into `YearlyCalendarScreenController.tsx` (`isOpen`/`onClose` from T018's state), closing the modal on a successful create (the grid updates automatically via T014's query invalidation) (depends on T018, T019).
- [X] T021 [US1] Manually verify quickstart.md Scenarios 1-4 (admin-only button visibility, full creation flow with instant appearance, every field's validation message, and server-side rejection of a non-admin create attempt) live via Chrome DevTools MCP.

**Checkpoint**: Admins can create activities end-to-end; this alone is independently shippable.

---

## Phase 4: User Story 2 - Anyone can view an existing activity's full details (Priority: P2)

**Goal**: Clicking any activity (admin or not) opens a read-only view with every field captured at creation; no edit/delete control exists anywhere in it.

**Independent Test**: With at least one activity on the grid, click it as a non-admin visitor and confirm the read-only view shows every captured field with no way to change or remove it.

### Implementation for User Story 2

- [X] T022 [US2] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Components/CalendarActivityDetailModalController.tsx`: a read-only modal showing an activity's Title, full Description, Environment, Responsible Person, Contact Email, and Start/End date-time — no edit or delete control anywhere.
- [X] T023 [US2] In `YearlyCalendarScreenController.tsx`, wire each rendered activity bar's `onClick` to open `CalendarActivityDetailModalController` with that activity's own data (a new local `selectedActivityId` state) (depends on T022).
- [X] T024 [US2] Manually verify quickstart.md Scenario 6 (clicking any activity opens the read-only view with every field, no edit/delete control) live via Chrome DevTools MCP.

**Checkpoint**: Both User Stories 1 and 2 are independently functional together.

---

## Phase 5: User Story 3 - More than 3 overlapping activities stay reachable (Priority: P2)

**Goal**: A week row with more than 3 overlapping activities shows only 3 plus a "Show +X More" control; expanding it reveals every activity in that row and only that row's height, and it can be collapsed back.

**Independent Test**: Create (or arrange) more than 3 activities overlapping one week; confirm the cap, the correct count, independent-row expansion, and collapse all work.

### Implementation for User Story 3

- [X] T025 [US3] In `YearlyCalendarScreenController.tsx`, add a local `expandedWeekKeys: Set<string>` state (keyed per week, e.g. its Sunday date) and, for each week row, cap rendering to the first 3 lanes (by the existing lane-assignment order from T016) plus a "Show +X More" control (`X` = lane count − 3) whenever that week's lane count exceeds 3 and its key isn't in `expandedWeekKeys` (research.md §6 — capping lives here, not in the helper).
- [X] T026 [US3] Wire the "Show +X More" / "Show less" control's click handler to toggle that week's own key in `expandedWeekKeys`, so expanding/collapsing affects only that one week row's height, never any other row's (FR-014) (depends on T025).
- [X] T027 [US3] Manually verify quickstart.md Scenario 7 (cap at 3, correct +X count, expanding reveals every activity in just that row, a different row sharing a multi-week activity stays unaffected, collapsing works) live via Chrome DevTools MCP.

**Checkpoint**: All three user stories are independently functional and testable together.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T028 Run `npx tsc -b` and `npx oxlint` (frontend) plus `dotnet build` (backend) against the final state of every file touched by this feature, confirming no new warnings/errors.
- [X] T029 Run the complete quickstart.md walkthrough (all 8 scenarios, including Scenario 5's backdating/"Backdated" badge and Scenario 8's color-by-creation-order) live via Chrome DevTools MCP, in both light and dark mode, confirming no regression to 015's own existing browsing/navigation experience.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all three user stories.
- **User Story 1 (Phase 3)**: Depends only on Foundational.
- **User Story 2 (Phase 4)**: Depends only on Foundational — independent of User Story 1 (an activity can be clicked whether it was seeded directly in the database or created via US1's own form).
- **User Story 3 (Phase 5)**: Depends only on Foundational — independent of User Stories 1 and 2, though testing it in practice is easiest once US1 exists to create enough overlapping activities.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Foundational only.
- **User Story 2 (P2)**: Foundational only — independent of User Story 1.
- **User Story 3 (P2)**: Foundational only — independent of User Stories 1 and 2.

### Parallel Opportunities

- T002 and T003 (different new files) can run in parallel; T008 (a different file, `ApplicationRouteFactory.cs`) can run in parallel with either.
- T012 can run in parallel with the backend tasks (T002-T011) and with T013.
- Once Foundational is complete, User Stories 1, 2, and 3 can all proceed in parallel with each other, since each touches `YearlyCalendarScreenController.tsx` in a different, additive way — but tasks within each story that edit that same file (T018/T020, T023, T025/T026) must still run sequentially against each other if worked by the same person in one sitting.

---

## Parallel Example: Foundational Phase (backend entity/DTO start)

```bash
# Launch both independent new-file tasks together:
Task: "Create CalendarActivityNexus.cs entity (T002)"
Task: "Create CreateCalendarActivityDTO.cs and CalendarActivityDTO.cs (T003)"
Task: "Add CalendarActivitiesRoutes to ApplicationRouteFactory.cs (T008)"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — the full backend plus real-data wiring, in order (backend tasks are mostly sequential; a few can parallelize per above).
2. Complete Phase 3 (User Story 1) — the create flow, the single most important increment.
3. **STOP and VALIDATE**: run quickstart.md Scenarios 1-4.
4. Add Phase 4 (User Story 2) and Phase 5 (User Story 3) — each independently, in any order.
5. Complete Phase 6 (Polish): full `tsc`/`oxlint`/`dotnet build` check and the complete 8-scenario quickstart.md walkthrough.

### Notes

- No automated tests exist in this repo; live manual verification via Chrome DevTools MCP per this project's standing practice.
- Every task that edits `YearlyCalendarScreenController.tsx` (T017, T018/T020, T023, T025/T026) must run sequentially against that one file, not in parallel with each other, even though the user stories themselves are logically independent.
