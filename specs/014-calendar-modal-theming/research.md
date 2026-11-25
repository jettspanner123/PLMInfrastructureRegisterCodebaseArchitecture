# Research: Calendar Modal Light/Dark Theming

No `[NEEDS CLARIFICATION]` markers remain — both open forks were resolved in `/speckit-specify`'s own clarification round. This phase works out the concrete mechanism and the full set of light-mode values.

## 1. Mechanism: Tailwind's existing `dark:` variant convention, not a new CSS-variable scope

**Decision**: Keep every current hardcoded hex value exactly as it is today, but move it behind a `dark:` prefix, and add a new unprefixed (light-mode) class alongside it — the same base-class-is-light/`dark:`-is-override pattern already used throughout this codebase (confirmed in `ModalSharedComponent.tsx`: `bg-white dark:bg-[#171717]`, `border-slate-200 dark:border-zinc-800/80`, `text-slate-400 ... dark:text-zinc-500`). No new CSS custom properties are introduced for this modal.

**Rationale**: The second Clarification answer ("match this application's own existing light-mode design tokens... for consistency with the rest of the app") points at the mechanism as much as the values — this codebase's own per-component theming convention is always Tailwind's `dark:` variant on a literal class, never a bespoke CSS-variable scope (CSS custom properties in `index.css` are reserved for the handful of true app-wide tokens: canvas, surface, ink, body, etc., and feature 012's `--color-brand*` family, not for one component's own internal palette). Introducing a new variable scope here would be inconsistent with how every other themed component in this codebase works, and unnecessary: the modal's dark values never change, so there's nothing a variable buys over a literal `dark:` class.

**Alternatives considered**:
- *A new scoped CSS-variable pair under `.ta-teams-calendar-scope`* (mirroring `.schema-atlascopco`'s pattern) — rejected: no other single-component palette in this codebase uses this pattern; every other themed component uses `dark:` directly, and matching that existing convention is also part of "matching the app's own tokens."

## 2. Value mapping: reusing this app's own existing light-mode/modal vocabulary

**Decision**: Every light-mode value below reuses literal Tailwind utility colors already in active use elsewhere in this codebase (`slate-*` for light-mode chrome/text, matching `ModalSharedComponent.tsx`'s own established light-mode palette), not new hex literals invented for this feature.

**Rationale**: `ModalSharedComponent.tsx` (the shared wrapper this very modal renders inside, via `sizeMode="adaptive"`) already defines this application's own light/dark modal convention: card background `bg-white dark:bg-[#171717]`, borders `border-slate-200 dark:border-zinc-800/80`, close-button text `text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300`. The calendar modal's own full-bleed content (which deliberately overrides the shared wrapper's padding via `-m-5 sm:-m-6` to render edge-to-edge) should read as a natural continuation of that same light-mode vocabulary, not a different one.

### Chrome background map

| Role | Today (dark, kept under `dark:`) | New light-mode value | Usage |
|---|---|---|---|
| Sidebar / main content / grid background | `#141414` | `white` | Sidebar `<aside>`, `<main>`, grid container, sticky headers, hour-label column |
| Weekend-day column tint | `#1a1a1a` | `slate-50` | Day header cell + day column background when `isWeekend` |
| Disabled (past) time slot | `#101010` | `slate-100` | `isSlotDisabled` slot background |
| Button/row hover background | `#292929` | `slate-100` | Sidebar-toggle/Today/week-nav/week-range buttons' `hover:bg-*` |
| Mini-calendar week-row hover | `#1c1c1c` | `slate-100` | Mini-calendar week row `hover:bg-*` |
| Selected-week highlight pill | `#28273b` | `indigo-50` | Mini-calendar's `layoutId="ta-week-highlight-pill"` |
| Close button hover background | `#292929` | `slate-100` | Close (X) button `hover:bg-*` |

### Border/divider map

| Role | Today (dark) | New light-mode value |
|---|---|---|
| Every border/divider (sidebar, header, grid lines, hour rows, day columns) | `#2b2b2b` | `slate-200` |

### Text tone map

| Role | Today (dark) | New light-mode value | Usage |
|---|---|---|---|
| Default body text (outer wrapper) | `#f5f5f5` | `slate-900` | Root content wrapper |
| Primary heading/label text | `white` | `slate-900` | "Calendar" title, week-range label |
| Secondary text | `#c8c8c8` | `slate-500` | Month-nav row, top action bar, hour label column parent |
| Tertiary/muted text | `#979797` | `slate-400` | Weekday header row, weekday abbreviation, other-month mini-calendar days |
| Near-white emphasis text | `#e1dfdd` | `slate-700` | Month label, Today button label |
| Current-month, non-selected-week day text | `#d6d6d6` | `slate-600` | Mini-calendar day cell |
| Current-month, selected-week day text | `white` | `slate-900` | Mini-calendar day cell (sits on the new `indigo-50` highlight pill) |
| Disabled-slot lock icon | `#5c5c5c` (at 60% opacity) | `slate-400` (at 60% opacity) | `Lock` icon on disabled slots |
| Stock Tailwind `text-gray-400`/`text-gray-500` + `hover:text-white`/`hover:text-gray-300` icon buttons | as-is | `hover:text-slate-900` | Chevron icons, sidebar-toggle/week-nav icon buttons |

### Scrollbar map (raw `<style>` block)

| Role | Today (dark) | New light-mode value |
|---|---|---|
| Track | `#141414` | `#f1f5f9` (matches `--color-surface-elevated`) |
| Thumb | `#333333` | `#cbd5e1` (matches `--color-stone`) |
| Thumb hover | `#444444` | `#94a3b8` (matches `--color-ash`) |

Since the raw `<style>` block is not scoped by Tailwind's `dark:` variant mechanism (it's plain CSS), it is instead gated by the same `.dark` class the rest of the application's theme already toggles on `<html>`, using a `.ta-teams-calendar-scope` + `:not(.dark *)`/`.dark` pairing analogous to how `index.css` already pairs `:root`/`.dark`.

## 3. What stays unchanged (confirmed, not re-litigated)

**Decision**: Booking/status event card colors (`BOOKING_STATUS_CARD_STYLES`, the downtime card's fixed red, and every color/text value inside an event card) are untouched, per Clarification 1. The modal's accent/interactive blue tones — the "Today" badge (`bg-[#5b5fc7] text-white`), the day-number accent (`text-[#5b9bd5]`), the building icon (`text-[#7070b8]`), and the selection/preview rgba overlays (`rgba(91,95,199,...)`, `rgba(123,131,235,...)`) — are also left unchanged, per the spec's own Assumptions (a working default to confirm visually during implementation, not a third clarification question).

**Rationale**: These accent/interactive colors are mid-saturation blues/purples designed to read as an emphasis signal against either background — the same role this application's own `--color-brand`-style accents already play elsewhere. Confirming this holds visually (not just assuming it) is the one open verification item carried into `quickstart.md`.

**Alternatives considered**: None — this was already settled in the spec's own Clarifications and Assumptions; this phase only confirms there's nothing further to resolve.
