# Data Model: Calendar Modal Light/Dark Theming

No database, no backend entity, no new stored or derived value. The only "entity" this feature touches is the calendar modal's own set of Tailwind utility classes.

## Calendar Modal Theme Palette (existing component, new light-mode classes added)

Every row keeps its existing dark-mode value (moved behind `dark:`) and gains a new light-mode value (the unprefixed base class). See research.md §2 for the full, authoritative token map (background, border, text-tone, and scrollbar tables) — not duplicated here.

| Category | Role count | Changes |
|---|---|---|
| Backgrounds | 7 | New light value added alongside each existing `dark:`-wrapped hex |
| Borders/dividers | 1 (shared across every border/divider in the modal) | New light value added alongside the existing `dark:`-wrapped hex |
| Text tones | 9 | New light value added alongside each existing `dark:`-wrapped hex/stock-gray class |
| Scrollbar (raw `<style>` block) | 3 | New `.dark`-gated selector pair added (not reachable by Tailwind's `dark:` variant) |

## Explicitly unchanged (confirmed out of scope, not a new entity)

- `BOOKING_STATUS_CARD_STYLES` (Pending/Approved/Completed) and the downtime card's own fixed colors — per spec FR-004.
- The modal's accent/interactive blue tones: the "Today" badge, the day-number accent, the building icon, and every selection/preview rgba overlay — per spec Assumptions.

No other component, screen, or shared service is affected.
