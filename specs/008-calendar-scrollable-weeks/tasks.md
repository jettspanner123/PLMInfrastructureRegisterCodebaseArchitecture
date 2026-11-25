---

description: "Task list for 008-calendar-scrollable-weeks"
---

# Tasks: Scrollable Multi-Week Calendar Grid

**Input**: Design documents from `/specs/008-calendar-scrollable-weeks/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test framework exists in this repo; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

**File**: Every task below edits the same single file -
`PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestAvailabilityModalController.tsx`
- so **no task in this list is marked `[P]`**.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) against the current state of `EnvironmentUptimeRequestAvailabilityModalController.tsx` to confirm a clean baseline before this feature's edits begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The layout and state-model rewrite every user story depends on - this is where most of the architectural change actually happens; the bounded-scroll behavior itself falls out of it automatically (see Phase 3's note).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, replace the 7-entry `weekDays` with a 35-entry `allDays`, computed fresh every render the same way `todayYmd`/`currentHour` already are: `allDays[i] = addDays(getSundayOfWeek(todayYmd), i)` for `i` in `0..34` - per data-model.md's `AllDays` entity.
- [X] T003 In the same file, change the shared scroll container's (`gridScrollRef`) className from `overflow-x-hidden` to `overflow-x-auto`.
- [X] T004 In the same file, remove the `AnimatePresence`/`motion.div`/`SLIDE_VARIANTS`-wrapped per-week day-header row content; replace it with a plain, always-rendered `<div>` whose own width is `500%` (e.g. `w-[500%]` or an inline style) containing all 35 `allDays` entries as `flex-1` children, inside the existing header row (the `w-12` corner spacer stays a sibling, unchanged in width) - per research.md §1.
- [X] T005 In the same file, do the identical replacement for the hour-grid body's day-column row (the second `AnimatePresence`/`motion.div`) - all 35 columns at `flex-1` inside a `w-[500%]` wrapper, each still rendering its own 24 hour-slot cells exactly as before, inside the existing body row (the `w-12` hour-label column stays a sibling, unchanged in width).
- [X] T006 In the same file, make the header row's `w-12` corner-spacer `<div>` additionally `sticky left-0` (on top of its existing `sticky top-0` on the row), with a `z-index` above the day-header content next to it - per research.md §2.
- [X] T007 In the same file, make the hour-grid body's `w-12` hour-label column `sticky left-0` (no `top`, since it still scrolls vertically with the hour rows - only pin it horizontally), with a `z-index` above the day-columns' slot content - per research.md §2.
- [X] T008 In the same file, update `isSlotDisabled(dayIndex, hour)` to look up `allDays[dayIndex]` instead of `weekDays[dayIndex]` - no formula change, just the wider backing array (data-model.md's `SlotSelectability`, now spanning `0..34`).
- [X] T009 In the same file, remove the `selectedWeekStart` state and the feature-006 `goToWeek` function (and its slide-swap-driving calls) that previously drove the main grid's per-week content; introduce a new `leadingWeekIndex` state (`0..4`, default `0`) and a derived `leadingWeekDays = allDays.slice(leadingWeekIndex * 7, leadingWeekIndex * 7 + 7)` feeding the existing `weekRangeLabel`/`weekKey` computations (header date-range label) and the mini-calendar's `isSelectedWeek` check/highlight-pill - per data-model.md's `LeadingWeekIndex` entity. Keep the `weekSlideDirection` state and the header's `SlidingLabel` usage in place (research.md §7) - User Story 2 is what starts actually setting `weekSlideDirection` meaningfully; for now it can default to not changing.

**Checkpoint**: Foundation ready - the grid now renders all 35 days on one continuous, natively horizontally-scrollable strip, correctly bounded (see Phase 3).

---

## Phase 3: User Story 1 - Scroll continuously across several weeks (Priority: P1) 🎯 MVP

**Goal**: The grid is one continuous horizontally-scrollable surface spanning exactly 5 weeks, hard-bounded at both ends.

**Independent Test**: Scroll right from a fresh open; confirm continuous reveal up to the 5-week limit with a hard stop; scroll back left; confirm it stops exactly at the current week's Sunday.

**Note**: Unlike every other story in this feature, there is no additional implementation task here beyond Foundational - rendering exactly 35 fixed-width days inside a container whose scrollable width is exactly 5x its own visible width makes the lower bound (`scrollLeft: 0`) and upper bound (`scrollLeft: 4 * clientWidth`) an automatic consequence of native browser scrolling, with no extra bounding code required. This phase is pure verification of what Phase 2 already delivers.

- [X] T010 [US1] Manually verify via quickstart.md Scenario 1 (live, Chrome DevTools MCP against the running dev server): scrolling right reveals new days continuously with no flash/swap, up through the 5th week and no further; scrolling left stops exactly at the current week's Sunday (even if that's before today) and no further; the view can rest at any position, including straddling two weeks.

**Checkpoint**: User Story 1 is fully functional and independently testable - a safe, shippable increment even before the mini-calendar sync or jump controls are updated.

---

## Phase 4: User Story 2 - The mini-calendar always reflects what's actually in view (Priority: P2)

**Goal**: Scrolling the main grid keeps the mini-calendar's highlighted week and displayed month in sync, live, without any click.

**Independent Test**: Scroll until a new week's Sunday is the leftmost visible column; confirm the mini-calendar's highlight (and month, if it changed) updates immediately and keeps pace throughout a continuous scroll gesture.

### Implementation for User Story 2

- [X] T011 [US2] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, add an `onScroll` handler on the shared scroll container that computes the leading week index per research.md §4's formula (the smallest `i` in `0..4` such that `scrollLeft < i * containerClientWidth + containerClientWidth / 7`, reading `clientWidth` live from the container), and calls `setLeadingWeekIndex` together with `setWeekSlideDirection` (derived by comparing the new index to the previous one: higher → `'forward'`, lower → `'backward'`) only when the computed index actually differs from the current one - per data-model.md's `LeadingWeekIndex` transitions.
- [X] T012 [US2] In the same file, re-point the existing month-follow `useEffect` (feature 006, currently keyed off the now-removed `selectedWeekStart`) to key off `leadingWeekDays[0]` instead, so the mini-calendar's displayed month keeps following the new leading-week source exactly as it already followed the old one - per FR-006.
- [X] T013 [US2] In the same file, confirm the mini-calendar's `isSelectedWeek` check and the highlight-pill `layoutId` logic now compare each week-row's Sunday against `leadingWeekDays[0]` (not the removed `selectedWeekStart`).
- [X] T014 [US2] Manually verify via quickstart.md Scenario 2: the mini-calendar's highlight and displayed month update live during a single continuous scroll gesture (not only once scrolling stops), correctly following the leading week including across a month boundary.

**Checkpoint**: User Stories 1 AND 2 both work independently - scrolling is fully functional and the sidebar stays in sync.

---

## Phase 5: User Story 3 - Jumping to a specific week still works, and lands in a predictable spot (Priority: P2)

**Goal**: The week arrows, mini-calendar row clicks, and Today button each smoothly scroll to their target week, landing flush-left every time.

**Independent Test**: From any scroll position, click next-week, previous-week, a mini-calendar row, and Today; confirm each lands with the target week's Sunday flush against the left edge (Today always at the absolute start).

### Implementation for User Story 3

- [X] T015 [US3] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, rewrite `handlePrevWeek`/`handleNextWeek` to call `gridScrollRef.current.scrollTo({ left: clamp(leadingWeekIndex ± 1, 0, 4) * gridScrollRef.current.clientWidth, behavior: 'smooth' })` in place of the removed `goToWeek` slide-swap logic - per research.md §5.
- [X] T016 [US3] In the same file, rewrite the mini-calendar row click handler (`handleSelectWeek`) to compute the clicked week's index relative to `allDays[0]` (the fixed range's start) and either scroll there the same way (if the index is within `0..4`) or do nothing at all (if outside that range, e.g. a week reachable only via the mini-calendar's own unrestricted past browsing) - per research.md §8 and FR-007's edge case.
- [X] T017 [US3] In the same file, rewrite `handleToday` to scroll horizontally to `{ left: 0, behavior: 'smooth' }` (always the absolute start of the range, per research.md §5 - no index computation needed) while keeping its existing vertical "scroll to current hour" call (feature 007) and its existing in-progress-selection cancellation exactly as they are.
- [X] T018 [US3] In the same file, confirm every jump handler (both week arrows, the mini-calendar row click, and Today) still calls `cancelSelection()`, consistent with existing behavior - per FR-011.
- [X] T019 [US3] Manually verify via quickstart.md Scenario 3: each jump control lands exactly flush-left at its target week; a mini-calendar click for a week before the current week has no effect on the main grid; Today returns to the exact start and re-centers the vertical scroll on the current hour; an in-progress "Start" selection is cancelled by every jump.

**Checkpoint**: All of User Stories 1-3 work independently and together - full scroll + sync + jump navigation, still respecting the hard bounds.

---

## Phase 6: User Story 4 - See at a glance, without hovering, which slots can't be picked (Priority: P3)

**Goal**: Every disabled slot shows a small lock icon in addition to the existing muted background and tooltip.

**Independent Test**: Look (without hovering) at a disabled slot; confirm a small icon is visible, distinct from any selectable slot.

### Implementation for User Story 4

- [X] T020 [US4] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, add `Lock` to the existing `lucide-react` import line (already imports `X` from the same package - no new dependency).
- [X] T021 [US4] In the same file's per-slot disabled branch, render a small, low-opacity, centered `Lock` icon (`absolute inset-0 flex items-center justify-center`, `pointer-events-none` so it never interferes with the existing native tooltip/cursor) alongside the existing muted background - per FR-010 and research.md §9.
- [X] T022 [US4] Manually verify via quickstart.md Scenario 4: every disabled slot shows the icon without hovering; selectable slots show none; hovering a disabled slot still shows the existing native tooltip (feature 007) alongside the icon, with no regression.

**Checkpoint**: All four user stories complete and independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T023 Run `npx tsc -b` and `npx oxlint` against the final state of `EnvironmentUptimeRequestAvailabilityModalController.tsx`; confirm no new warnings/errors.
- [X] T024 Run the complete quickstart.md walkthrough (all 4 scenarios, in order, in one sitting) live via Chrome DevTools MCP against the running dev server, confirming no regression to features 006/007's booking-selection across what used to be week boundaries, today/current-time coloring, weekend muting, and the scroll-to-now-on-open behavior.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories. This is where the bulk of the architectural rewrite happens.
- **User Story 1 (Phase 3)**: Depends only on Foundational - and is almost entirely delivered by it (see the phase's Note). Independently shippable MVP.
- **User Story 2 (Phase 4)**: Depends only on Foundational (the `leadingWeekIndex`/`leadingWeekDays` state it updates).
- **User Story 3 (Phase 5)**: Depends only on Foundational (`gridScrollRef`, `leadingWeekIndex` for computing next/previous targets) - native `scrollTo()` works regardless of whether User Story 2's `onScroll` listener exists yet. Soft/observational note: a jump's effect on the mini-calendar is only *visible* once User Story 2 is also done, even though User Story 3's own acceptance criteria (the scroll lands in the right place) don't require it.
- **User Story 4 (Phase 6)**: Fully independent of Stories 1-3 - a pure additive visual change with no shared state.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Parallel Opportunities

None at the task level - every task edits the same single file.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) - this delivers nearly all of User Story 1 as a side effect.
2. Complete Phase 3 (User Story 1 - verification only).
3. **STOP and VALIDATE**: run quickstart.md Scenario 1 independently - a safe, shippable increment (mini-calendar sync and jump controls can lag behind without breaking anything, since they simply won't be live-synced to a scroll position yet).

### Incremental Delivery

1. Setup + Foundational → the scrollable, bounded grid itself is live.
2. User Story 1 → validate → MVP.
3. User Story 2 → validate → mini-calendar sync live.
4. User Story 3 → validate → jump controls rewired to scroll.
5. User Story 4 → validate → lock icon live.
6. Polish → full regression pass.

### Notes

- No `[P]` markers anywhere - every task touches the same one file.
- No automated tests (none exist in this repo); live manual verification via Chrome DevTools MCP per this project's standing practice.
