# Implementation Plan: Adopt ObservaCore's Light Mode Canvas Color

**Branch**: `013-light-mode-canvas-color` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-light-mode-canvas-color/spec.md`

## Summary

Light mode's page background (`--color-canvas` in `index.css`) changes from `#ffffff` to `#f2f2f2`, matching the one light-mode color value ObservaCore's own team kept after trying and reverting two more invasive experiments. Every other light-mode variable (card/elevated/deep surfaces, hairlines, text tones) and all of dark mode are already identical between the two applications and stay completely untouched — this is a one-line value edit to an existing `:root` custom property, nothing else.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 (frontend) — no new language/runtime; no backend involvement at all.

**Primary Dependencies**: Tailwind CSS v4 (CSS theme variables) — zero new dependencies.

**Storage**: N/A — no database, no configuration constant, no persisted setting of any kind.

**Testing**: No automated test framework exists in this project; verification is manual, live, via Chrome DevTools MCP, comparing the page background against a card's own background in light mode.

**Target Platform**: Web — every light-mode surface of the existing application shell.

**Project Type**: Web application (frontend-only change; the backend project is untouched).

**Performance Goals**: None — a static CSS value, no runtime cost of any kind.

**Constraints**:
- The change must touch exactly one existing CSS custom property (`--color-canvas`'s `:root` value) and nothing else — per research.md, every other light-mode variable in this application already matches ObservaCore's own values exactly, and ObservaCore's own two more invasive experiments (a flat canvas+card recolor, then an 11-file hardcoded "3-tier elevation" pass) were explicitly reverted by its own authors before shipping, so neither should be reintroduced here.
- Dark mode (the `.dark` block) must not be touched at all.
- No conditional/schema gating of any kind applies to this change (unlike feature 012's `FRONTEND_DESIGN_SCHEMA`) — it is an unconditional light-mode value change, the same way the value it replaces is unconditional today.

**Scale/Scope**: One CSS custom-property value, in one file (`PLMInfrastructureRegisterClientServiceLayerMSC/src/index.css`'s existing `:root` block). Zero new files, zero new dependencies, zero backend changes, zero component edits.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template — no project-specific principles to gate against. Vacuous pass.

## Project Structure

### Documentation (this feature)

```text
specs/013-light-mode-canvas-color/
├── plan.md              # This file
├── research.md           # Phase 0 output
├── data-model.md         # Phase 1 output
└── quickstart.md         # Phase 1 output
```

No `contracts/` directory — this feature exposes no new or changed interface (no backend endpoint, no DTO, no public API); it is a single internal CSS value.

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/
└── index.css   # EDIT: :root's --color-canvas value, #ffffff -> #f2f2f2 (one line)
```

**Structure Decision**: A single-line edit to an existing file. No new files, no new directories, no backend involvement.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — vacuous Constitution Check pass, no new dependencies, no new files beyond this feature's own spec artifacts.
