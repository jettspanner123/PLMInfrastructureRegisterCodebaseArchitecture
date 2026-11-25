# Quickstart: Adopt ObservaCore's Light Mode Canvas Color

Manual validation guide (no automated test framework exists in this repo). Run against the live dev server via Chrome DevTools MCP.

## Prerequisites

- Frontend dev server running.
- The application in light mode (explicitly switch, or use a fresh browser profile — see feature 012's own light-mode-default behavior).

## Scenario 1 - Page background is visibly distinct from card backgrounds (User Story 1)

1. Load the application in light mode.
2. Compare the page's own background (visible in the margins around and between cards) against a card's own background (e.g. an Infrastructure Register table card, a Resources page panel).
3. Confirm the page background reads as a soft, slightly dimmed gray (`#f2f2f2`), and the card background reads as a visibly lighter, near-white tone (`#f8fafc`/`#f1f5f9`) — the two should look clearly different, not like one continuous white field.
4. Inspect the computed `background-color` of `<html>`/`<body>` via DevTools and confirm it resolves to `#f2f2f2`.

## Scenario 2 - Every other light-mode surface is unchanged

1. In light mode, sample a representative set of surfaces: a button, a modal, a popover, an input, a dropdown, the navigation bar, a table header.
2. Confirm every one of them shows exactly the same background/text/border color it showed before this feature — only the page's own background has changed.

## Scenario 3 - Dark mode is completely unaffected

1. Switch to dark mode and reload.
2. Confirm every surface, including the page background itself, is pixel-identical to its pre-feature appearance.

## Expected overall result

All three scenarios pass with no regression to any other existing screen or feature, in either light or dark mode.
