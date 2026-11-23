# Implementation Plan: Calendar Today Visibility & Restricted-Slot Tooltip

**Branch**: `007-calendar-today-visibility` | **Date**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-calendar-today-visibility/spec.md`

## Summary

Add two visual accents (today's column, the exact current-time cell) and a native hover tooltip on disabled slots to the existing Teams-style availability calendar. Small, purely additive change on top of feature 006's already-shipped past-slot disabling - no backend/query wiring, no new dependency.

## Technical Context

**Language/Version**: TypeScript 5.x on React 19.2.8 (existing Vite SPA)

**Primary Dependencies**: None new. Reuses the existing `isSlotDisabled`/`todayYmd`/`currentHour` values already computed in the same component by feature 006.

**Storage**: N/A - purely derived display state, nothing persisted

**Testing**: No automated test framework exists in this repo; verification is manual/live via Chrome DevTools MCP, matching this project's standing practice

**Target Platform**: Web browser (existing Vite dev server / production SPA build)

**Project Type**: Web frontend - single existing React SPA, modifying the same one component as features 005/006 (`EnvironmentUptimeRequestAvailabilityModalController.tsx`); no backend changes

**Performance Goals**: No numeric target requested; this is a handful of extra conditional classNames/elements per already-rendered cell, not a new render path

**Constraints**: Must stay frontend-only; today-column tint and current-time accent must remain visually distinguishable from each other and from the existing weekend-muted/disabled backgrounds (FR-001-FR-003); both must disappear entirely when today isn't in the visible week (FR-003)

**Scale/Scope**: One existing component file; no new shared components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` remains the unfilled placeholder template (confirmed again for this feature) - no concrete principles exist to gate against. Gate: **PASS (vacuous - no constitution defined)**.

**Post-design re-check**: research.md/data-model.md/quickstart.md introduce no new dependency, no persisted data, no external interface. Gate: **PASS (unchanged)**.

## Project Structure

### Documentation (this feature)

```text
specs/007-calendar-today-visibility/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` - this feature exposes no new interface to anyone outside this one component; its public props are unchanged.

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/
└── Features/EnvironmentUptimeRequests/Components/
    └── EnvironmentUptimeRequestAvailabilityModalController.tsx   # the one file this feature changes
```

**Structure Decision**: Single existing Vite/React frontend project. All work lands inside the same one modal component every round of this calendar feature has modified. No new shared component.

## Complexity Tracking

Not applicable - the Constitution Check above is vacuous (no constitution defined).
