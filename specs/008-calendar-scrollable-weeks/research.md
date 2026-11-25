# Research: Scrollable Multi-Week Calendar Grid

No `[NEEDS CLARIFICATION]` markers remain (resolved via two rounds of clarification in conversation before `spec.md` was written). This phase works out how to actually build what was agreed.

## 1. Layout technique: a CSS-percentage-based wide strip, no pixel math, no virtualization

**Decision**: Keep the existing scroll container (`gridScrollRef`) exactly as-is for vertical hour scrolling, but change its horizontal overflow from `overflow-x-hidden` to `overflow-x-auto`. Inside it, replace the current per-week `AnimatePresence`-wrapped 7-column row (both in the day-header row and the hour-grid body) with one plain, un-animated row whose own width is set to `500%` of the scroll container's width, containing all 35 day-columns as `flex-1` children. Since percentage widths resolve against the containing block, 35 equal `flex-1` children inside a `500%`-wide row each render at exactly `(5 x containerWidth) / 35 = containerWidth / 7` px - identically matching today's per-column width (container width / 7), with zero JavaScript-measured pixel values and zero virtualization/windowing library.

**Rationale**: 840 total slot cells (35 days x 24 hours) is a small, cheap DOM for any modern browser to render and scroll natively - introducing a virtualization library would be solving a problem that doesn't exist here, and would be a new dependency for a "static for now" feature that explicitly doesn't need one. The percentage-based sizing technique needs no `ResizeObserver` or stored pixel state either - it's fully responsive to the modal's own two existing size breakpoints (near-full-screen gutter vs. fixed 1680x900) automatically, the same way today's single-week `flex-1` columns already are.

**Alternatives considered**: `ResizeObserver` + JS-computed pixel widths stored in state - rejected, strictly more code and a re-render on every resize for no behavioral benefit over a pure-CSS percentage solution. A virtualization/windowing library (e.g. rendering only the ~7-10 columns near the viewport) - rejected as unnecessary complexity for a DOM this small.

## 2. Frozen corner, frozen header, frozen left (hour) column

**Decision**: The existing `w-12` corner spacer (inside the sticky day-header row) becomes additionally `sticky left-0` (on top of its existing `sticky top-0`), giving it a frozen top-left corner, with a `z-index` higher than the day-header content. The existing `w-12` hour-label column (inside the hour-grid body row) becomes `sticky left-0` (no `top`, since it should keep scrolling vertically with the hour rows, just stay pinned horizontally) with a `z-index` above the day-columns' slot content.

**Rationale**: This is the standard "frozen pane" technique (a spreadsheet/calendar staple - pinned corner + pinned header row + pinned leftmost column, scrollable body) achieved entirely with `position: sticky` on elements that are already direct children of the one shared scrollable container - no separate scroll-sync code needed between a "header" and a "body," since they're the same scrolling context.

## 3. State model: `leadingWeekIndex` replaces `selectedWeekStart` as mutable state

**Decision**: `selectedWeekStart` as a clickable/settable `useState` goes away. What renders is now always fixed - all 35 days, every time the modal is open - computed fresh each render as `allDays = Array.from({length: 35}, (_, i) => addDays(getSundayOfWeek(todayYmd), i))`, the same "recompute fresh every render" pattern already used for `todayYmd`/`currentHour` (feature 006 research.md §2). In its place, a new `leadingWeekIndex` (`0..4`) state tracks which week is currently "in sync" with the sidebar - driven primarily by scroll position (§4 below), not by clicks.

**Rationale**: Once content is always-fully-rendered and fixed, "which week is selected" stops being a rendering concern and becomes purely a display-sync concern (what the mini-calendar highlights, what the header label reads) - cleanly separating "what's on screen" from "what we're telling the sidebar is current," which is exactly the relationship FR-005/FR-006 describe.

## 4. Computing the "leading week" from scroll position

**Decision**: An `onScroll` listener on the shared scroll container computes, on every native scroll event, the smallest week index `i` (`0..4`) whose Sunday column (absolute position `i * columnWidth * 7` to `i * columnWidth * 7 + columnWidth`) still has any pixel on screen at the current `scrollLeft` - equivalently, the smallest `i` such that `scrollLeft < i * containerWidth + containerWidth/7`. `columnWidth`/`containerWidth` are read directly from the container's own `getBoundingClientRect()`/`clientWidth` at scroll time (no stored/stale pixel state). The computed index only triggers a `setLeadingWeekIndex` call when it actually differs from the current value, to avoid redundant re-renders on every scroll-event tick.

**Rationale**: Directly implements the user's chosen rule ("whichever week's Sunday is the leftmost day-column still visible") literally and cheaply - simple arithmetic on every scroll tick, no `IntersectionObserver` needed since the geometry is fully predictable (fixed-width columns in a single scroll axis). One practical consequence worth being explicit about since it follows directly from the chosen rule: the leading week flips forward as soon as the old week's Sunday column (1/7 of a week's width) has fully scrolled past - i.e., after scrolling roughly one day-column's width into a transition, not after the new week is mostly in view. This is the literal behavior the "leftmost Sunday still visible" rule was chosen over "most visible area" for (recommended and selected specifically for its simplicity), and gives a natural "sliding 7-day window" feel consistent with the rest of the feature's free-scroll design.

**Alternatives considered**: `IntersectionObserver` with a sentinel element at each week boundary - works too, but is strictly more moving parts (observer setup/teardown, per-boundary refs) for a geometry that a single scroll-position formula already covers cheaply and exactly.

## 5. "Jump to week" targets, reusing the existing scroll ref

**Decision**: The next-week/previous-week arrows, mini-calendar row clicks, and Today all call `gridScrollRef.current.scrollTo({ left: targetWeekIndex * gridScrollRef.current.clientWidth, behavior: 'smooth' })` - reusing the exact same ref feature 007 already uses for the vertical "scroll to current hour" behavior, just now also driving horizontal scroll. `targetWeekIndex` is clamped to `0..4`. Today's target is always `0` (`scrollLeft: 0`), since the current week is always the first week in the fixed range - simpler than computing an index at all for that one action.

**Rationale**: No new ref, no new measurement infrastructure - `clientWidth` at the moment of the click is always current (not cached), so this stays correct across the modal's two responsive size tiers with no extra code. A pleasant side effect: because the §4 scroll listener fires continuously during a `behavior: 'smooth'` native scroll animation just as it does during a manual drag, the mini-calendar's sync updates progressively as a jump animates, with no special-casing needed between "user-dragged" and "button-triggered" scrolling - one mechanism covers both.

**Alternatives considered**: Storing a separate measured container width in state - rejected as unnecessary; reading `clientWidth` synchronously at click time is simpler and can't go stale.

## 6. Absolute day-indexing (0-34) replaces per-week-local indexing (0-6)

**Decision**: Every place that currently takes a `dayIndex` assumed to be `0..6` relative to one displayed week (`isSlotDisabled`, `getSlotIndex`, `handleSlotClick`'s multi-day-span math, the `TeamsCalendarEvent.day` field, the per-column render loop) continues to work completely unchanged in its own formulas - none of them hardcode "7" as a day-count boundary already (the existing multi-day booking span logic already walks `firstDay`/`lastDay` generically). The only change needed is swapping the 7-entry `weekDays` lookup array for the new 35-entry `allDays` array everywhere a day is looked up by index, and widening the `TeamsCalendarEvent.day` field's valid range from `0..6` to `0..34` (no type change - it's already just `number`).

**Rationale**: The existing booking-selection code was written generically enough (day/hour pairs resolved through one linear index formula, `getSlotIndex(day, hour) = day * HOURS_COUNT + (hour - HOURS_START)`) that extending the day range is a data-source change, not a logic rewrite - directly satisfies the spec's edge case about a selection spanning what used to be a week boundary, since there effectively are no week boundaries left in the selection math, only one long day axis.

## 7. What's kept from feature 006's animation work, and what's not

**Decision**: The `AnimatePresence`/`SLIDE_VARIANTS`/`motion.div` wrapping around the main grid's day-header row and hour-grid body (the thing that used to swap one week's DOM for another) is removed entirely, replaced by the plain always-rendered 35-day row from §1. The mini-calendar's own highlight-pill (`layoutId="ta-week-highlight-pill"`) and its month-view slide transition are untouched - they still animate exactly as before, just now driven by `leadingWeekIndex` changes instead of `selectedWeekStart` changes. The header's date-range `SlidingLabel` text is also kept, now keyed off the leading week's computed Sunday/Saturday span (reusing the existing `formatWeekRangeLabel` unchanged) - it will update somewhat often during a continuous scroll gesture (following §4's "flips quickly" characteristic), which is an accepted, expected side effect of a live "where am I" indicator, not a defect.

**Rationale**: Nothing about the mini-calendar's own UI changed in scope (spec's FR-009 keeps its independent browsing exactly as-is) - only the *trigger* for its sync changed from "a click set `selectedWeekStart`" to "a scroll position computed `leadingWeekIndex`." Reusing the existing animated components for that output keeps the amount of new code to exactly what's needed: a different input, same rendering.

## 8. Symmetric no-op behavior for an unreachable mini-calendar row click

**Decision**: Clicking a mini-calendar week-row whose Sunday falls outside the fixed `0..4` range (either before the current week, per spec's explicit Edge Case, or beyond the 5th week, which the spec doesn't call out directly but follows the identical principle) has no effect on the main grid - the click handler simply computes `targetWeekIndex` from the clicked date, and if it's outside `0..4`, does nothing (no scroll call, no state change).

**Rationale**: A direct, symmetric extension of the explicitly-specified past-week case to the (unmentioned but logically identical) future-beyond-range case - "if the main grid can't reach it, clicking it there is a no-op" is the one rule already established, not a new product decision.

## 9. Lock icon

**Decision**: `Lock` from `lucide-react` (already an installed dependency, same package the existing `X` close icon already imports from), small size (`w-3 h-3` or `w-3.5 h-3.5`), centered via `absolute inset-0 flex items-center justify-center`, low opacity, `pointer-events-none` so it never interferes with the disabled cell's existing native tooltip/cursor.

**Rationale**: No new dependency; matches this codebase's existing icon usage pattern exactly.
