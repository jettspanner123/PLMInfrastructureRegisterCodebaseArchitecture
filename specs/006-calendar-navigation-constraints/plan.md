# Implementation Plan: Calendar Navigation & Booking Constraints

**Branch**: `006-calendar-navigation-constraints` | **Date**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-calendar-navigation-constraints/spec.md`

## Summary

Make the Teams-style availability calendar's navigation controls (week arrows, mini-calendar row clicks, mini-calendar month arrows, Today button) actually functional instead of decorative, with direction-aware slide animations tying the main grid and the mini-calendar together, and disable any slot before "now" (native not-allowed cursor + muted styling, taking precedence over the existing weekend-muted look). Pure frontend/presentation work on the one existing modal component - no backend or query wiring.

## Technical Context

**Language/Version**: TypeScript 5.x on React 19.2.8 (existing Vite SPA)

**Primary Dependencies**: `motion/react` (framer-motion) - already a dependency and already used in `ModalSharedComponent` for direction-aware enter/exit animation via `AnimatePresence` + a `custom` direction prop; `lucide-react` for icons (already used by the modal for its nav chevrons). No new dependency is introduced.

**Storage**: N/A - pure client-side view state (selected week, displayed month), nothing persisted

**Testing**: No automated test framework exists anywhere in this repo (confirmed repeatedly across prior features in this codebase); verification is manual/live via Chrome DevTools MCP against the running dev server, matching this project's standing practice

**Target Platform**: Web browser (existing Vite dev server / production SPA build)

**Project Type**: Web frontend - single existing React SPA, modifying one existing component (`EnvironmentUptimeRequestAvailabilityModalController.tsx`); no backend changes

**Performance Goals**: Slide transitions read as smooth (not janky) on a typical laptop/desktop browser - no numeric frame-budget target was requested; framer-motion's GPU-accelerated transform animations are the existing codebase's standard tool for this

**Constraints**: Must stay frontend-only (per spec Assumptions); the new "disabled past slot" visual state must take full precedence over the existing weekend-muted background (FR-004) rather than stacking as a third combined look; no artificial floor/ceiling on how far a user can navigate

**Scale/Scope**: One existing component file; no new routes, no new shared components strictly required (though the directional-slide wrapper could be factored out if it turns out to be reused - see Structure Decision below)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled placeholder template (no project-specific principles have ever been ratified into it - every section is still `[PLACEHOLDER_TEXT]`). There are no concrete principles to gate against, so this check has nothing to evaluate and raises no violations. Gate: **PASS (vacuous - no constitution defined)**.

**Post-design re-check**: research.md, data-model.md, and quickstart.md introduce no new dependency, no new persisted data, and no new external interface - still nothing for a constitution to gate. Gate: **PASS (unchanged)**.

## Project Structure

### Documentation (this feature)

```text
specs/006-calendar-navigation-constraints/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no new interface to other systems or callers - it's internal interaction/presentation logic inside one existing modal, and the modal's own public props (`EnvironmentUptimeRequestAvailabilityModalControllerProps`) are unchanged.

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/
└── Features/EnvironmentUptimeRequests/Components/
    └── EnvironmentUptimeRequestAvailabilityModalController.tsx   # the one file this feature changes
```

**Structure Decision**: Single existing Vite/React frontend project (no backend involved). All work lands inside the one existing modal component file above - the same file every prior round of this calendar feature has modified. No new shared component is being introduced; if the directional-slide technique ends up looking reusable once built, that's a separate future refactor, not part of this feature's scope.

## Complexity Tracking

Not applicable - the Constitution Check above is vacuous (no constitution defined), so there are no violations to justify.
