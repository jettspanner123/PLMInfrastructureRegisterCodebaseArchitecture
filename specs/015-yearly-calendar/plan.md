# Implementation Plan: Yearly Maintenance Calendar Page

**Branch**: `015-yearly-calendar` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-yearly-calendar/spec.md`

## Summary

A new, publicly-reachable page shows a full month-at-a-time calendar grid with a left sidebar for picking any month/year, adapted from `YEARLY_CALENDAR_VIEW.html`'s structural layout but rebuilt with this application's own React components, routing, and design tokens. The sidebar reuses `NavigationController`'s existing generic `sidebar` slot (today used only by Settings); the main grid escapes the shared layout's centered `max-w-7xl` column the same way the Uptime Request calendar modal already escapes its own modal's padding, so it reads as a full-bleed grid rather than a narrow, padded column. Per the spec's amended scope (Round 2), the grid also renders fixed, hand-authored sample activities — some spanning multiple consecutive days, some deliberately overlapping — using a lane-assignment algorithm so every overlapping activity stays individually visible; this sample data is preview-only, with no backend behind it. Changing the viewed month animates both the month/year label and the day grid itself with a directional slide, reusing the exact slide-transition technique already proven in the Uptime Request calendar modal. No backend work, no admin-gated interaction — this plan covers viewing/navigation plus a static visual preview of the future activity model, per the spec's own Clarifications.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 — no new language/runtime.

**Primary Dependencies**: TanStack Router (new route), Tailwind CSS v4 (existing design tokens), `motion/react` (existing sidebar-animation pattern), `lucide-react` (existing icon set) — zero new dependencies.

**Storage**: N/A — no backend, no database, no persisted event data (per spec FR-009 and Clarifications).

**Testing**: No automated test framework exists in this project; verification is manual, live, via Chrome DevTools MCP, covering month/year navigation, the "Today" control, leap-year February, and both themes.

**Target Platform**: Web — a new top-level page reachable from the existing top navigation.

**Project Type**: Web application (frontend-only; the backend project is untouched, consistent with the spec's own deferral of event data/admin-gated mutation to a later feature).

**Performance Goals**: None beyond existing — a client-side date computation per month change, no network calls.

**Constraints**:
- The month-day grid must use a Sunday-first week, matching `YEARLY_CALENDAR_VIEW.html`'s own weekday header order (per spec Assumptions) — this differs from `CustomDatePickerSharedComponent.tsx`'s own Monday-first (ISO) convention, so that component's loop is adapted, not reused as-is.
- The grid's row count must vary by month (4–6 full Sunday-to-Saturday weeks, whatever each month actually needs), matching `EnvironmentUptimeRequestAvailabilityModalController.tsx`'s own existing `weeksMatrix` precedent (variable rows) rather than `CustomDatePickerSharedComponent.tsx`'s own fixed 6-row/42-cell grid.
- No shared, reusable month-matrix utility exists today (confirmed: two existing components each build their own, with different week-start conventions) — this feature adds its own local Sunday-first matrix builder rather than first extracting a shared utility other features don't yet need.
- The page must not render the standard per-page title/subtitle header block (per spec FR-007) — since that header is just repeated JSX inside each existing page's own component (confirmed: no shared layout header to opt out of), this page's own screen controller simply never includes that block.
- The page's sidebar reuses `NavigationController`'s existing generic `sidebar` prop (today passed only for Settings, gated by `RootLayout`'s own `isSettingsRoute` check) — `RootLayout` gains a matching `isYearlyCalendarRoute` check alongside it, so the mechanism stays "any route can opt in," not hardcoded to Settings.
- The main grid needs to render edge-to-edge, not inside the shared layout's `max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8` padded column that every route's `children` renders into — the same escape-hatch technique `EnvironmentUptimeRequestAvailabilityModalController.tsx` already uses for its own full-bleed calendar inside a padded modal (negative margins canceling the ancestor's own padding) is reused here, rather than restructuring the shared layout itself.
- No admin-gating logic is added in this pass — the spec explicitly defers the "add event" capability (and the `useIsAdmin()` check that would gate it) to a future, backend-integrated feature.
- Sample activity data (per spec FR-009–FR-012) is fixed, hand-authored, local constant data — not fetched, not user-editable, confined to whichever single month it's meant to demonstrate (per spec Edge Cases, no cross-month-boundary clipping needed).
- Overlapping sample activities need a lane-assignment algorithm (research.md §6) so every one stays individually visible (spec FR-012) — a small, local, non-shared helper, since no comparable "pack overlapping date ranges into non-overlapping lanes" utility exists anywhere in this codebase yet.
- The month-change animation must slide both the label and the grid together (per spec FR-013/Clarifications) — broader than the calendar modal's own precedent (which only ever slides a text label, never the grid of day cells beneath it), so the existing `SLIDE_VARIANTS`/`AnimatePresence` pattern is applied to two elements here, not one.

**Scale/Scope**: One new frontend feature folder (`Features/YearlyCalendar/`, with a screen controller, a sidebar component, a constants file for month/weekday labels plus the fixed sample-activity data, and a small helper for the overlap-lane algorithm), one new thin Route wrapper, one new route constant, one new nav-item entry, and 2 small edits to existing shared files (`NavigationController.tsx` for the view-mapping/navigate branch, `ApplicationRouter.tsx` for route registration and the sidebar-slot condition). Zero backend changes, zero new dependencies, zero new shared/cross-cutting utilities.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template — no project-specific principles to gate against. Vacuous pass.

## Project Structure

### Documentation (this feature)

```text
specs/015-yearly-calendar/
├── plan.md              # This file
├── research.md           # Phase 0 output
├── data-model.md         # Phase 1 output
└── quickstart.md         # Phase 1 output
```

No `contracts/` directory — this feature exposes no new or changed backend interface; it is a frontend-only viewing/navigation experience with no event data source yet.

### Source Code (repository root)

```text
PLMInfrastructureRegisterClientServiceLayerMSC/src/
├── Constants/ApplicationRouteCON.ts                              # EDIT: add YEARLY_CALENDAR = '/yearly-calendar'
├── Features/Navigation/
│   ├── Constants/NavigationCON.ts                                 # EDIT: add the 'yearly-calendar' entry to PRIMARY_NAV_ITEMS
│   └── NavigationController.tsx                                   # EDIT: currentView mapping + navigate() branch for the new nav item
├── Features/YearlyCalendar/                                       # NEW feature folder
│   ├── YearlyCalendarScreenController.tsx                         # NEW — view-control toolbar (Today, prev/next month, animated month/year label) + the Sunday-first variable-row month grid (also animated) with sample activity bars laid out via the lane-assignment helper; no page header block
│   ├── Constants/
│   │   └── YearlyCalendarCON.ts                                   # NEW — month names, weekday headers, and the fixed sample-activity dataset (per spec FR-009)
│   ├── Helpers/
│   │   └── CalendarActivityLaneAssignmentHelper.ts                 # NEW — packs overlapping multi-day sample activities into non-overlapping display lanes (research.md §6)
│   └── Components/
│       └── YearlyCalendarSidebarStaticComponent.tsx                # NEW — year navigator + 12-month quick-select, passed via NavigationController's existing `sidebar` slot
├── Routes/YearlyCalendarScreenRoute.tsx                            # NEW — thin Route wrapper, mirrors every other *ScreenRoute.tsx
└── Router/ApplicationRouter.tsx                                    # EDIT: new createRoute() + addChildren registration + isYearlyCalendarRoute sidebar-slot condition
```

**Structure Decision**: A small, self-contained new feature folder plus the minimum edits to the three existing files every new top-level page with a nav entry already has to touch (route constant, nav constant/controller, router). No new shared component, no new utility file — the sidebar reuses the existing generic slot mechanism, and the full-bleed grid reuses the existing negative-margin escape-hatch pattern, both already proven elsewhere in this codebase.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — vacuous Constitution Check pass, no new dependencies, no new backend surface, no new shared utility.
