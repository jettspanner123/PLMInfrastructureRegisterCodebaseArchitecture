---

description: "Task list for 007-calendar-today-visibility"
---

# Tasks: Calendar Today Visibility & Restricted-Slot Tooltip

**Input**: Design documents from `/specs/007-calendar-today-visibility/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test framework exists in this repo; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

**File**: Every task below edits the same single file -
`PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestAvailabilityModalController.tsx`
- so **no task in this list is marked `[P]`**.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) against the current state of `EnvironmentUptimeRequestAvailabilityModalController.tsx` to confirm a clean baseline before this feature's edits begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared derived values both user stories depend on.

- [X] T002 In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, inside the per-day-column render (where `weekDay`/`dayIndex` are already in scope), derive `isToday = isSameYmd(weekDay, todayYmd)` using the existing `isSameYmd`/`todayYmd` values - per data-model.md's `TodayColumnIndicator` rule.
- [X] T003 In the same file's per-slot render (where `isSlotDisabled`'s `disabled` boolean and `hour` are already in scope), derive `isCurrentTimeCell = isToday && hour === currentHour` using the existing `currentHour` value - per data-model.md's `CurrentTimeCellAccent` rule (note the strict `===`, not the disabled check's `<=`, since this must match only the one exact current-hour cell, not every disabled hour).

**Checkpoint**: Foundation ready - both user stories can now be implemented.

---

## Phase 3: User Story 1 - See at a glance which day is today and which slot is right now (Priority: P1) 🎯 MVP

**Goal**: Today's column and the exact current-time cell are each visually distinguished, both from each other and from the existing weekend-muted/disabled backgrounds, and both disappear when today isn't in the visible week.

**Independent Test**: Open the modal on a week including today; confirm the column tint, the stronger current-time cell accent, and that neither appears on a week not containing today.

### Implementation for User Story 1

- [X] T004 [US1] In the same file, inside each slot cell's JSX (which is already `position:relative` via its existing className), add a `pointer-events-none` absolutely-positioned (`absolute inset-0`) overlay `<div>` rendered when `isToday` is true, with `background-color: rgba(91, 95, 199, 0.08)` - per research.md §1 (layered overlay, not a combined background-color class) and FR-001. Render it *underneath* the existing "Start" badge span (which must stay on top, unaffected).
- [X] T005 [US1] In the same file, add a second overlay `<div>` (same `absolute inset-0 pointer-events-none` pattern) rendered when `isCurrentTimeCell` is true, with `background-color: rgba(91, 95, 199, 0.18)`, stacked on top of the T004 overlay (if both render in the same cell, the stronger one visually wins per normal paint order) - per FR-002.
- [X] T006 [US1] Manually verify via quickstart.md Scenario 1: today's column tint visible across all its cells, the current-time cell shows the stronger accent, other disabled cells in today's column show only the plain disabled look plus the column tint (not the stronger accent), and navigating to a week without today shows neither indicator anywhere - per FR-003.

**Checkpoint**: User Story 1 fully functional and independently testable - a safe, shippable increment even without the tooltip.

---

## Phase 4: User Story 2 - Understand why a slot can't be selected (Priority: P2)

**Goal**: Hovering any disabled slot shows a short native tooltip explaining why.

**Independent Test**: Hover a disabled slot and confirm the native tooltip appears after the usual hover delay; hover a selectable slot and confirm none appears.

### Implementation for User Story 2

- [X] T007 [US2] In the same file's slot cell JSX, add `title={disabled ? 'This time has already passed' : undefined}` (reusing the existing `disabled` boolean already computed per-slot) - per FR-004/FR-005 and data-model.md's `RestrictedSlotTooltip` rule.
- [X] T008 [US2] Manually verify via quickstart.md Scenario 2: disabled slots show the native tooltip on hover with a short message, selectable slots show none.

**Checkpoint**: Both user stories complete and independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T009 Run `npx tsc -b` and `npx oxlint` against the final state of `EnvironmentUptimeRequestAvailabilityModalController.tsx`; confirm no new warnings/errors.
- [X] T010 Run the complete quickstart.md walkthrough (both scenarios) live via Chrome DevTools MCP, confirming no regression to feature 006's navigation, animations, or past-slot disabling/cursor behavior.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS both user stories.
- **User Story 1 (Phase 3)**: Depends only on Foundational. Independently shippable MVP.
- **User Story 2 (Phase 4)**: Depends only on Foundational (does not require User Story 1's edits, though both touch the same file so must be done in sequence).
- **Polish (Phase 5)**: Depends on both user stories being complete.

### Parallel Opportunities

None at the task level - every task edits the same single file.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - today/current-time coloring).
3. **STOP and VALIDATE**: run quickstart.md Scenario 1 independently - safe, shippable increment (the tooltip remains absent until User Story 2).

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → validate → today/current-time indicators live.
3. User Story 2 → validate → tooltip live.
4. Polish → full regression pass.

### Notes

- No `[P]` markers anywhere - every task touches the same one file.
- No automated tests (none exist in this repo); live manual verification via Chrome DevTools MCP per this project's standing practice.
