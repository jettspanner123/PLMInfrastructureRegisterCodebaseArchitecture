# Implementation Plan: Calendar Activity Backend & Admin Creation

**Branch**: `016-calendar-activity-backend` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-calendar-activity-backend/spec.md`

## Summary

A new `CalendarActivities` backend feature (controller, imperative-validation Assertion, service, EF Core entity/migration), structurally mirroring the existing Downtime Announcements feature almost field-for-field — the one existing precedent in this codebase for an admin-gated POST sitting alongside a public GET in the same controller. One public endpoint lists every activity; one admin-only endpoint (`[Authorize(Policy = "RequireAdmin")]`) creates one. The frontend gets a new create-activity modal (reusing the Environment and "Sponsor" dropdowns already shared by Uptime Request/Environment Overview/Feature Requests) and a read-only detail modal, both wired into the Yearly Calendar page built in 015. Color and the "Backdated" badge are pure frontend-derived display concerns — no new database columns for either — computed from each activity's real `createdAt`/`startAt` once fetched.

## Technical Context

**Language/Version**: C# / .NET (backend, EF Core/PostgreSQL); TypeScript 5 / React 19 (frontend) — no new language/runtime.

**Primary Dependencies**: ASP.NET Core's existing `[Authorize(Policy = "RequireAdmin")]` JWT-claim policy (already defined in `Program.cs`, already used by Downtime Announcements) — zero new auth mechanism. TanStack Query (new query/mutation hooks, same shape as `downtimeAnnouncements`'s own). Zero new npm/NuGet packages.

**Storage**: PostgreSQL via a new `IG_CalendarActivityTBL` table (EF Core migration), structurally identical in spirit to `IG_DowntimeAnnouncementTBL` — one row per activity, no soft-delete columns needed yet (this pass has no delete capability per spec FR-017).

**Testing**: No automated test framework exists in this project; verification is manual, live, via Chrome DevTools MCP, covering: admin-only button visibility, full form validation (each field), successful creation + instant appearance, the read-only detail view, the cap-at-3/"Show +X More"/expand-collapse behavior, and the backdated badge.

**Target Platform**: Web — extends the existing Yearly Calendar page (015) and the existing Orchestrator API.

**Project Type**: Web application (both frontend and backend touched).

**Performance Goals**: None beyond existing — one list fetch per page load/month-change (consistent with how this app already fetches other list-style data in full, per spec's own Assumptions), one create call per admin submission.

**Constraints**:
- Mirror Downtime Announcements' own controller/Assertion/service/Nexus/migration structure as closely as the data shape allows (per research.md §1) — this is the only existing precedent in this codebase for "admin-gated write, public read, same controller."
- Unlike Downtime Announcements' own `GetAll` (which is itself admin-only), this feature's list/"GetAll" endpoint MUST be public (no `[Authorize]`) — per spec User Story 2/3, any visitor (not just admins) can view activities and their details. The admin gate applies only to creation (spec FR-001/FR-007), matching the *other* public-read-alongside-admin-write pattern already proven in the very same Downtime Announcements controller (`GetActiveDowntimeAnnouncement`/`GetDowntimeAnnouncementsInRange` are public there too).
- Color (FR-010) and the "Backdated" badge (FR-009) are NOT persisted — no new database column for either. Color is derived purely from each activity's position in the full list once sorted by `createdAt` ascending (`paletteIndex = sortedIndex % paletteSize`, reusing the exact 3-color palette `015-yearly-calendar` already established for its sample data); "Backdated" is derived purely by comparing `startAt` against "now" on every render, exactly like the existing "Today" cell highlight already works. Storing either would be redundant derived state with no benefit, since both are trivially recomputable from data already being fetched.
- `StartAt`/`EndAt` are stored as UTC `DateTime` (via the existing `CETTimeZoneUtility.ToUtc(...)` conversion, matching both Downtime Announcements' and Uptime Requests' own existing convention) — not a new date-handling approach.
- The Environment and Responsible Person dropdowns reuse existing data sources outright (Environment Overview's own environment-name list; the existing shared "Sponsor" `ConfigurationConstants` growable list) — no new dropdown data source, no new `ConfigurationConstants` key.
- The existing frontend lane-assignment helper (`CalendarActivityLaneAssignmentHelper.ts`, built in 015 against fixed `YearMonthDay`-shaped sample data) needs adapting to work against real fetched activities (real `startAt`/`endAt` timestamps) and to support the new cap-at-3-plus-"Show +X More"-per-week-row behavior (FR-013/FR-014/FR-015) — this is a revision of 015's own helper and `YearlyCalendarScreenController.tsx`, not a new file.

**Scale/Scope**: One new backend feature folder (`Features/CalendarActivities/`: controller, Assertion, service, 2 DTOs + 1 entity/Nexus, 1 migration); one new frontend feature-service file plus new TanStack Query hooks (list query, create mutation); two new frontend modal components (create form, read-only detail view); edits to 3 existing 015 files (`YearlyCalendarCON.ts` loses its static sample array, `CalendarActivityLaneAssignmentHelper.ts` adapted for real data + the cap/expand behavior, `YearlyCalendarScreenController.tsx` wired to real data + both modals + admin gating on the "Add Activity" button). Zero new dependencies, zero new shared/cross-cutting utilities beyond what 015 and Downtime Announcements already established.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template — no project-specific principles to gate against. Vacuous pass.

## Project Structure

### Documentation (this feature)

```text
specs/016-calendar-activity-backend/
├── plan.md              # This file
├── research.md           # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
└── contracts/
    ├── create-calendar-activity.md   # POST contract
    └── list-calendar-activities.md   # GET contract
```

### Source Code (repository root)

```text
PLMInfrastructureRegisterOrchestratorServiceLayerMSC/
├── Features/CalendarActivities/                                   # NEW feature folder, mirrors DowntimeAnnouncements' own shape
│   ├── CalendarActivitiesController.cs                             # NEW — [Authorize(Policy = "RequireAdmin")] Create; public GetAll
│   ├── Assertion/CalendarActivitiesAssertion.cs                    # NEW — imperative AssertCreateRequest, same style as DowntimeAnnouncementsAssertion
│   ├── Services/CalendarActivitiesService.cs                       # NEW — Create + GetAll + MapToDTO
│   └── Models/
│       ├── CreateCalendarActivityDTO.cs                            # NEW — inbound payload
│       └── CalendarActivityDTO.cs                                  # NEW — outbound response
├── Features/CalendarActivities/Models/CalendarActivityNexus.cs      # NEW — EF Core entity
├── Factories/ApplicationRouteFactory.cs                             # EDIT: add CalendarActivitiesRoutes nested class
├── Program.cs                                                       # EDIT: register CalendarActivitiesService via AddScoped<>()
└── Migrations/                                                      # ADD: one new migration creating IG_CalendarActivityTBL

PLMInfrastructureRegisterClientServiceLayerMSC/src/
├── Features/YearlyCalendar/
│   ├── Services/CalendarActivitiesService.ts                       # NEW — plain fetch class, admin bearer-token header on create only
│   ├── Components/
│   │   ├── CalendarActivityFormModalController.tsx                 # NEW — create form, mirrors DowntimeAnnouncementFormModalController's shape
│   │   └── CalendarActivityDetailModalController.tsx               # NEW — read-only detail view (User Story 2)
│   ├── Constants/YearlyCalendarCON.ts                               # EDIT: remove the static CALENDAR_ACTIVITY_SAMPLES array (real data replaces it); keep MONTH_NAMES/WEEKDAY_ABBREVIATIONS
│   ├── Helpers/CalendarActivityLaneAssignmentHelper.ts              # EDIT: operate on real fetched activities; support capping at 3 lanes + an expanded-week override
│   └── YearlyCalendarScreenController.tsx                          # EDIT: fetch real activities; wire "Add Activity" (admin-gated) and activity-click to the two new modals; per-week expand/collapse state; derive color + "Backdated" per activity
└── Services/TanstackQueryClientService.ts                           # EDIT: add a new `calendarActivities` section (list query + create mutation), same shape as the existing `downtimeAnnouncements` section
```

**Structure Decision**: The backend side is a near-exact structural mirror of the existing Downtime Announcements feature (the only proven "admin-write, public-read, same controller" precedent in this codebase), scaled down to this feature's smaller scope (create + list only, no update/delete/end-early). The frontend side extends 015's own existing `Features/YearlyCalendar/` folder rather than introducing a new one, since this is additive work on the same page, not a separate feature surface.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — vacuous Constitution Check pass, no new dependencies, structure mirrors an already-proven existing pattern.
