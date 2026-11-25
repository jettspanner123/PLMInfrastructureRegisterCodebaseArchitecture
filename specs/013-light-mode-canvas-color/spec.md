# Feature Specification: Adopt ObservaCore's Light Mode Canvas Color

**Feature Branch**: `013-light-mode-canvas-color`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "the ui polish that you have done is good, one more addition to it, in the 'ObservaCore' application we have done some changes related to light mode, related to color, can you please read it or find out what those changes are, like the bg color, the bg color of the cards and things like that please, because that light mode is much better (the color combo) than already existing on in this application, also just to let you know 'observa core' is the name of the 'monitoring dashboard' repository, just use gitnexus and found out everything about the light mode, because we are going to adapt light mode of that application into our own this repository current one do a complete research on the monitoring dashboard front end code and adapt the light mode of that application here"

## Research Findings

A full history read of ObservaCore's (the Monitoring Dashboard repository's) frontend `index.css` and every commit touching its light-mode colors shows the following:

- ObservaCore's light-mode color system (`--color-surface-card`, `--color-surface-elevated`, `--color-surface-deep`, `--color-hairline`, `--color-ink`, `--color-body`, `--color-charcoal`, `--color-mute`, `--color-ash`, `--color-stone`) is **already byte-for-byte identical** to this application's own light-mode color system today — both were built from the same shared design foundation. Dark mode is identical as well and is explicitly untouched by every commit below.
- ObservaCore's team first tried two more invasive experiments: a flat canvas+card recolor (`#F5F5F5`/`#EAEAEA`), then a hardcoded "3-tier elevation" pass touching 11 individual component files (`#e0e0e0`/`#eaeaea`/`#f5f5f5`). Both were explicitly reverted in a later commit ("looked worse in practice"), confirmed by a zero-hit search for those hex values anywhere in ObservaCore's current frontend source.
- The one change that **was kept** is a single CSS custom property: `--color-canvas` (the page's own background, behind every card) moved off pure white through three iterations — `#f0f0f0` → `#f5f5f5` → `#f2f2f2` (marked "final" in its own commit message) — with every other color, including the card background itself (`--color-surface-card: #f8fafc`), left untouched.
- The visual effect: a soft, slightly dimmed page canvas (`#f2f2f2`) that now sits visibly behind the lighter card surfaces (`#f8fafc`/`#f1f5f9`), giving every card its own perceptible elevation — rather than today's flat, all-white page where the canvas and some card surfaces are indistinguishable.

This application's own `index.css` currently sets `--color-canvas: #ffffff` in `:root`, with every other light-mode variable already matching ObservaCore's values exactly. Adopting ObservaCore's improved light mode is therefore a single-value change to this one existing variable — no new component edits, no dark-mode changes, no other variable changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visibly layered light mode, matching ObservaCore (Priority: P1)

A user of the application in light mode sees the page background as a soft, slightly dimmed gray rather than pure white, so every card and panel on the page reads as a distinct, elevated surface sitting on top of the page — the same visual improvement already adopted and kept in ObservaCore, this organization's monitoring dashboard application.

**Why this priority**: This is the entire scope of the feature — a single, app-wide visual value with no dependent sub-parts.

**Independent Test**: Load the application in light mode and compare the page background against a card's own background; the page should read as a visibly different, slightly darker gray than the card, rather than both reading as the same white.

**Acceptance Scenarios**:

1. **Given** a user has the application open in light mode, **When** the page renders, **Then** the page's own background color is `#f2f2f2`, visibly distinct from (and slightly darker than) every card's own background color.
2. **Given** a user has the application open in dark mode, **When** the page renders, **Then** nothing changes — dark mode's existing background colors are completely unaffected by this feature.
3. **Given** any existing light-mode surface that is not the page's own background (cards, panels, inputs, dropdowns, modals, popovers, the navigation bar), **When** it renders, **Then** its own background color is unchanged from what it is today.

### Edge Cases

- What happens to light-mode surfaces that already sit directly against the page background with no card wrapper (e.g. a bare page header)? They are unaffected by this change, since only the `--color-canvas` variable itself changes — any surface that was already using its own distinct background (not inheriting the canvas color) keeps rendering exactly as it does today.
- What happens in dark mode? Nothing — this change is scoped entirely to the light-mode (`:root`) value of one variable; the `.dark` block is untouched.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In light mode, the application's page background color MUST be `#f2f2f2`, replacing today's `#ffffff`.
- **FR-002**: Every other light-mode color (card backgrounds, elevated-surface backgrounds, deep-surface backgrounds, hairline borders, ink, body, charcoal, mute, ash, and stone text/border tones) MUST remain exactly as they are today, unchanged by this feature.
- **FR-003**: Dark mode MUST remain completely unaffected by this feature — no dark-mode color value changes.

### Key Entities

- **Canvas Background Color**: The single application-wide light-mode page background value. Changes from `#ffffff` to `#f2f2f2`. No other entity or value is introduced or altered.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of light-mode page loads show a page background of `#f2f2f2`, not `#ffffff`.
- **SC-002**: 100% of existing card/panel/modal/popover/input/dropdown/navigation-bar background colors remain pixel-identical to their pre-feature values, in both light and dark mode.
- **SC-003**: 100% of dark-mode page loads are visually unchanged from before this feature.

## Assumptions

- "Adapt the light mode of that application" refers specifically to the one color value ObservaCore's team ultimately kept after their own experimentation (the canvas background), not the two earlier, explicitly-reverted experiments found in ObservaCore's own commit history — adopting a change its own authors tried and discarded would reintroduce a combination they themselves found worse.
- This application's light-mode card/surface/text colors already match ObservaCore's own values exactly (confirmed by direct comparison), so no other value needs to change to achieve visual parity with ObservaCore's current light mode.
- This is a plain CSS custom-property value change in `index.css`'s existing `:root` block — no new theming mechanism, toggle, or schema gating is introduced; it applies unconditionally in light mode, the same way the color it replaces does today.
