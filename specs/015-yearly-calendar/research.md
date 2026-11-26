# Research: Yearly Maintenance Calendar Page

No `[NEEDS CLARIFICATION]` markers remain — both open forks were resolved in `/speckit-specify`'s own clarification round. This phase records the concrete technical decisions, each grounded in a direct read of this codebase's existing patterns (via a research sub-agent, same session).

## 1. Month-grid algorithm: a new, local Sunday-first variable-row matrix builder

**Decision**: Build a small, local (not shared/extracted) function that produces one row per full Sunday-to-Saturday week needed to contain the selected month's days — 4, 5, or 6 rows depending on the month — leading/trailing days from adjacent months filled in only enough to complete the first/last row, visually de-emphasized.

**Rationale**: Two existing components already build their own month/week matrices, and neither matches what this feature needs outright:
- `CustomDatePickerSharedComponent.tsx` (lines ~95-129) builds a **fixed 6-row/42-cell**, **Monday-first (ISO)** grid — wrong week-start convention, and a fixed row count would needlessly pad short months with two often-empty adjacent-month rows.
- `EnvironmentUptimeRequestAvailabilityModalController.tsx` builds a **Sunday-first**, **variable-row** `weeksMatrix` (via its own `getSundayOfWeek`/`addDays`/`YearMonthDay` helpers) for its mini-calendar — the correct week-start convention and row-count behavior, but scoped to a 5-week *rolling* window from today, not "every week needed to show one full calendar month."

The reference file (`YEARLY_CALENDAR_VIEW.html`) itself uses exactly this variable-row, Sunday-first shape (its November 2026 sample renders 5 rows; a 30-day month starting on a different weekday would render 4 or 6), confirming this is the right target shape, not an implementation detail invented for this feature.

**Alternatives considered**:
- *Reuse `CustomDatePickerSharedComponent`'s loop as-is* — rejected: wrong week-start convention (Monday vs Sunday) and wrong row-count behavior (fixed 6 vs the reference's variable rows).
- *Extract a shared `MonthMatrixUtility` now, used by all three call sites* — rejected: the two existing call sites have never needed to agree with each other (different week-start conventions, serving different UI shapes), and retrofitting them into a shared utility is a larger, riskier change than this feature's own scope calls for; three similar-but-not-identical implementations is an acceptable, smaller diff than a premature shared abstraction forcing two unrelated existing features to also change.

## 2. Reusing the existing generic sidebar slot, not inventing a new layout mechanism

**Decision**: `RootLayout` (in `ApplicationRouter.tsx`) gains an `isYearlyCalendarRoute` check (`location.pathname === ApplicationRouteCON.YEARLY_CALENDAR`) alongside its existing `isSettingsRoute` check, and passes `<YearlyCalendarSidebarStaticComponent />` through `NavigationController`'s existing `sidebar` prop when true.

**Rationale**: `NavigationController.tsx`'s own `sidebar` prop is already documented as "screen-agnostic... any route could pass one later" and `RootLayout` is explicitly where "which routes do" is decided, not inside `NavigationController` itself. Settings is the only current user of this slot (`SettingsSidebarStaticComponent`), proving the mechanism already generalizes beyond its first use case exactly as designed.

**Alternatives considered**:
- *A second, parallel sidebar mechanism built just for this page* — rejected: the existing slot already does exactly what's needed (sits flush against the viewport edge, outside the centered content column), per `NavigationController.tsx`'s own comment; building a second one would duplicate working infrastructure for no benefit.

## 3. Full-bleed main grid: reusing the calendar modal's own negative-margin escape hatch

**Decision**: `YearlyCalendarScreenController.tsx`'s own root element uses negative margins (mirroring `EnvironmentUptimeRequestAvailabilityModalController.tsx`'s `-m-5 sm:-m-6` pattern, sized to cancel `NavigationController`'s own `<main className="... px-3 sm:px-6 lg:px-8 py-8">` padding instead of a modal's) so the month grid reads as a full-bleed pane filling "the space left other than the sidebar," per the spec's own wording, rather than a narrow column constrained by the shared `max-w-7xl` + padding every other page's content renders into.

**Rationale**: This exact escape-hatch technique (negative margins canceling an ancestor's own padding, rather than restructuring the ancestor) is already proven working in this codebase for the same underlying problem (a calendar grid needing to fill all available space, not sit inside a padded column) — reusing it is smaller and more consistent than introducing a new "full-width page" mechanism, and the existing `html.full-width-layout` toggle (the Resources table's own user-togglable preference) doesn't apply here, since this page's full-bleed layout isn't a user preference, it's this page's own fixed design.

**Alternatives considered**:
- *Make this route use the existing `html.full-width-layout` class unconditionally* — rejected: that class is wired to a user-facing, per-session toggle (the profile dropdown's own Layout Width preference) that affects the *entire* app shell's max-width, including the header's own content row; repurposing it as a per-route, non-optional setting would conflate two unrelated concerns and could unexpectedly widen the header row on this page too.
- *Restructure `NavigationController`'s shared `<main>` to accept a "no padding" variant* — rejected: broader surface-area change than necessary when the modal's own already-proven escape hatch solves the identical underlying problem locally, without touching shared layout code at all.

## 4. "No page header": confirmed as an omission, not a special mechanism

**Decision**: `YearlyCalendarScreenController.tsx` simply never renders the title/subtitle block every other page's own component currently repeats (e.g. Infrastructure Register's own `<h1>Infrastructure Register</h1>` + `<p>...</p>`, defined inside `ResourcesScreenController.tsx` itself, not in any shared layout).

**Rationale**: Confirmed via direct inspection that `RootLayout`'s own shared shell (`NavigationController` + `<Outlet />`) contains no page title/subtitle JSX at all — each page's own screen controller owns and repeats that header markup itself. "No page header" therefore requires no opt-out flag or shared-layout change; it's simply never written for this one page.

**Alternatives considered**: None — this was a confirmed fact, not a design choice with alternatives.

## 6. Overlapping multi-day sample activities: a lane-assignment algorithm, computed per week

**Decision**: For each week row in the grid, every sample activity that touches that week is assigned to the lowest-numbered display "lane" (0, 1, 2, …) such that no two activities sharing a lane overlap on any day within that week — a greedy interval-packing pass, recomputed fresh per week row (an activity spanning multiple weeks can land in a different lane in each week it touches, which is fine since each week's row is visually independent). Each lane renders as its own horizontal strip within the week row, so two overlapping activities simply occupy different strips rather than fighting for the same space.

**Rationale**: This is the same shape of problem every day/week/month-grid calendar UI solves (Google Calendar, Outlook, the reference file's own "N more items" stacking) — spec FR-011/FR-012 require no fixed overlap limit and that every overlapping activity stay individually visible, which rules out a fixed-slot-count approach (e.g. "always exactly 2 rows of event bars") in favor of a real packing algorithm that scales to however many activities actually overlap. Doing the assignment per week (not once globally) keeps it simple: each week row only ever needs to reason about the handful of activities touching those specific 7 days, not the whole month or year.

**Alternatives considered**:
- *A fixed maximum number of visible lanes, with a "+N more" overflow indicator past that limit* (matching the reference file's own `▾ 2 more items` pattern) — rejected for this pass: the reference file's own version exists because its sample data is dense and realistic; this feature's sample data (per spec Assumptions) is deliberately sized to demonstrate the overlap behavior clearly, so an overflow affordance would add UI complexity without anything in this pass's own fixed dataset ever needing it. Worth revisiting once real, denser activity data exists in a future feature.
- *A single global lane-assignment pass across the whole visible month at once* — rejected: more complex (has to reason about every week simultaneously) for no visible benefit, since each week row is laid out independently anyway.

## 7. Month-change animation: the existing slide-transition pattern, applied to two elements

**Decision**: Reuse `EnvironmentUptimeRequestAvailabilityModalController.tsx`'s own `SLIDE_VARIANTS`/`AnimatePresence`/direction-tracking pattern (the same `forward`/`backward`/`null` `SlideDirection` type, the same `custom={direction}` + `initial`/`animate`/`exit` variant shape) for two separate elements on this page: the month/year label (narrow, text-only, exactly like that modal's own `SlidingLabel`) and the day grid itself (the full set of week rows, keyed by month+year, sliding as one unit). Direction is derived the same way that modal already computes it (`directionBetween`, comparing the new month/year against the previous one) for every way the viewed month can change: the arrow buttons, the sidebar's month-pick, and the Today control.

**Rationale**: Spec FR-013/Clarifications ask for exactly this: both the label and the grid slide, directionally, on every month change. This codebase already has a proven, working implementation of directional slide-on-change for a month/week label; applying the identical technique to a second, larger element (the grid) is a small, low-risk extension of working code, not a new animation approach.

**Alternatives considered**:
- *A different animation library or CSS-only transition* — rejected: `motion/react` (the existing dependency used everywhere else in this codebase for this exact kind of transition) already does this well; introducing a second animation approach for one page would be inconsistent with how every other animated transition in this app is built.

## 8. Nav-item wiring follows the existing `id`-based pattern exactly

**Decision**: Add `{ id: 'yearly-calendar', label: 'Yearly Calendar', icon: CalendarRange }` to `NavigationCON.PRIMARY_NAV_ITEMS`; add a `location.pathname === ApplicationRouteCON.YEARLY_CALENDAR ? 'yearly-calendar' : ...` branch to `NavigationController.tsx`'s own `currentView` derivation; add an `else if (next === 'yearly-calendar') navigate({ to: ApplicationRouteCON.YEARLY_CALENDAR })` branch to its segmented control's `onChange`.

**Rationale**: This is the exact, already-established pattern every existing nav item follows (confirmed for Environment Overview, Feature Requests, and Uptime Request) — no new nav-item shape or wiring mechanism is needed. `CalendarRange` (an already-available `lucide-react` icon, the same package every other nav item's icon already comes from) is chosen to read distinctly from Uptime Request's own `CalendarClock` icon while still clearly signaling "calendar."

**Alternatives considered**: None — this is a direct, low-risk application of an existing, uncontested pattern.
