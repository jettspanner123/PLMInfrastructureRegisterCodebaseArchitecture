# Implementation Plan: Scrollable Multi-Week Calendar Grid

**Branch**: `008-calendar-scrollable-weeks` | **Date**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-calendar-scrollable-weeks/spec.md`

## Summary

Replace the availability calendar's "one selected week, discrete slide-swap between weeks" model with a single continuous horizontally-scrollable strip spanning 5 weeks (the current week through 4 weeks ahead), free-scrolling with no snap, synced live to the mini-calendar via a "leading week" computed from scroll position. Disabled slots additionally get a small lock icon. Pure frontend/presentation change on the same one modal component as every prior round - no backend/query wiring, no new dependency.

## Technical Context

**Language/Version**: TypeScript 5.x on React 19.2.8 (existing Vite SPA)

**Primary Dependencies**: `motion/react` (framer-motion) - already a dependency, usage narrows (removed from the main grid's week-to-week transition, kept for the mini-calendar's own highlight-pill and month-view slide, and the header's date-range label text). `lucide-react` - already a dependency; `Lock` is a new named import from the same already-installed package, not a new dependency.

**Storage**: N/A - purely derived display/scroll state, nothing persisted

**Testing**: No automated test framework exists in this repo; verification is manual/live via Chrome DevTools MCP, matching this project's standing practice

**Target Platform**: Web browser (existing Vite dev server / production SPA build)

**Project Type**: Web frontend - single existing React SPA, modifying the same one component as features 005-007 (`EnvironmentUptimeRequestAvailabilityModalController.tsx`); no backend changes

**Performance Goals**: Smooth native scrolling for a modest, fully-rendered DOM (35 days x 24 hour-rows = 840 slot cells, well within what a browser renders and scrolls smoothly without virtualization)

**Constraints**: Must stay frontend-only; scroll range is a hard-bounded, fully-rendered 5-week strip (not lazily extended or virtualized, per spec Assumptions); must not regress the existing click-to-book multi-day-span selection, which now needs to work across what used to be separate "weeks"

**Scale/Scope**: One existing component file; no new shared components; no new dependency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` remains the unfilled placeholder template - no concrete principles exist to gate against. Gate: **PASS (vacuous - no constitution defined)**.

**Post-design re-check**: research.md/data-model.md/quickstart.md introduce no new dependency, no persisted data, no external interface. Gate: **PASS (unchanged)**.

## Project Structure

### Documentation (this feature)

```text
specs/008-calendar-scrollable-weeks/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
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
