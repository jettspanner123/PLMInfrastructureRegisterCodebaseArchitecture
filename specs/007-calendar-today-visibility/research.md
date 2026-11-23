# Research: Calendar Today Visibility & Restricted-Slot Tooltip

No `[NEEDS CLARIFICATION]` markers remain (resolved via the conversation's clarification round before `spec.md` was written). One real technical decision needed working out before implementation.

## 1. Layering a translucent "today" tint over existing solid backgrounds

**Decision**: Render the today-tint and current-time accent as separate, absolutely-positioned, `pointer-events-none` overlay `<div>`s stacked on top of each slot's existing background (`absolute inset-0` inside the already-`relative` slot cell), rather than trying to express them as additional Tailwind background-color classes on the slot element itself.

**Rationale**: A single element has exactly one active `background-color` - CSS doesn't blend two separate `bg-*` utility classes on the same box (the cascade just picks one winner). The existing code already has three mutually-exclusive solid backgrounds on the slot div itself (plain `#141414`, weekend-muted `#1a1a1a`, disabled `#101010`), chosen via an if/else-if chain (feature 006). Today's tint and the current-time accent need to coexist *on top of* whichever of those three is already showing, which genuine alpha-blending requires: a translucent (`rgba(...)`) box painted over an opaque one composites naturally in the browser, with no need to hand-compute every pairwise combined hex value (weekend+today, disabled+today, weekend+disabled+today, etc.) in JS.

**Alternatives considered**:
- Hand-computing a flattened "combined" hex/rgba value per state combination in the existing if/else-if chain - rejected: multiplies the number of branches (3 existing states × today on/off × current-time on/off) for no benefit over just letting the browser composite two boxes, and is easy to get subtly wrong/inconsistent.
- CSS `background-image` with a `linear-gradient(rgba(...), rgba(...))` layered via comma-separated backgrounds on the same element - technically also achieves real layering, but is a less common/readable pattern in this codebase than just adding a small overlay div, for no real benefit here.

## 2. Today/current-time detection

**Decision**: Reuse the values feature 006 already computes in this same render pass - `todayYmd` (for "is this column's date equal to today") and `currentHour` (for "is this cell's hour exactly equal to the live current hour, not just `<=` it like the disabled check") - no new date/time utility needed.

**Rationale**: `isToday = isSameYmd(weekDays[dayIndex], todayYmd)` and `isCurrentTimeCell = isToday && hour === currentHour` both fall directly out of state the component already derives fresh every render (per feature 006's research.md §2 decision to recompute "now" per render/interaction, not on a live timer) - fully consistent with that established approach, no new research needed for the time math itself.

## 3. Tooltip mechanism

**Decision**: Native HTML `title` attribute on the disabled slot's div, with a short fixed string (e.g. "This time has already passed").

**Rationale**: Confirmed via the clarification round and a codebase check - no custom tooltip component exists anywhere in this repo, and the one existing tooltip-adjacent precedent (`SegmentedControlSharedComponent`'s `iconOnly` mode) already relies on the native browser tooltip. Zero new code beyond the attribute itself.
