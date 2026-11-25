---

description: "Task list for 014-calendar-modal-theming"
---

# Tasks: Calendar Modal Light/Dark Theming

**Input**: Design documents from `/specs/014-calendar-modal-theming/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test framework exists in this project; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) to confirm a clean baseline before this feature's edits.

---

## Phase 2: Foundational (Blocking Prerequisites)

None — there is no shared infrastructure this single-component styling change depends on.

---

## Phase 3: User Story 1 - The calendar modal matches the application's active theme (Priority: P1) 🎯 MVP

**Goal**: Every chrome color in `EnvironmentUptimeRequestAvailabilityModalController.tsx` gains a light-mode value, per research.md's token maps, while every existing dark-mode value is preserved unchanged behind `dark:`; booking/status event card colors and the modal's accent/interactive blues stay untouched.

**Independent Test**: With the application in light mode, open the calendar modal and confirm its background, sidebar, borders, and text tones read as light-mode-appropriate; switch to dark mode and confirm it renders exactly as it does today.

**Note**: Every task below edits the same single file, so despite none being marked `[P]`, they must run sequentially in the order listed — not in parallel.

### Implementation for User Story 1

- [X] T002 [US1] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`'s close button and root content wrapper, add light-mode classes alongside the existing `dark:`-wrapped values: close button `hover:bg-slate-100 dark:hover:bg-[#292929]` (text stays `text-gray-400 hover:text-slate-900 dark:hover:text-white`); root wrapper `text-slate-900 dark:text-[#f5f5f5]` (per research.md's background/text-tone maps).
- [X] T003 [US1] In the `<aside>` sidebar section (lines ~681-775), add light-mode classes alongside every existing `dark:`-wrapped value: sidebar background `bg-white dark:bg-[#141414]` and border `border-slate-200 dark:border-[#2b2b2b]`; "Calendar" heading `text-slate-900 dark:text-white`; month-nav row text `text-slate-500 dark:text-[#c8c8c8]` with hover `hover:text-slate-900 dark:hover:text-white`; chevron icons `text-gray-400 hover:text-slate-900 dark:hover:text-white`; month label `text-slate-700 dark:text-[#e1dfdd]`; weekday header row `text-slate-400 dark:text-[#979797]`; mini-calendar week-row hover `hover:bg-slate-100 dark:hover:bg-[#1c1c1c]`; selected-week highlight pill `bg-indigo-50 dark:bg-[#28273b]`; mini-calendar day text per research.md's mapping (today badge unchanged `bg-[#5b5fc7] text-white`; selected-week day `text-slate-900 dark:text-white`; current-month non-selected day `text-slate-600 dark:text-[#d6d6d6]`; other-month day `text-slate-400 dark:text-[#979797]`); bottom chevron `text-gray-500 hover:text-slate-900 dark:hover:text-gray-300`; divider `bg-slate-200 dark:bg-[#2b2b2b]`.
- [X] T004 [US1] In the `<main>` top action bar (lines ~779-824), add light-mode classes alongside every existing `dark:`-wrapped value: main background `bg-white dark:bg-[#141414]`; header border `border-slate-200 dark:border-[#2b2b2b]` and text `text-slate-500 dark:text-[#c8c8c8]`; sidebar-toggle/Today/week-nav buttons' hover background `hover:bg-slate-100 dark:hover:bg-[#292929]`; Today button border `border-slate-200 dark:border-[#2b2b2b]` and text `text-slate-700 dark:text-[#e1dfdd]`; week-nav icon buttons `text-gray-400 hover:text-slate-900 dark:hover:text-white`; week-range label row hover `hover:bg-slate-100 dark:hover:bg-[#292929]` and text `text-slate-900 dark:text-white`.
- [X] T005 [US1] In the calendar grid container (lines ~827-914, excluding event cards), add light-mode classes alongside every existing `dark:`-wrapped value: grid background `bg-white dark:bg-[#141414]`; day-header row/corner cell border `border-slate-200 dark:border-[#2b2b2b]` and sticky background `bg-white dark:bg-[#141414]`; weekend-day tint `bg-slate-50 dark:bg-[#1a1a1a]`; weekday abbreviation `text-slate-400 dark:text-[#979797]`; hour-label column `text-slate-400 dark:text-[#979797]`, border `border-slate-200 dark:border-[#2b2b2b]`, and sticky background `bg-white dark:bg-[#141414]`; per-day column border `border-slate-200 dark:border-[#2b2b2b]`; hour-row border `border-b border-slate-200 dark:border-[#2b2b2b]`; disabled-slot background `bg-slate-100 dark:bg-[#101010]`; disabled-slot lock icon `text-slate-400/60 dark:text-[#5c5c5c]/60`. Do NOT touch the day-number accent (`text-[#5b9bd5]`), the building icon (`text-[#7070b8]`), the "Today"/"Start" badge (`bg-[#5b5fc7] text-white`), or any of the `rgba(91,95,199,...)`/`rgba(123,131,235,...)` selection/preview overlays — these stay exactly as they are today, per spec FR-004/Assumptions.
- [X] T006 [US1] Confirm no light-mode class was added to any booking/status event card: `BOOKING_STATUS_CARD_STYLES` (Pending/Approved/Completed), the downtime card's fixed `bg-[#5a2323]`/`bg-[#e35b5b]`/`bg-[#7a3232]` colors, and every text color inside an event card (`text-white`, `text-[#c8c8c8]`) must remain exactly as they are today in both themes — per spec FR-004 (a verification-only task; no code change expected here).
- [X] T007 [US1] In the raw `<style>` block's scrollbar rules (lines ~653-657), replace the single unconditional track/thumb/thumb-hover rule set with a `.dark`-gated pair: light-mode values (`track: #f1f5f9`, `thumb: #cbd5e1`, `thumb hover: #94a3b8`, per research.md's scrollbar map) as the default `.ta-teams-calendar-scope` rule, and the existing dark values (`#141414`/`#333333`/`#444444`) moved under a `.dark .ta-teams-calendar-scope` (or equivalent `:where(.dark, .dark *)` per this app's existing `@variant dark` convention) override — since this raw CSS isn't reachable by Tailwind's `dark:` class variant.
- [X] T008 [US1] Manually verify quickstart.md Scenarios 1-5 live via Chrome DevTools MCP: new light-mode palette renders correctly; dark mode is pixel-identical to before; status/event card colors are unaffected by theme; every interactive/selection state (hover, start, preview, today/current-hour highlight, selected-week pill) remains legible in light mode, including confirming the left-as-is accent-blue tones (today badge, day-number accent, building icon) still read clearly; the modal updates live if the theme is toggled while it's open.

**Checkpoint**: The entire feature is complete and independently testable by toggling light/dark mode with the modal open.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T009 Run `npx tsc -b` and `npx oxlint` (frontend) once more against the final state to confirm no new warnings/errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: N/A — empty phase, nothing blocks User Story 1.
- **User Story 1 (Phase 3)**: Depends only on Setup. T002-T007 all touch the same single file and must run sequentially, in order; T008 depends on T002-T007 all being done.
- **Polish (Phase 4)**: Depends on User Story 1 being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on any other story — this feature has exactly one user story.

### Parallel Opportunities

- None — every implementation task (T002-T007) edits the same single file, so none are marked `[P]` despite being organized by region for clarity.

---

## Implementation Strategy

### MVP First (and only) Scope

1. Complete Phase 1 (Setup).
2. Complete Phase 3 (User Story 1) — T002 through T008, in order. This is the entire feature.
3. Complete Phase 4 (Polish): final `tsc`/`oxlint` check.

### Notes

- No automated tests exist in this repo; live manual verification via Chrome DevTools MCP per this project's standing practice.
- Every task touches `EnvironmentUptimeRequestAvailabilityModalController.tsx` — there is no incremental-delivery story beyond completing them in sequence.
