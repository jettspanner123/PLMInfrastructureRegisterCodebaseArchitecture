# Implementation Plan: Calendar Event Card Status Colors

**Branch**: `010-calendar-status-colors` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-calendar-status-colors/spec.md`

## Summary

Give each existing uptime-request event card on the availability calendar a color scheme keyed to its status (Pending `#ffa826`, Approved `#26acff`, Completed `#29d944`): solid card background, a reduced-opacity border, a lightened stripe, and a darkened time-pill background — all derived from that one status color, replacing today's single fixed purple scheme for those cards. The in-progress pick and downtime cards are untouched.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 (frontend only — no backend change).

**Primary Dependencies**: Tailwind (arbitrary-value hex classes, already this file's own established style) — zero new dependencies.

**Storage**: N/A — purely a rendering/styling change; no new data read or written beyond the `status` field `EnvironmentUptimeRequestInterfaceModel` already carries.

**Testing**: No automated test framework exists in this project; verification is manual, live, via Chrome DevTools MCP (established practice this session).

**Target Platform**: Web — the existing availability calendar modal.

**Project Type**: Single-file frontend change (`EnvironmentUptimeRequestAvailabilityModalController.tsx`), plus a small, same-file type extension.

**Performance Goals**: None beyond existing — a handful of literal Tailwind classes, no new computation of consequence.

**Constraints**:
- Tailwind's JIT scanner only generates CSS for class strings it can find *literally* in source — a dynamically interpolated `` `bg-[${hex}]` `` template would silently fail to render in production, since Tailwind can't statically see the computed string. Every color class in this plan is therefore written as a complete literal string per status (matching how this file's existing `STATUS_STYLES`-style maps already work), never built by string interpolation.
- Alpha-compositing a color on top of an identically-colored, fully-opaque backdrop is a no-op at any opacity (`result = C·α + C·(1−α) = C`) — confirmed by direct calculation during planning. This ruled out the originally-discussed "same hex, just reduced opacity" approach for the stripe and pill (both of which visually sit on top of the card's own solid fill, unlike the border, which sits against the external grid background and so *does* work with plain opacity). Resolved via a second clarification round — see research.md §2.

**Scale/Scope**: One file touched (`EnvironmentUptimeRequestAvailabilityModalController.tsx`): extend `TeamsCalendarEvent` with an optional `status` field, add one color-lookup map, replace the existing three-spot `isDowntime` ternary with one computed per-card color object.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (confirmed again this session) — no project-specific principles to gate against. Vacuous pass.

## Project Structure

### Documentation (this feature)

```text
specs/010-calendar-status-colors/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
└── quickstart.md         # Phase 1 output
```

No `contracts/` — this feature has no external interface (no new endpoint, no new props on any component other props already flow through).

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/
└── EnvironmentUptimeRequestAvailabilityModalController.tsx   # EXTEND ONLY — the one file this feature touches
```

**Structure Decision**: Everything lives inside the one file that already renders these event cards — no new file, no new component, no new shared constant file. The color lookup map is small enough and specific enough to this one card's own rendering that it doesn't warrant extraction into `Constants/` or `Helpers/`.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — vacuous Constitution Check pass, no new dependencies, no new files, no new architectural layer.
