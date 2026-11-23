---

description: "Task list for 006-calendar-navigation-constraints"
---

# Tasks: Calendar Navigation & Booking Constraints

**Input**: Design documents from `/specs/006-calendar-navigation-constraints/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test framework exists in this repo (confirmed across every prior feature); verification is the manual quickstart.md walkthrough via Chrome DevTools MCP, per this project's standing practice. No test tasks are included.

**File**: Every task below edits the same single file -
`PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestAvailabilityModalController.tsx`
- so **no task in this list is marked `[P]`**: they all conflict on the same file and must be done in sequence.

## Phase 1: Setup

**Purpose**: Confirm the starting state before changing a file that's already been through several rounds of edits this session.

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) against the current state of `EnvironmentUptimeRequestAvailabilityModalController.tsx` to confirm a clean baseline before this feature's edits begin - no project scaffolding is needed since this is an existing, already-working component.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared state and mechanisms every user story below depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, reintroduce `viewYear`/`viewMonth` as real `useState` (undoing the current plain-constant simplification), still defaulting to `todayYmd.year`/`todayYmd.monthIndex` on mount - required because User Story 3's month arrows and User Story 4's Today reset both need to *set* these, not just read them (data-model.md `DisplayedMonth` entity).
- [X] T003 In the same file, add a `SlideDirection` type (`'forward' | 'backward' | null`) and a small helper that compares two `YearMonthDay` values to derive direction (later → `'forward'`, earlier → `'backward'`, equal → `null`/no transition) - per data-model.md's `SlideDirection` entity and research.md §1/§4's direction-derivation rule.
- [X] T004 In the same file, add the shared framer-motion slide primitive: `motion/react`'s `AnimatePresence` + `variants` whose `initial`/`animate`/`exit` read a `custom` direction prop, mirroring the exact recipe already used in `ModalSharedComponent.tsx`'s `modalVariants`/`activeExitDirection` (research.md §1) - built once here so User Stories 2, 3, and 4 all reuse the same variants/component shape rather than three separate implementations.
- [X] T005 In the same file, add a `now` reference computed once per render pass via `useMemo` (not a live interval/timer, per spec.md's Assumption "re-evaluating happens on render/interaction, not a live per-second timer"), carrying at least the current hour alongside the existing `todayYmd` day-level value - the shared input User Story 1's disabling logic needs.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Can't select a time that's already passed (Priority: P1) 🎯 MVP

**Goal**: Every slot before "now" (any hour on any day before today, or today's current/already-elapsed hour) is visibly and functionally unselectable.

**Independent Test**: Open the modal with a known system time; confirm every past day's slots and today's up-to-and-including-current-hour slot show the native not-allowed cursor, a muted background, and do not respond to clicks; confirm the next full hour onward behaves exactly as before.

### Implementation for User Story 1

- [X] T006 [US1] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, add a pure `isSlotDisabled(day, hour)` derivation using `weekDays`/`now` (T005): disabled when the day is strictly before today, OR the day is today AND `hour <= now`'s current hour - per data-model.md's `SlotSelectability` rule ("the earliest selectable hour on today is `current hour + 1`").
- [X] T007 [US1] In the same file's per-slot className builder, check `isSlotDisabled` *before* the existing start/preview/hover branches: when disabled, apply a muted background plus `cursor-not-allowed`, and skip entirely the existing `hover:bg-[rgba(...)]` and weekend-muted (`bg-[#1a1a1a]`) classes for that cell - per data-model.md/FR-004 ("disabled state MUST visually take precedence... not some combined third visual state").
- [X] T008 [US1] In the same file's `handleSlotClick` and the slot's `onMouseEnter`, early-return (no state change) when `isSlotDisabled(day, hour)` is true - so a disabled cell can never become a selection start/end and never populates `hoverSlot` for range-preview purposes.
- [X] T009 [US1] Manually verify via quickstart.md Scenario 1 (live, Chrome DevTools MCP against the running dev server): past days fully disabled, today's current-hour-and-earlier disabled, next hour onward fully selectable, and a past weekend slot shows only the disabled look (not combined with weekend-muting).

**Checkpoint**: User Story 1 is fully functional and independently testable - this alone is a safe, shippable increment even before any navigation controls are wired up.

---

## Phase 4: User Story 2 - Week navigation actually moves the grid (Priority: P2)

**Goal**: The next/previous week arrow buttons shift the selected week by 7 days, with the main grid (headers, date-range label, hourly body) sliding in the matching direction.

**Independent Test**: Click next, then previous, and confirm the date range and grid contents change correctly each time, with a visible directional slide, and that an in-progress slot selection is cancelled by either click.

### Implementation for User Story 2

- [X] T010 [US2] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, wire the existing (currently decorative) "Previous week"/"Next week" buttons' `onClick` to set `selectedWeekStart` to `±7 days` respectively, using the T003 helper to tag the transition's direction (`'backward'`/`'forward'` respectively - these are always known/fixed, not derived by comparison, for these two specific buttons).
- [X] T011 [US2] In the same file, wrap the column-headers row + the hourly timetable body (the content that depends on `weekDays`) in the T004 shared slide primitive, keyed by `selectedWeekStart` so each change mounts a fresh animated instance - per FR-006 ("day-column headers, the date-range label, and the hourly grid together").
- [X] T012 [US2] In the same file's week-arrow `onClick` handlers (and anywhere else `selectedWeekStart` changes - shared going forward), also reset `startSlot`/`hoverSlot` to `null` - per FR-011 ("any action that changes the selected week... MUST cancel an in-progress slot selection").
- [X] T013 [US2] Manually verify via quickstart.md Scenario 2: next/previous arrows move the grid by exactly one week each, animate in the correct direction, and an in-progress "Start" selection disappears when either arrow is clicked mid-selection.

**Checkpoint**: User Stories 1 AND 2 both work independently - a user can now navigate weeks and still can't pick a past slot in any of them.

---

## Phase 5: User Story 3 - Mini-calendar navigation stays in sync (Priority: P3)

**Goal**: Mini-calendar row clicks drive the main grid the same way the top arrows do (with synced directional animation on both the main grid and the mini-calendar's own highlight), the mini-calendar's month chevrons browse independently, and the main grid crossing a month boundary pulls the mini-calendar along automatically.

**Independent Test**: Click a week-row several weeks away and confirm both the main grid and the mini-calendar's highlight animate in the matching direction; separately, use the month chevrons and confirm only the mini-calendar changes; then select a week that crosses a month boundary via the top arrows and confirm the mini-calendar follows.

### Implementation for User Story 3

- [X] T014 [US3] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, update the mini-calendar week-row `onClick` to compute direction (via the T003 helper, comparing the clicked row's Sunday to the current `selectedWeekStart`) before calling `setSelectedWeekStart`, and reset `startSlot`/`hoverSlot` same as T012 - per FR-007 and FR-011.
- [X] T015 [US3] In the same file, animate the mini-calendar's highlighted-row indicator using the T004 shared slide primitive, keyed by `selectedWeekStart`, so the highlight visibly moves from the old row's position to the new one rather than jumping - per FR-007 ("animating its move from the old row's position to the new one").
- [X] T016 [US3] In the same file, wire the mini-calendar's "Previous month"/"Next month" chevrons to change `viewYear`/`viewMonth` (±1 month, with year rollover at the Dec/Jan boundary) tagged with their own fixed direction, animated via the T004 primitive keyed by `viewYear`/`viewMonth`, and explicitly do **not** touch `selectedWeekStart` - per FR-008.
- [X] T017 [US3] In the same file, add a `useEffect` that watches `selectedWeekStart` and sets `viewYear`/`viewMonth` to the month containing its Sunday whenever that differs from the currently displayed month (tagged with direction via the T003 helper so it animates too) - per FR-009 and research.md §4's sync model.
- [X] T018 [US3] Manually verify via quickstart.md Scenario 3: row clicks in both directions animate both the grid and the mini-calendar highlight; month chevrons change only the mini-calendar; a week-selection crossing a month boundary (via the top arrows) pulls the mini-calendar's displayed month along with its own animated transition.

**Checkpoint**: All of User Stories 1-3 work independently and together - full navigation via either the top arrows or the mini-calendar, always in sync, still respecting the past-slot guard.

---

## Phase 6: User Story 4 - "Today" button returns to now from anywhere (Priority: P4)

**Goal**: One click of "Today" resets the selected week, the displayed month, and the grid's vertical scroll position to the current date/time, animated and direction-aware, from wherever the user currently is.

**Independent Test**: Navigate several weeks/months away, click Today, and confirm the week, month, and scroll position all return to now with correct-direction animation; click Today again with no change pending and confirm only the scroll position re-centers (no spurious slide).

### Implementation for User Story 4

- [X] T019 [US4] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, wire the "Today" button's `onClick` to: compute the Sunday of the real current week and compare it (via the T003 helper) to `selectedWeekStart` - if different, update `selectedWeekStart` with the derived direction (this alone triggers T011/T015's animations and, via T017, the mini-calendar's month-follow); if already equal, skip the update entirely (no-op, per FR-010/Acceptance Scenario 3 - "no week/month slide occurs").
- [X] T020 [US4] In the same file's Today `onClick`, also reset `startSlot`/`hoverSlot` to `null`, matching T012/T014 - per FR-011.
- [X] T021 [US4] In the same file, add a ref to the hourly grid's scrollable container (the existing `overflow-y-auto` div) and, in the Today `onClick`, call `scrollIntoView({behavior: 'smooth', block: 'center'})` (or an equivalent computed `scrollTo`) on the current hour's row - per research.md §5, running unconditionally (even when T019 found no week change needed).
- [X] T022 [US4] Manually verify via quickstart.md Scenario 4: Today from a future week, from a past week, and from an already-current week (scroll-only, no slide) all behave as specified; an in-progress selection is cancelled by the Today click same as the arrows.

**Checkpoint**: All four user stories work independently and together.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final whole-feature verification, matching this session's standing practice for every prior round of this same component.

- [X] T023 Run `npx tsc -b` and `npx oxlint` against the final state of `EnvironmentUptimeRequestAvailabilityModalController.tsx`; confirm no new warnings/errors beyond the two pre-existing advisory ones already accepted in earlier rounds (`set-state-in-effect` on the today/open-reset effects, and the `Date` purity warning on the `todayYmd`/`now` memos).
- [X] T024 Run the complete quickstart.md walkthrough (all 4 scenarios, in order, in one sitting) live via Chrome DevTools MCP against the running dev server, confirming no regression to prior rounds' behavior (empty-until-booked grid, 24-hour AM/PM rows, weekend muting on non-disabled days, the modal's adaptive sizing at both breakpoints, the existing click-to-book multi-day interaction, and the scope-div-fills-the-modal fix).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends only on Foundational. Independently shippable MVP.
- **User Story 2 (Phase 4)**: Depends only on Foundational (does not require User Story 1's edits, though both touch the same file so must be done in sequence, not in parallel).
- **User Story 3 (Phase 5)**: Depends on Foundational; also depends on User Story 2's T010/T011 existing first, since the mini-calendar's row-click animation (T014/T015) reuses the exact same `selectedWeekStart`-driven slide wiring the week arrows establish.
- **User Story 4 (Phase 6)**: Depends on User Story 3's T016/T017 (month-follow sync) and User Story 2's T010/T011 (week-slide wiring), since Today resets both together.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Within Each User Story

- Each story's manual-verification task is always last within that phase, after that story's implementation tasks.

### Parallel Opportunities

None at the task level - every task edits the same single file. The *independent testability* of each user story (per their own Acceptance Scenarios) is what makes them separable, not parallel execution.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1 - past-slot blocking).
3. **STOP and VALIDATE**: run quickstart.md Scenario 1 independently - this alone is a safe, correct, shippable increment (the arrows/mini-calendar/Today button remain exactly as decorative as they are today).

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → validate → safe checkpoint (booking guardrail live, navigation still decorative).
3. User Story 2 → validate → week arrows now work.
4. User Story 3 → validate → mini-calendar fully wired and synced.
5. User Story 4 → validate → Today button completes the set.
6. Polish → full regression pass.

### Notes

- No `[P]` markers anywhere - deliberate, not an oversight: every task in this list touches the same one file.
- No automated tests are included (none exist in this repo; this project's standing practice is live manual verification via Chrome DevTools MCP, captured here as the per-story quickstart tasks).
- Commit after each phase's checkpoint, not after every individual task, consistent with how this feature's prior rounds were committed in this session (one commit per logically-complete change, not per file-touch).
