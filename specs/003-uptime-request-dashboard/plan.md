# Implementation Plan: Uptime Request Dashboard View

**Branch**: `003-uptime-request-dashboard` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-uptime-request-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Admins get a segmented control ("Dashboard" / "Form") in the Uptime Requests page header that swaps the left pane of the page's existing 50:50 layout between today's submission form and a new overview: 2 summary cards and a list of all Active/Scheduled Downtime Announcements, with the right pane (the full requests list) unchanged in both views. Non-admins are unaffected. Purely a frontend feature - no new backend endpoints, no new data writes; the new left pane is computed client-side from data the app already fetches (`GetAllEnvironmentUptimeRequests`, `GetAllDowntimeAnnouncements`).

> **Revision (2026-11-20)**: Originally 4 cards + a 30-day trend chart (`recharts`) in a single stacked column. Per direct user follow-up, the Approved/Completed cards and the trend chart were removed and the layout changed to 50:50 (reusing the Form view's own request list feed on the right); `recharts` was uninstalled as it had no remaining use.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend only - no backend changes)

**Primary Dependencies**: `@tanstack/react-query` (existing queries, reused as-is), `motion` (existing, for the view-switch animation). `recharts` was added for the original trend chart and later uninstalled once that chart was removed (see revision note in Summary above) - no new dependency remains.

**Storage**: N/A - no schema changes; reuses existing `IG_EnvironmentUptimeRequestTBL` and `IG_DowntimeAnnouncementTBL` data via already-existing GET endpoints

**Testing**: Not requested; this repo has no test framework (same precedent as the Jira feature) - verified manually via quickstart.md

**Target Platform**: Web (existing React SPA)

**Project Type**: Web application (frontend-only change within the existing `PLMInfrastructureRegisterClientServiceLayerMSC/` project)

**Performance Goals**: No new goals beyond this app's existing standard (near-instant client-side aggregation over an already-fetched list; current data volume is small - tens of requests, not thousands)

**Constraints**: View switch must animate, not snap instantly (spec FR-010); Dashboard must never be shown to non-admins (spec FR-001/FR-002)

**Scale/Scope**: One page (`EnvironmentUptimeRequestsScreenController`), one new segmented control, one new dashboard view component, 4 cards + 1 chart + 1 list

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

N/A - `.specify/memory/constitution.md` is still the unfilled template (no ratified project principles exist to check against), same as this repo's prior feature (002-jira-ticket-creation). No gates to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/
├── EnvironmentUptimeRequestsScreenController.tsx   # add segmented control + view-mode state + animated swap
├── Components/
│   ├── EnvironmentUptimeRequestFormStaticComponent.tsx       # unchanged (existing Form view)
│   ├── EnvironmentUptimeRequestListFeedStaticComponent.tsx   # unchanged (existing Form view)
│   └── EnvironmentUptimeRequestDashboardStaticComponent.tsx  # NEW - cards + chart + downtime list
└── Constants/
    └── EnvironmentUptimeRequestsCON.ts             # add view-mode + dashboard copy constants
```

No backend directories are touched - this feature introduces zero new endpoints, migrations, or server-side logic.

**Structure Decision**: Single-project frontend change within the existing `PLMInfrastructureRegisterClientServiceLayerMSC/` feature folder, mirroring how `EnvironmentOverviewScreenController` already owns its own View/Edit Mode toggle state. One new static component (`EnvironmentUptimeRequestDashboardStaticComponent`) holds the entire dashboard body; the screen controller only owns the view-mode toggle and which of the two bodies to render.

## Complexity Tracking

Not applicable - Constitution Check above has no gates to violate.
