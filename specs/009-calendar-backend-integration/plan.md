# Implementation Plan: Calendar Backend Integration

**Branch**: `009-calendar-backend-integration` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-calendar-backend-integration/spec.md`

## Summary

Wire the availability calendar (`EnvironmentUptimeRequestAvailabilityModalController.tsx`) to real backend data so it shows real existing bookings instead of an empty grid, AND actually closes the loop on creating new ones. Concretely: (1) extend the existing uptime-requests GET-all endpoint with optional `Environment`/`FromAt`/`ToAt` query filters; (2) add one genuinely new, unauthenticated downtime endpoint (`GET /Api/V1/DowntimeAnnouncements/InRange`) since today's public endpoint only returns the single currently-active announcement and the full list is admin-gated; (3) render both as event cards (downtime in red), each clickable into a new compact read-only details modal; (4) build a genuinely new right-click "Delete" affordance scoped to only the viewer's own not-yet-submitted pick (confirmed during planning: no such affordance exists today at all); (5) poll both new queries every 15 seconds while the calendar is open, for cross-tab/cross-user freshness; (6) wire the modal's already-declared-but-unused `environment`/`fromAt`/`toAt`/`onFromChange`/`onToChange` props so a picked span actually reaches the outer form's already-fully-wired submit flow, persists across modal close/reopen, and clears correctly on delete or successful submission. No schema changes, no new dependencies on either side.

## Technical Context

**Language/Version**: C# / .NET 10 (backend, `PLMInfrastructureRegisterOrchestratorServiceLayerMSC`); TypeScript 5 / React 19 (frontend, `PLMInfrastructureRegisterClientServiceLayerMSC`) — both existing, unchanged.

**Primary Dependencies**: ASP.NET Core Web API + EF Core (backend); TanStack Query, Tailwind, `lucide-react` (frontend) — all already installed; this feature adds zero new NuGet or npm packages on either side.

**Storage**: PostgreSQL via EF Core + Npgsql (corrected during implementation — not SQL Server as originally assumed in this plan). No schema changes — `IG_EnvironmentUptimeRequestTBL` and `IG_DowntimeAnnouncementTBL` (and their existing `EnvironmentUptimeRequestDTO`/`DowntimeAnnouncementDTO` response shapes) already carry every field this feature's read-only UI needs.

**Testing**: No automated test framework exists in either project (confirmed again this session). Verification is manual: `dotnet build` + direct endpoint calls for the backend; `tsc -b`/`oxlint` + live Chrome DevTools MCP walkthrough for the frontend, per this project's established practice.

**Target Platform**: Web — existing InfraGrid app (ASP.NET Core Web API backend, Vite/React frontend).

**Project Type**: Web application (frontend + backend), both already present in this monorepo; this feature touches both.

**Performance Goals**: Not a high-throughput system (small internal tool). The one new recurring load this feature introduces is a 15-second poll on two queries, only while the calendar modal is open — negligible at this app's expected scale.

**Constraints**:
- Zero new NuGet/npm dependencies (both `CODING-RULES.md` files require explicit approval for new dependencies; none are needed here).
- The extended uptime-requests endpoint MUST remain fully backward compatible — calling it with no query parameters must return the exact same unfiltered result every existing caller already depends on.
- No server-side delete logic is added by this feature at all — the spec's "delete" (FR-008/FR-009) is purely local, pre-submission UI state; the existing soft-delete (`IsDeleted`/`DeletedAt`) pattern is untouched.
- Both backend changes are read-only (`GET`) and unauthenticated, matching the existing precedent that regular calendar/form users are never logged in at all in this app (confirmed: only `RequireAdmin` exists as an auth policy — there is no "authenticated non-admin" tier to place these behind).

**Scale/Scope**: One extended backend endpoint, one new backend endpoint, two new frontend read-only modal components, one extended calendar component (new TanStack Query wiring, right-click context menu wiring, day/hour↔timestamp conversion), no new entities or tables.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (confirmed again this session, as in every prior feature) — no project-specific principles are defined to gate against. Vacuous pass. The binding architectural rules for this feature instead come from each project's own `CODING-RULES.md` (frontend and backend), which are followed throughout this plan and `research.md`.

## Project Structure

### Documentation (this feature)

```text
specs/009-calendar-backend-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/            # Phase 1 output
│   └── calendar-backend-endpoints.md
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by /speckit-plan)
```

### Source Code (repository root)

```text
# Option 2: Web application (frontend + backend) — both already exist; this feature extends them.

PLMInfrastructureRegisterOrchestratorServiceLayerMSC/
├── Features/
│   ├── EnvironmentUptimeRequests/
│   │   ├── EnvironmentUptimeRequestsController.cs      # EXTEND: GetAll gains optional Environment/FromAt/ToAt query params
│   │   ├── Services/EnvironmentUptimeRequestsService.cs # EXTEND: filtering logic in the existing GetAll method
│   │   └── Assertion/EnvironmentUptimeRequestsAssertion.cs # EXTEND: validate the new optional params if provided
│   └── DowntimeAnnouncements/
│       ├── DowntimeAnnouncementsController.cs          # EXTEND: new GET InRange action (unauthenticated)
│       └── Services/DowntimeAnnouncementsService.cs     # EXTEND: new GetDowntimeAnnouncementsInRangeAsynchronous method
└── Factories/ApplicationRouteFactory.cs                 # EXTEND: new InRange route constant

PLMInfrastructureRegisterClientServiceLayerMSC/src/
├── Constants/TanstackQueryKeysCON.ts                     # EXTEND: two new parameterized query keys
├── Services/TanstackQueryClientService.ts                # EXTEND: two new polling query hooks
├── Features/EnvironmentUptimeRequests/
│   ├── Services/EnvironmentUptimeRequestsService.ts      # EXTEND: pass new optional filter params
│   ├── Helpers/CalendarBookingConversionHelper.ts        # NEW: shared day/hour <-> timestamp conversion (both directions)
│   └── Components/
│       ├── EnvironmentUptimeRequestAvailabilityModalController.tsx # EXTEND: real event rendering, context menu, details-modal wiring, props wiring
│       ├── EnvironmentUptimeRequestDetailModalController.tsx       # NEW: read-only uptime-request details modal
│       ├── DowntimeAnnouncementDetailModalController.tsx           # NEW: read-only downtime details modal
│       └── EnvironmentUptimeRequestFormStaticComponent.tsx         # NO CHANGE: confirmed during planning this already fully owns/submits/resets fromAt/toAt; the gap was entirely on the modal's side
└── Features/DowntimeAnnouncements/
    └── Services/DowntimeAnnouncementsService.ts           # EXTEND: new getDowntimeAnnouncementsInRange method
```

**Structure Decision**: Both halves of this feature live entirely inside the two existing feature folders they already belong to (`EnvironmentUptimeRequests`, `DowntimeAnnouncements`) — no new feature folder, no new entity, no new global component. The two new frontend modals are new files under `EnvironmentUptimeRequests/Components/` (where the existing availability modal already lives), per this project's `[Name]ModalController.tsx` convention, since both are opened FROM that calendar. The new conversion logic is a new `Helpers/` file (per this project's feature-specific-Helper convention), since it operates entirely on this feature's own day/hour calendar model.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — Constitution Check is a vacuous pass (unfilled template), and this plan introduces no new projects, no new architectural layers, and no new dependencies.
