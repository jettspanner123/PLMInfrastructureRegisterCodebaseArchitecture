# Research: Calendar Event Card Status Colors

No `[NEEDS CLARIFICATION]` markers remain — resolved via two rounds of clarification, the second one triggered by a real technical problem found during this research phase itself (not anticipated at spec time). This phase works out how to actually build what was agreed.

## 1. Literal classes only — Tailwind can't see interpolated arbitrary values

**Decision**: Every status's card/stripe/pill colors are written as complete, literal Tailwind class strings in a lookup map keyed by status, never built via string interpolation (e.g. never `` `bg-[${hex}]` ``).

**Rationale**: Tailwind's JIT compiler generates CSS only for class names it can find as literal substrings somewhere in the scanned source. A template-interpolated class name is invisible to that static scan and silently produces no CSS at build time — the element would render with no background at all, not an error, making this exactly the kind of bug that's easy to ship unnoticed. This file's own existing `STATUS_STYLES`/`DOWNTIME_STATUS_STYLES`-style maps elsewhere in this codebase already follow the literal-strings-per-key pattern for the same reason — this feature follows the same precedent.

## 2. Same-color-on-itself compositing is a no-op — stripe and pill can't just be "reduced opacity"

**Finding**: The first clarification round approved "same hex, different opacities" for border/stripe/pill, modeled on how today's purple border already works (`border-[#5b5fc7]/50`, blended against the external grid background behind the card). Working out the actual rendering during this phase surfaced a problem that clarification round didn't anticipate: the stripe and the time-pill both render **on top of the card's own solid fill**, not against the grid. Alpha-compositing any opacity of a color on top of an identically-colored, fully-opaque backdrop is mathematically a no-op (`result = C·α + C·(1−α) = C` for any α) — a stripe or pill at any opacity of the exact same hex as the solid card behind it would be completely invisible, blending perfectly into the card. The border is unaffected by this, since it sits at the box edge against the external grid background (a genuinely different color), where opacity blending works exactly as it does today.

**Decision (second clarification round)**: Stripe lightens toward white; pill darkens toward black — **one further judgment call layered on top of that answer, specific to the pill**: the pill's own text color (`#c8c8c8`, a light gray) must stay readable per the spec's own FR-004, and a light-gray-on-lightened-pastel pill would have *worse* contrast than today's pill, not better — the user's "lighten toward white" answer was given for the stripe+pill question as a pair, without this text-contrast wrinkle specific to the pill surfacing at the time. Since FR-004 is an already-locked requirement (not something this plan can quietly drop), the pill is darkened toward black instead of lightened, while the stripe follows the literal "lighten toward white" answer as given. **Flagged explicitly in the completion report** so this deviation is visible and easy to override.

**Exact blends** (both at a 45% mix, chosen as a clean, round, symmetric ratio — not independently re-litigated per color):

| Status | Card (solid) | Border (50% opacity, existing precedent) | Stripe (45% white blend) | Pill (45% black blend) |
|---|---|---|---|---|
| Pending | `#ffa826` | `border-[#ffa826]/50` | `#ffcf88` | `#8c5c15` |
| Approved | `#26acff` | `border-[#26acff]/50` | `#88d1ff` | `#155f8c` |
| Completed | `#29d944` | `border-[#29d944]/50` | `#89ea98` | `#177725` |

**Rationale**: A 45% white blend gives the stripe a clearly brighter, distinct accent edge against the solid card (visible the same way today's purple stripe, `#7b83eb`, is visibly brighter than its own card, `#3d375a`). A 45% black blend keeps the pill dark enough for the existing light-gray text to read clearly against it, mirroring why today's downtime pill (`#7a3232`) and purple pill (`#464775`) are both already dark, not light, shades.

## 3. Tracking status on `TeamsCalendarEvent` without touching the conversion helper

**Decision**: Add one new optional field, `status?: EnvironmentUptimeRequestStatusEnumModel`, to the existing `TeamsCalendarEvent` interface. It's populated only where real uptime-request events are built — the existing `.flatMap((request) => CalendarBookingConversionHelper.current.convertRangeToEvents(...))` call (from feature 009) is wrapped with `.map((event) => ({ ...event, status: request.status }))` immediately after, since every day-segment produced from one request shares that one request's single status.

**Rationale**: `CalendarBookingConversionHelper.convertRangeToEvents` doesn't need to know about status at all — it's a generic day/hour decomposition utility reused by uptime requests, downtime, and the in-progress pick alike (feature 009). Attaching `status` as a post-processing step in the one call site that already has the full `EnvironmentUptimeRequestInterfaceModel` in scope is the smallest change that doesn't touch that shared helper's own signature or its other two call sites.

## 4. Collapsing the existing `isDowntime` triple-ternary into one computed color object

**Decision**: Replace the current pattern (three separate `isDowntime ? x : y` ternaries — one each for the card's own className, the stripe's className, and the pill's className) with a single `cardColors = { card, stripe, pill }` object computed once per card, then referenced three times. Resolution order: downtime → its own existing fixed red styling (unchanged); `uptimeRequest` with a recognized status → that status's entry from the new lookup map; anything else (the in-progress pick, or a defensive fallback for an unrecognized/missing status) → today's existing fixed purple styling (unchanged).

**Rationale**: Directly reduces duplication the three separate ternaries already had, while adding the new status-based branch in exactly one place instead of three. The explicit fallback-to-purple for an unrecognized status is a defensive default, not a new requirement — nothing in the data can actually reach it today, since FR-001's three statuses are the only ones that ever produce an `uptimeRequest`-sourced card in the first place (feature 009's own existing filter).
