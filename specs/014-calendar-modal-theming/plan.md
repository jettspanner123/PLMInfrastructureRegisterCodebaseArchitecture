# Implementation Plan: Calendar Modal Light/Dark Theming

**Branch**: `014-calendar-modal-theming` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-calendar-modal-theming/spec.md`

## Summary

The Uptime Request page's calendar modal (`EnvironmentUptimeRequestAvailabilityModalController.tsx`) currently hardcodes a single, always-dark palette with no light-mode variant at all. This feature adds a light-mode value for every chrome color (backgrounds, borders, text tones, hover/selection states, scrollbar) using Tailwind's `dark:` variant convention already established elsewhere in this codebase (confirmed in `ModalSharedComponent.tsx`), moving each current literal hex value behind `dark:` and adding a new, unprefixed light-mode class alongside it. Booking/status event card colors and the modal's accent/interactive blue tones are explicitly left unchanged, per the spec's Clarifications and Assumptions.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 — no new language/runtime.

**Primary Dependencies**: Tailwind CSS v4's `dark:` variant (already the established per-component theming mechanism in this codebase) — zero new dependencies.

**Storage**: N/A — no backend, no database, no persisted setting; reads the application's existing theme state the same way every other themed component already does.

**Testing**: No automated test framework exists in this project; verification is manual, live, via Chrome DevTools MCP, toggling light/dark mode with the modal open.

**Target Platform**: Web — one existing modal (the Uptime Request page's calendar view).

**Project Type**: Web application (frontend-only; no backend involvement).

**Performance Goals**: None beyond existing — purely additional Tailwind classes, no new runtime logic.

**Constraints**:
- Every current dark-mode value must be preserved exactly, moved behind `dark:` rather than replaced — per spec FR-003/SC-002, dark mode must render pixel-identical to today.
- Booking/status event card colors (`BOOKING_STATUS_CARD_STYLES` and the downtime card) and the modal's accent/interactive blue tones (today badge, day-number accent, building icon, selection/preview overlays) are explicitly out of scope — per spec FR-004 and Assumptions.
- The one raw `<style>` block (scrollbar colors) isn't reachable by Tailwind's `dark:` variant at all, since it's plain CSS — it needs its own `.dark`-class-gated selector pair, mirroring how `index.css` itself already pairs `:root`/`.dark` rules.

**Scale/Scope**: One existing file (`EnvironmentUptimeRequestAvailabilityModalController.tsx`), no new files. Per research.md §2: a background map (7 roles), a border/divider map (1 shared role), a text-tone map (9 roles), and a scrollbar map (3 roles) — roughly 20 distinct token substitutions, each a `dark:`-prefixed addition alongside the existing class, not a replacement.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template — no project-specific principles to gate against. Vacuous pass.

## Project Structure

### Documentation (this feature)

```text
specs/014-calendar-modal-theming/
├── plan.md              # This file
├── research.md           # Phase 0 output
├── data-model.md         # Phase 1 output
└── quickstart.md         # Phase 1 output
```

No `contracts/` directory — this feature exposes no new or changed interface; it is a styling-only change to one existing component.

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/
└── EnvironmentUptimeRequestAvailabilityModalController.tsx   # EDIT: add light-mode `dark:`-paired classes per research.md's token maps; add a .dark-gated pair for the raw <style> scrollbar rules
```

**Structure Decision**: A single-file edit. No new files, no new dependencies, no backend involvement.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — vacuous Constitution Check pass, no new dependencies, no new files beyond this feature's own spec artifacts.
