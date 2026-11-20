# Implementation Plan: Animated Dashboard Counters

**Branch**: `004-animated-dashboard-counters` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-animated-dashboard-counters/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Replace the static `<span>{count}</span>` numbers in the Uptime Requests Dashboard's "Total Requests" and "Pending" cards with `@number-flow/react`'s `<NumberFlow value={count} />`, so the displayed count animates between values instead of snapping instantly. Purely a frontend, display-layer swap in one existing component (`EnvironmentUptimeRequestDashboardStaticComponent`) - no new backend work, no new data, no change to what is counted or how.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend only - no backend changes)

**Primary Dependencies**: `@number-flow/react` (**new** - user-named library; npm registry confirms v0.6.2, peer deps `react: ^18 || ^19` / `react-dom: ^18 || ^19`, satisfied by this project's React 19; depends on the dependency-free `number-flow` core package and `esm-env`)

**Storage**: N/A - no schema or data changes; the two counts already exist and are already computed client-side (feature 003)

**Testing**: Not requested; this repo has no test framework - verified manually via quickstart.md

**Target Platform**: Web (existing React SPA)

**Project Type**: Web application (frontend-only change within `PLMInfrastructureRegisterClientServiceLayerMSC/`)

**Performance Goals**: No new goals - a single animated number per card, well within any reasonable render budget

**Constraints**: Must visually match the existing card's number styling exactly (spec FR-004); must not animate when the value hasn't changed (spec FR-003); must not reflow/clip the card during a multi-digit transition (spec Edge Cases)

**Scale/Scope**: One existing component (`EnvironmentUptimeRequestDashboardStaticComponent.tsx`), two call sites (the Total Requests and Pending cards' number display)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

N/A - `.specify/memory/constitution.md` is still the unfilled template (no ratified project principles exist to check against), same as this repo's prior two features. No gates to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/004-animated-dashboard-counters/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory - see Constitution/Interface notes below; this feature exposes no new interface.

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/
├── package.json                                                        # add @number-flow/react
└── src/Features/EnvironmentUptimeRequests/Components/
    └── EnvironmentUptimeRequestDashboardStaticComponent.tsx             # swap <span>{value}</span> for <NumberFlow value={value} />
```

No backend directories are touched - this feature introduces zero new endpoints, migrations, or server-side logic, and no other frontend file needs to change.

**Structure Decision**: Single-file frontend change. The two summary cards already live in one component (`EnvironmentUptimeRequestDashboardStaticComponent`, from feature 003); this feature only touches how each card's `value` is rendered inside its existing JSX, plus the new dependency in `package.json`.

## Complexity Tracking

Not applicable - Constitution Check above has no gates to violate.
