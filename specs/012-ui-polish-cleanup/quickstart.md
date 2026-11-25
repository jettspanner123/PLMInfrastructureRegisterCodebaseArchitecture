# Quickstart: UI Polish & Feature Request Removal

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP, switching the `FRONTEND_DESIGN_SCHEMA` database row's value between scenarios.

## Prerequisites

- Frontend and backend dev servers running.
- Database access to directly edit the seeded `IG_ConfigurationConstantTBL` row where `ConfigurationKey = 'FRONTEND_DESIGN_SCHEMA'` (per data-model.md/contracts).
- A brand-new, isolated browser context (no saved theme/column/other preferences) for the theme-default scenario.

## Scenario 1 - Design schema defaults to AtlasCopco (User Story 1)

1. With the `FRONTEND_DESIGN_SCHEMA` row deleted (or its value set to something unrecognized, e.g. `["bogus"]`), load the application.
2. Confirm every surface behaves exactly as the `AtlasCopco` scenarios below (Scenarios 2-4), proving the no-row/unrecognized-value fallback matches the explicit `AtlasCopco` value.

## Scenario 2 - 6px corners under AtlasCopco, unchanged under WePLM (User Story 2)

1. With `FRONTEND_DESIGN_SCHEMA` set to `["ATLASCOPCO"]`, load the application and inspect a representative sample: a button, a modal, a popover, a segmented control, a dropdown, an input, a tooltip/context menu, a page-level card, the data-table sticky header, and a Sonner toast notification. Confirm every one of them shows exactly 6px corner rounding, in both light and dark mode.
2. On the same page, confirm every circular/pill element (an avatar, a status dot, a toggle-switch knob, a scrollbar thumb, the toast's dismiss button) is still fully round, unaffected.
3. Change `FRONTEND_DESIGN_SCHEMA` to `["WEPLM"]` and reload. Confirm every surface from step 1 reverts to its original, pre-feature corner rounding (not 6px).

## Scenario 3 - Light mode default is unaffected by schema (User Story 3)

1. With `FRONTEND_DESIGN_SCHEMA` set to `["ATLASCOPCO"]`, clear all saved preferences (a brand-new browser context) and load the application. Confirm it opens in light mode.
2. Repeat step 1 with `FRONTEND_DESIGN_SCHEMA` set to `["WEPLM"]`. Confirm it still opens in light mode.
3. In either schema, explicitly switch to dark mode and reload. Confirm the saved dark preference is honored, unaffected by the schema value.

## Scenario 4 - Infrastructure Register header and Feature Request reachability follow the schema (User Stories 4-5)

1. With `FRONTEND_DESIGN_SCHEMA` set to `["ATLASCOPCO"]`: load Infrastructure Register and confirm no AI assistant button appears next to the Columns button (Infrastructure Register is its only existing trigger point in the app, so it is now unreachable from the UI, by design); confirm the top navigation bar shows no "Feature Request" link; attempt to navigate directly to the Feature Request page's URL and confirm it redirects away instead of rendering the page.
2. With `FRONTEND_DESIGN_SCHEMA` set to `["WEPLM"]`: reload and confirm the AI assistant button is back next to the Columns button on Infrastructure Register; confirm the "Feature Request" nav link is back and the page renders normally when visited, both via the nav link and via a direct URL.
3. Submit or inspect existing feature request data under either schema value and confirm it is identical either way — only reachability changed, never the underlying data.

## Scenario 5 - Brand navy color follows the schema (User Story 6)

1. With `FRONTEND_DESIGN_SCHEMA` set to `["ATLASCOPCO"]`, inspect a representative sample of brand-navy surfaces: a primary button (e.g. "Submit Request"), a table header (Infrastructure Register), the navigation bar's active-item highlight, a focused input's ring, and the "Scheduled" downtime status tag. Confirm every one of them shows `#008eb8` (or a proportionally darker/lighter derived shade for hover/active/tint states) instead of the original navy.
2. On the same page, confirm a component that already uses a different, Tailwind-stock blue in dark mode (e.g. a `dark:text-blue-400` focus state) is unaffected — only literal brand-navy usages change, not every blue in the application.
3. Change `FRONTEND_DESIGN_SCHEMA` to `["WEPLM"]` and reload. Confirm every surface from step 1 reverts to its original navy, and hover/active states darken exactly as they did before this feature.

## Scenario 6 - Splash screen shows a static, schema-matching logo (User Story 7)

1. With `FRONTEND_DESIGN_SCHEMA` set to `["WEPLM"]`, reload the application and confirm the splash screen shows the static We.PLM logo with no looping animation, then dismisses normally once initial data finishes loading.
2. Change `FRONTEND_DESIGN_SCHEMA` to `["ATLASCOPCO"]` and reload. Confirm the splash screen now shows the static Atlas Copco logo instead, also with no animation, and still dismisses at the same point in the loading sequence as step 1.

## Expected overall result

All six scenarios pass with no regression to any other existing screen or feature (Resources table, Environment Overview, Uptime Request calendar, Downtime Announcements, Profile Settings) under either schema value.
