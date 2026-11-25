---

description: "Task list for 013-light-mode-canvas-color"
---

# Tasks: Adopt ObservaCore's Light Mode Canvas Color

**Input**: Design documents from `/specs/013-light-mode-canvas-color/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test framework exists in this project; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) to confirm a clean baseline before this feature's one-line edit.

---

## Phase 2: Foundational (Blocking Prerequisites)

None — there is no shared infrastructure this single-value change depends on.

---

## Phase 3: User Story 1 - A visibly layered light mode, matching ObservaCore (Priority: P1) 🎯 MVP

**Goal**: Light mode's page background becomes `#f2f2f2` instead of `#ffffff`, per data-model.md's `Canvas Background Color` entity, with every other light-mode variable and all of dark mode left untouched.

**Independent Test**: Load the application in light mode and confirm the page background is `#f2f2f2`, visibly distinct from a card's own `#f8fafc`/`#f1f5f9` background; confirm dark mode is pixel-identical to before.

### Implementation for User Story 1

- [X] T002 [US1] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/index.css`, change `--color-canvas` in the existing `:root` block from `#ffffff` to `#f2f2f2` (per data-model.md — the `.dark` block's own `--color-canvas: #000000` is untouched).
- [X] T003 [US1] Manually verify quickstart.md Scenarios 1-3 live via Chrome DevTools MCP: page background reads as `#f2f2f2` and visibly distinct from card backgrounds in light mode; every other sampled light-mode surface (button, modal, popover, input, dropdown, nav bar, table header) is unchanged; dark mode is pixel-identical to before.

**Checkpoint**: The entire feature is complete and independently testable by toggling light/dark mode alone.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T004 Run `npx tsc -b` and `npx oxlint` (frontend) once more against the final state to confirm no new warnings/errors from the one-line change.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: N/A — empty phase, nothing blocks User Story 1.
- **User Story 1 (Phase 3)**: Depends only on Setup.
- **Polish (Phase 4)**: Depends on User Story 1 being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on any other story — this feature has exactly one user story.

### Parallel Opportunities

- None meaningful at this scale — T002 and T003 are sequential (edit, then verify the edit), and the feature touches a single file.

---

## Implementation Strategy

### MVP First (and only) Scope

1. Complete Phase 1 (Setup).
2. Complete Phase 3 (User Story 1) — T002 then T003. This is the entire feature.
3. Complete Phase 4 (Polish): final `tsc`/`oxlint` check.

### Notes

- No automated tests exist in this repo; live manual verification via Chrome DevTools MCP per this project's standing practice.
- This is a single-file, single-line change — there is no incremental-delivery story beyond "done" or "not done."
