# Implementation Plan: Uptime Request Availability Calendar

**Branch**: `005-uptime-availability-calendar` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-uptime-availability-calendar/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Replace the Uptime Request form's two "From (CET)"/"To (CET)" `CustomDateTimePickerSharedComponent` fields with a single "Select Dates" trigger button. Clicking it opens a new large (`ModalSharedComponent` `maxWidth="7xl"`) modal containing two things side by side: a read-only month calendar showing per-day markers for that environment's existing Uptime Requests (status-colored) and active/upcoming Downtime Announcements (`red-300`), and the two relocated `CustomDateTimePickerSharedComponent` controls the user actually uses to set their From/To. Purely frontend, purely additive presentation of data this app already fetches - no new backend endpoint, no new write capability, no change to submission/validation logic beyond relocating where the two existing fields live.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend only - no backend changes)

**Primary Dependencies**: No new dependency. Reuses `CustomDateTimePickerSharedComponent`, `ModalSharedComponent`, existing TanStack Query hooks (`useEnvironmentUptimeRequestsQuery`, `useAllDowntimeAnnouncementsQuery`), and this app's existing status color/icon conventions.

**Storage**: N/A - no schema or data changes; both data sources (Uptime Requests, Downtime Announcements) already exist and are already fetched elsewhere in this app (feature 003 established the exact same `useAllDowntimeAnnouncementsQuery(enabled)` pattern this feature reuses).

**Testing**: Not requested; this repo has no test framework - verified manually via quickstart.md

**Target Platform**: Web (existing React SPA)

**Project Type**: Web application (frontend-only change within `PLMInfrastructureRegisterClientServiceLayerMSC/`)

**Performance Goals**: No new goals - client-side filtering of two already-fetched lists (tens of records each, per this app's current data volume) against a single month's date range is effectively instant.

**Constraints**: Markers must be simple per-day indicators, never continuous cross-cell bars (spec FR-009 - an explicit complexity-bounding decision made directly with the user); overlap must never block submission (spec FR-013); no requester name/email ever shown (spec FR-010).

**Scale/Scope**: One existing form component loses 2 fields and gains 1 trigger; one new modal component containing a month calendar + the 2 relocated picker controls; one new marker-detail popover.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

N/A - `.specify/memory/constitution.md` is still the unfilled template (no ratified project principles exist to check against), same as this repo's prior four features. No gates to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/005-uptime-availability-calendar/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory - this feature exposes no new interface; both data sources are read via already-existing, unmodified endpoints.

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/
├── Components/
│   ├── EnvironmentUptimeRequestFormStaticComponent.tsx          # remove the 2 picker fields, add "Select Dates" trigger + summary
│   └── EnvironmentUptimeRequestAvailabilityModalController.tsx  # NEW - the large modal: month calendar + relocated pickers + marker popover
└── Constants/
    └── EnvironmentUptimeRequestsCON.ts                          # add trigger placeholder/label copy constants
```

No backend directories are touched - this feature introduces zero new endpoints, migrations, or server-side logic.

**Structure Decision**: Single new controller component owns the modal's entire contents (calendar grid, month navigation, both relocated date/time pickers, and the marker-detail popover) - mirroring this app's existing "one controller component per modal" convention (e.g. `DowntimeAnnouncementHistoryModalController`, `UptimeScheduleModalController`). The form component only gains a trigger button and loses its two picker fields; all new behavior is contained in the one new file.

## Complexity Tracking

Not applicable - Constitution Check above has no gates to violate.
