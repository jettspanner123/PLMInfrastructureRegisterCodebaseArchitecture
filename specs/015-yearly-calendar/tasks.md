---

description: "Task list for 015-yearly-calendar"
---

# Tasks: Yearly Maintenance Calendar Page

**Input**: Design documents from `/specs/015-yearly-calendar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test framework exists in this project; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) to confirm a clean baseline before this feature's new files/edits.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared constants and the small existing-file edits every part of this feature depends on — none of these require the new screen/sidebar components to exist yet.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Constants/ApplicationRouteCON.ts`, add `public static readonly YEARLY_CALENDAR: string = '/yearly-calendar';`.
- [X] T003 [P] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/Navigation/Constants/NavigationCON.ts`, add `{ id: 'yearly-calendar', label: 'Yearly Calendar', icon: CalendarRange }` (import `CalendarRange` from `lucide-react`, per research.md §8) to `PRIMARY_NAV_ITEMS`.
- [X] T004 In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/Navigation/NavigationController.tsx`, add a `location.pathname === ApplicationRouteCON.YEARLY_CALENDAR ? 'yearly-calendar' : ...` branch to the `currentView` derivation, and an `else if (next === 'yearly-calendar') navigate({ to: ApplicationRouteCON.YEARLY_CALENDAR });` branch to the segmented control's `onChange` (depends on T002/T003).
- [X] T005 [P] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Constants/YearlyCalendarCON.ts` exporting `MONTH_NAMES` (12 full month names), `WEEKDAY_ABBREVIATIONS` (Sunday-first: Sun, Mon, Tue, Wed, Thu, Fri, Sat), and `CALENDAR_ACTIVITY_SAMPLES: CalendarActivitySample[]` — a fixed, hand-authored dataset (per data-model.md's `CalendarActivitySample` fields: `id`, `title`, `startDate`/`endDate` as `YearMonthDay`-shaped values, `colorKey`) confined to a single month (per spec Edge Cases, no cross-month-boundary samples), including at least one activity spanning 3+ consecutive days and at least two activities whose date ranges overlap on 1+ shared days within that same month.

**Checkpoint**: The route constant, nav entry, and sample dataset all exist; the page isn't reachable yet (no route/component registered), but nothing blocks starting User Story 1.

---

## Phase 3: User Story 1 - Anyone can browse the yearly maintenance calendar by month (Priority: P1) 🎯 MVP

**Goal**: A publicly-reachable page shows a full, Sunday-first month grid with a year/month-picker sidebar, a Today control, today's date highlighted, no page header, this app's own design tokens, and a directional slide animation (both label and grid) on every month change.

**Independent Test**: Load the application with no admin session, open "Yearly Calendar" from the top navigation, confirm no login prompt, pick several months (including a different year) from the sidebar, confirm the grid updates correctly for each, use the Today control, and confirm the label and grid both animate directionally on every change.

### Implementation for User Story 1

- [X] T006 [US1] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Components/YearlyCalendarSidebarStaticComponent.tsx`: a year navigator (prev/next year arrows + year label) and a 12-month quick-select grid, structurally matching `SettingsSidebarStaticComponent.tsx`'s own sticky/full-height shell (`sticky top-16 h-[calc(100dvh-64px)]`, border/background tokens) but without its collapse toggle (per research.md §2's reuse of the existing generic sidebar slot), using this application's own design tokens throughout (never the reference file's own Teams-dark palette, per spec FR-008).
- [X] T007 [US1] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/YearlyCalendarScreenController.tsx`: a view-control toolbar (Today button, prev/next month arrow buttons, an animated month/year label using the `SLIDE_VARIANTS`/`AnimatePresence`/`SlideDirection` pattern per research.md §7) plus a Sunday-first, variable-row-count (4-6 rows) month day grid (per research.md §1) that also animates directionally as one unit on month change (research.md §7); today's date is visually distinguished when the current month is shown (FR-006); the component renders no page title/subtitle header block (FR-007); its root element uses negative margins to cancel `NavigationController`'s own `<main>` padding so the grid reads as full-bleed (research.md §3).
- [X] T008 [US1] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Routes/YearlyCalendarScreenRoute.tsx`: a thin Route wrapper rendering `YearlyCalendarScreenController`, mirroring every other `*ScreenRoute.tsx` in this codebase exactly (depends on T007).
- [X] T009 [US1] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Router/ApplicationRouter.tsx`: import `YearlyCalendarScreenRoute` and `YearlyCalendarSidebarStaticComponent`; add a `createRoute()` call (`path: ApplicationRouteCON.YEARLY_CALENDAR`, `component: YearlyCalendarScreenRoute`) and register it via `rootRoute.addChildren([...])`; add an `isYearlyCalendarRoute` check (`location.pathname === ApplicationRouteCON.YEARLY_CALENDAR`) in `RootLayout`, and extend the existing `sidebar={...}` prop expression so it passes `<YearlyCalendarSidebarStaticComponent />` when `isYearlyCalendarRoute` is true, `<SettingsSidebarStaticComponent />` when `isSettingsRoute` is true, and `undefined` otherwise (depends on T006, T008).
- [X] T010 [US1] Manually verify quickstart.md Scenarios 1 (no-login reachability, no page header), 2 (sidebar month/year picking, including a different year, across 28/29/30/31-day months), 3 (Today control + today's highlight), 5 (design-system/theme consistency in both light and dark mode), and 7 (directional slide animation on every way the month can change) live via Chrome DevTools MCP.

**Checkpoint**: The full browsing/navigation experience is complete and independently testable, with no sample activities yet.

---

## Phase 4: User Story 2 - A preview of how overlapping multi-day activities will look (Priority: P2)

**Goal**: The month grid renders the fixed sample activities from `YearlyCalendarCON.CALENDAR_ACTIVITY_SAMPLES`, with multi-day activities spanning their full date range as one continuous bar, and overlapping activities each individually visible via a per-week-row lane assignment, with no fixed overlap limit.

**Independent Test**: With the grid showing the sample month, confirm the multi-day sample activity spans its full range as one bar, confirm the overlapping sample activities each render as their own distinct, individually-visible bar/lane, and confirm the data reads clearly as a preview, not real data.

### Implementation for User Story 2

- [X] T011 [US2] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/YearlyCalendar/Helpers/CalendarActivityLaneAssignmentHelper.ts`: for a given week row (7 consecutive `YearMonthDay` values) and the full `CALENDAR_ACTIVITY_SAMPLES` list, return every activity touching that week paired with its assigned lane index — the lowest-numbered lane (0, 1, 2, …) such that no two activities sharing a lane overlap on any day within that week row (per data-model.md's `CalendarActivityLaneAssignment` and research.md §6's greedy per-week algorithm; no fixed maximum lane count, per spec FR-011).
- [X] T012 [US2] In `YearlyCalendarScreenController.tsx`, for each rendered week row, call the lane-assignment helper (T011) and render each returned activity as a bar positioned in its assigned lane, spanning from its start day's column through its end day's column within that week (clipped to the week's own 7 columns — a multi-week activity renders as a separate, continuous-looking bar segment in each week row it touches), using fixed, hand-picked colors per `colorKey` so overlapping activities stay visually distinguishable (FR-010/FR-012).
- [X] T013 [US2] Manually verify quickstart.md Scenario 6 (the multi-day sample activity reads as one continuous span; the overlapping sample activities are all individually visible with none hidden; the data reads clearly as a preview, not real operational data) live via Chrome DevTools MCP.

**Checkpoint**: Both user stories are complete; the page fully matches the amended spec.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T014 Run `npx tsc -b` and `npx oxlint` (frontend) against the final state of every file touched by this feature, confirming no new warnings/errors.
- [X] T015 Run the complete quickstart.md walkthrough (all 7 scenarios, in one sitting) live via Chrome DevTools MCP, in both light and dark mode, for both a logged-out visitor and an admin session, confirming no regression to any other existing page, nav item, or route.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories.
- **User Story 1 (Phase 3)**: Depends only on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational AND on User Story 1 (needs the week-row grid structure T007 builds before activities can be laid onto it — per spec's own "Why this priority" for User Story 2).
- **Polish (Phase 5)**: Depends on both user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Foundational only.
- **User Story 2 (P2)**: Foundational + User Story 1 (not independent of it, unlike most features in this session — the spec itself states this dependency).

### Parallel Opportunities

- T002 and T003 (different files) can run in parallel; T005 (a new file) can run in parallel with both.
- T006 (sidebar component) and T007 (screen controller) touch different files and can run in parallel with each other, though both are prerequisites for T008/T009.
- T011 (the lane-assignment helper, a new file) can be written in parallel with T006/T007, but T012 (which calls it from inside `YearlyCalendarScreenController.tsx`) must wait for both T007 and T011 to be done, since it edits the same file T007 created.

---

## Parallel Example: Foundational Phase

```bash
# Launch the independent foundational edits together:
Task: "Add YEARLY_CALENDAR route constant in ApplicationRouteCON.ts (T002)"
Task: "Add the 'yearly-calendar' nav item in NavigationCON.ts (T003)"
Task: "Create YearlyCalendarCON.ts with month/weekday labels and the sample activity dataset (T005)"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1) — the full browsing/navigation experience, independently shippable on its own.
3. **STOP and VALIDATE**: run quickstart.md Scenarios 1, 2, 3, 5, 7.
4. Add Phase 4 (User Story 2) — the overlapping-activity preview, building on US1's own grid.
5. Complete Phase 5 (Polish): final `tsc`/`oxlint` check and the complete 7-scenario quickstart.md walkthrough.

### Notes

- No automated tests exist in this repo; live manual verification via Chrome DevTools MCP per this project's standing practice.
- Unlike most features this session, User Story 2 is NOT independent of User Story 1 — it extends the same `YearlyCalendarScreenController.tsx` file T007 creates, so T012 must run after T007, not in parallel with it.
