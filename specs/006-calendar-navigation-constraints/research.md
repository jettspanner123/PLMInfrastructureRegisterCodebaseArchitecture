# Research: Calendar Navigation & Booking Constraints

No `[NEEDS CLARIFICATION]` markers remain in the Technical Context (the spec's own clarification round, done in conversation before `spec.md` was written, already resolved every open product decision). This phase instead records the technical decisions needed to implement what the spec already settled.

## 1. Direction-aware slide animation mechanism

**Decision**: Use `motion/react`'s (framer-motion) `AnimatePresence` with a `custom` prop carrying a `direction: 'forward' | 'backward'` value, and `variants` whose `initial`/`animate`/`exit` are functions of that `custom` value (standard "directional carousel" recipe) - keyed per-render by the thing being displayed (week start date, or displayed month) so React mounts a fresh element on each change for `AnimatePresence` to transition between.

**Rationale**: `motion/react` is already a direct dependency and is already used for exactly this shape of problem in this same codebase - `ModalSharedComponent.tsx` already drives its own enter/exit via `AnimatePresence custom={activeExitDirection}` with `variants.exit` reading the custom value to decide which way to animate out. Reusing the identical recipe keeps the new code idiomatic with the rest of the app and introduces zero new dependencies or animation primitives.

**Alternatives considered**:
- Plain CSS transitions/keyframes toggled via class names - would work, but framer-motion is already loaded and already the established pattern for direction-aware motion in this codebase; reinventing it in raw CSS would be inconsistent with the one precedent that already exists.
- A general-purpose carousel/slider library - rejected outright; this is a two-states-at-a-time transition (old content out, new content in), not a scrollable multi-item carousel, and pulling in a new dependency for something `motion/react` already covers would violate this app's "don't add a dependency for a few lines" convention.

## 2. "Past slot" disable computation

**Decision**: Compute "now" once per render pass (`useMemo`, re-derived whenever the modal opens or the user takes a navigation action - not on a live per-second timer, per the spec's explicit Assumption). A slot `(day, hour)` is disabled when the day is strictly before today, OR the day is today AND `hour <= current real-world hour` (i.e. the earliest selectable hour on today is `current hour + 1`, matching FR-002's "disable the in-progress hour too" resolution).

**Rationale**: Directly matches FR-001/FR-002's resolved rule. Computing it as a pure derived value (not component state) means it can't drift out of sync with the rest of the render, and matches how `todayYmd` is already computed once via `useMemo(() => new Date(), [])` elsewhere in this same component.

**Alternatives considered**: A live `setInterval` ticking every second/minute to re-evaluate disabled slots in real time while the modal sits open - explicitly out of scope per the spec's own Assumptions ("re-evaluating happens on render/interaction, not a live per-second timer").

## 3. Disabled-slot precedence over weekend-muting

**Decision**: When computing a slot's className, check "is this slot disabled" first; if so, apply the disabled look (muted background + `cursor-not-allowed`, no hover/selection classes at all) and skip the weekend-muted check entirely for that cell's background. Weekend-muting still applies to slots that are weekend-but-not-disabled.

**Rationale**: Directly matches FR-004 ("disabled state MUST visually take precedence... not some combined third visual state"). A simple if/else-if ordering in the existing per-slot className builder achieves this with no new state.

## 4. Mini-calendar/main-grid sync model

**Decision**: The main grid's `selectedWeekStart` remains the single source of truth for "what week is selected." The mini-calendar's `viewYear`/`viewMonth` become real state again (reverting the earlier simplification that made them derived constants, since month navigation is now required) and are kept in sync with `selectedWeekStart` via a `useEffect` that re-points `viewYear`/`viewMonth` at the month containing the selected week's Sunday whenever it changes to a week in a different month - this satisfies FR-009 ("mini-calendar follows automatically") without needing a second, independent source of truth. The mini-calendar's own month arrows change `viewYear`/`viewMonth` directly and do *not* touch `selectedWeekStart`, satisfying FR-008 (independent browsing).

**Rationale**: Keeps exactly one piece of state (`selectedWeekStart`) driving what's "actually selected," with the mini-calendar's displayed month as a dependent view concern that mostly tracks it but can also be independently browsed - matches the asymmetric relationship the spec's clarification round settled on (main grid drives mini-calendar; mini-calendar's own nav doesn't drive main grid).

**Alternatives considered**: Deriving `viewYear`/`viewMonth` purely from `selectedWeekStart` with no independent state - rejected because it cannot support FR-008 (browsing the mini-calendar to a different month without changing the main grid's selection).

## 5. Vertical auto-scroll to "now" (Today button)

**Decision**: On Today-button click, after any week/month state updates are applied, imperatively scroll the hourly grid's scroll container (`ref`-accessed) so the current hour's row is positioned within the visible area (e.g. `scrollIntoView({behavior: 'smooth', block: 'center'})` on that hour's row, or an equivalent computed `scrollTo`), regardless of whether the displayed week itself changed.

**Rationale**: Matches FR-010 and User Story 4's Acceptance Scenario 3 (scroll still happens even with no week/month change needed). `scrollIntoView` with smooth behavior is a native browser capability requiring no new dependency, consistent with the "native" cursor requirement elsewhere in this same spec favoring platform-native mechanisms where available.
