# Feature Specification: UI Polish & Feature Request Removal

**Feature Branch**: `012-ui-polish-cleanup`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "This is going to be a really big design change, what we need to do is that, 1. make the default theme mode light please, 2. throughout the entire application, the segmentedcontrollers, primary buttons, everything should have much more sharp border raidus please, 6px roundness for everytning please, modals, popovers, buttons and everything please, 3. from the "Infrastructure Register" please remove the ai button thing please, which is just beside the column button please remove that, don't remove the actual modal itself please, just the button is fine, remove the "Feature Request" page as well please, also remove the code and link from the navbar as well please," — followed by: "one more thing i want to add is that, in the database, in the configuration constant table, add a new key which is "FRONTEND_DESIGN_SCHEMA" to "ATLASCOPCO", it can be either "WEPLM" or "ATLASCOPCO", if it's WEPLM, then it should stays as it already is, but if it's ATLASCOPCO, then the design changes should take place please like the border radius change, but the default should be light mode doesnt matter the FRONTEND_DESIGN_SCHEMA, when it's WEPLM then only show the ai button beside the column button, when WEPLM then only show the "Feature Request" page please" — followed by: "also whereever you have used the deep navy color of the application, like the primary buttons and tabel headers, when the FRONTEND_DESIGN_SCHEMA is WEPLM, keep the same but when it's ATLASCOPCO, make it #008eb8 please, when it's WEPLM, please remove the animation from the splash screen, when it's ATLASCOPCO thne use this image [Image #1] please" (a static Atlas Copco logo image was attached with this request)

## Clarifications

### Session 2026-11-25

- Q: The application currently uses several different corner-radius sizes across its surfaces (buttons, modals, popovers, cards, panels, inputs, and more). Does "6px for everything" mean literally every rounded rectangular surface in the app, including large page-level cards/panels which today use more generous rounding, or only the smaller interactive controls (buttons, segmented controls, modals, popovers, dropdowns, inputs, context menus)? → A: Truly everything — every rounded rectangular surface in the application becomes exactly 6px, with fully circular/pill-shaped elements (avatars, status dots, toggle-switch knobs, pill badges) excluded since flattening those would disfigure their shape.
- Q: The application's existing "configuration constant" mechanism has no dedicated Settings screen for viewing or editing keys directly — it only surfaces through specific growable-list dropdowns (like "Add New Sponsor"). Should FRONTEND_DESIGN_SCHEMA get any in-app control to view or change it, or is it a pure backend/database-level setting? → A: Pure backend/database setting — nothing in the application itself lets anyone view or change it; changing it means changing the database value directly.
- Q: The application's one deep navy brand color is used in 31 places, confirmed by an existing code comment as "the app-wide iconic blue... matching primary buttons/focus rings." Most are genuine brand chrome (buttons, table headers, navigation highlights, focus rings), but a couple are a status tag ("Scheduled," on downtime announcements) that happens to reuse the same hex for an unrelated reason, not as brand chrome — and under AtlasCopco it would sit visually close to the existing "Approved" booking status color. Should that status tag also become #008eb8, or stay its current fixed navy regardless of schema? → A: Recolor everything, including the status tag — every use of this hex becomes #008eb8 under AtlasCopco, with no exceptions carved out for status-tag reuses.
- Q: The splash screen currently plays a looping branded video while the application's initial data loads. Under WePLM the animation is removed; under AtlasCopco the attached Atlas Copco logo is used instead. What should WePLM's splash screen show in its place? → A: The existing We.PLM logo, already used in the top navigation bar, shown as a static image with no animation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A design schema setting decides which look is shown (Priority: P1)

The application's overall look is controlled by a single backend-held setting, the design schema, which is either "AtlasCopco" or "WePLM" and defaults to "AtlasCopco" when nothing has set it otherwise. When the schema is "AtlasCopco," the sharper, more modern look described in User Story 2 applies, along with the Infrastructure Register and Feature Request changes in User Stories 4 and 5. When the schema is "WePLM," those same three areas instead stay exactly as they behave today, unchanged.

**Why this priority**: Every other design/cleanup change in this feature (besides the theme default) is conditioned on this setting — without it, there is no way to express "the new look" versus "today's existing look" as two distinct, switchable states.

**Independent Test**: Can be fully tested by setting the design schema to each of its two values in turn and confirming the corner rounding, the Infrastructure Register header, and the Feature Request page's presence each match the expected state for that value.

**Acceptance Scenarios**:

1. **Given** the design schema has never been explicitly set, **When** the application reads it, **Then** it behaves as though the schema were "AtlasCopco."
2. **Given** the design schema is set to "WePLM," **When** the application renders, **Then** the corner rounding, the Infrastructure Register header, and the Feature Request page all behave exactly as they do today, with none of User Stories 2, 4, or 5's changes applied.
3. **Given** the design schema is set to "AtlasCopco," **When** the application renders, **Then** User Stories 2, 4, and 5's changes are all applied.

---

### User Story 2 - Consistent, sharper corners under the AtlasCopco schema (Priority: P1)

When the design schema is "AtlasCopco," a user of the application sees every rounded rectangular surface — buttons, modals, popovers, segmented controls, cards, panels, inputs, dropdowns, tooltips, table cells, and badges — using the same, sharper corner rounding, so the whole application reads as one consistent, more modern design language instead of today's mix of different roundness levels.

**Why this priority**: This is the single broadest, most visually pervasive part of the change — it touches nearly every screen in the application, so getting it right and consistent matters most.

**Independent Test**: With the design schema set to "AtlasCopco," can be fully tested by comparing corner rounding on a representative sample of surfaces (a button, a modal, a popover, a card, a table cell, a tooltip) across both light and dark mode and confirming all read as exactly the same rounding, while circular elements remain unaffected.

**Acceptance Scenarios**:

1. **Given** the design schema is "AtlasCopco," **When** any button, modal, popover, segmented control, dropdown, input, tooltip, context menu, or page-level card is rendered anywhere in the application, **Then** its corners are rounded at exactly 6px.
2. **Given** a fully circular or pill-shaped element (an avatar, a status dot, a toggle-switch knob, a fully-rounded pill badge), **When** it is rendered under either schema, **Then** it remains fully circular/pill-shaped, unaffected by this change.
3. **Given** the design schema is "AtlasCopco," **When** corners are compared between light mode and dark mode, **Then** the 6px rounding is identical in both themes.

---

### User Story 3 - Light mode as the default first-time experience, regardless of schema (Priority: P2)

A first-time visitor who has never set a theme preference sees the application open in light mode by default, so their very first impression of the application is bright and legible rather than dark — this happens the same way no matter which design schema is active.

**Why this priority**: Affects every first visit to the application, but is a smaller, more contained change than the sweeping corner-radius rework, and does not depend on the design schema setting at all.

**Independent Test**: Can be fully tested by clearing all saved preferences (a brand-new browser profile) and loading the application under each design schema value, confirming it opens in light mode either way.

**Acceptance Scenarios**:

1. **Given** a visitor with no previously saved theme preference, **When** they load the application for the first time, **Then** it renders in light mode, regardless of the current design schema value.
2. **Given** a visitor who has previously chosen and saved a theme preference (light or dark), **When** they return to the application, **Then** it continues to honor their own saved choice, unaffected by this change or by the design schema.

---

### User Story 4 - A simpler Infrastructure Register header under the AtlasCopco schema (Priority: P3)

When the design schema is "AtlasCopco," a user of the Infrastructure Register page no longer sees an AI assistant button next to the Columns button in the page's header, making the header less cluttered. The Infrastructure Register page is the only place in the application this button exists today, so under "AtlasCopco" the AI assistant becomes unreachable from the application's own UI entirely — its underlying code is untouched and unremoved, matching the original request to remove only the button, never the assistant's own implementation. When the schema is "WePLM," the AI assistant button next to the Columns button continues to appear exactly as it does today.

**Why this priority**: A small, contained, single-page change with no dependency on the other stories besides the schema setting itself.

**Independent Test**: With the design schema set to "AtlasCopco," can be fully tested by loading the Infrastructure Register page and confirming no AI assistant button appears anywhere in the application; with the schema set to "WePLM," confirming the button still appears next to the Columns button.

**Acceptance Scenarios**:

1. **Given** the design schema is "AtlasCopco," **When** the Infrastructure Register page loads, **Then** no AI assistant button appears next to the Columns button.
2. **Given** the design schema is "WePLM," **When** the Infrastructure Register page loads, **Then** the AI assistant button still appears next to the Columns button, unchanged from today.
3. **Given** the design schema is "AtlasCopco," **When** a user looks anywhere else in the application for the AI assistant (there is no other trigger point for it today), **Then** it is not reachable from the UI, while its underlying code remains fully intact in the codebase.

---

### User Story 5 - Feature Request page only exists under the WePLM schema (Priority: P4)

When the design schema is "AtlasCopco," a user of the application no longer finds a "Feature Request" link in the top navigation bar, and the Feature Request page itself is not reachable. When the schema is "WePLM," the Feature Request page and its navigation link continue to exist exactly as they do today.

**Why this priority**: A clean, self-contained, schema-dependent removal with no dependency on the other stories besides the schema setting itself; lowest priority since it is purely subtractive under one schema value.

**Independent Test**: With the design schema set to "AtlasCopco," can be fully tested by checking the top navigation bar for the absence of the "Feature Request" link and confirming the page can no longer be reached by any means; with the schema set to "WePLM," confirming the link and page both still work as today.

**Acceptance Scenarios**:

1. **Given** the design schema is "AtlasCopco," **When** the top navigation bar renders, **Then** no "Feature Request" link appears, and the page is not reachable by any means (navigation link, direct URL, or otherwise).
2. **Given** the design schema is "WePLM," **When** the top navigation bar renders, **Then** the "Feature Request" link still appears, and the page remains fully reachable exactly as today.
3. **Given** previously submitted feature request data, **When** this change ships under either schema, **Then** that underlying data is left untouched regardless of which schema is active.

---

### User Story 6 - The brand navy color re-themes under the AtlasCopco schema (Priority: P2)

Wherever the application uses its one deep navy brand color — primary buttons, table headers, navigation highlights, focus rings, and every other place that specific color appears (including a status tag that happens to reuse it) — a user sees that color as #008eb8 instead when the design schema is "AtlasCopco," while it stays exactly as it is today when the schema is "WePLM."

**Why this priority**: Nearly as visually pervasive as the corner-radius change (User Story 2), since this one color spans dozens of surfaces across the application.

**Independent Test**: With the design schema set to "AtlasCopco," sample a representative set of surfaces that use the brand navy today (a primary button, a table header, the navigation's active-item highlight, a focus ring, the "Scheduled" downtime status tag) and confirm every one of them shows #008eb8 instead; repeat under "WePLM" and confirm every one of them shows the original navy, unchanged.

**Acceptance Scenarios**:

1. **Given** the design schema is "AtlasCopco," **When** any surface that uses the application's brand navy color is rendered, **Then** it shows #008eb8 instead.
2. **Given** the design schema is "WePLM," **When** any surface that uses the application's brand navy color is rendered, **Then** it shows its original, unchanged navy.
3. **Given** a derived shade of the brand navy (such as a button's own hover-darkened state), **When** the design schema is "AtlasCopco," **Then** that derived shade is adjusted proportionally from #008eb8, the same way today's derived shade is adjusted from the original navy.

---

### User Story 7 - The splash screen reflects the active design schema (Priority: P3)

While the application's initial data is loading, a user sees a splash screen whose branding matches the active design schema: under "WePLM," the existing We.PLM logo shown as a plain static image with no animation; under "AtlasCopco," the Atlas Copco logo instead, also static.

**Why this priority**: A small, self-contained, single-screen change with no dependency on the other stories besides the schema setting itself.

**Independent Test**: With the design schema set to "WePLM," load the application and confirm the splash screen shows the static We.PLM logo with no looping animation; with the schema set to "AtlasCopco," confirm it shows the static Atlas Copco logo instead, also with no animation.

**Acceptance Scenarios**:

1. **Given** the design schema is "WePLM," **When** the application's splash screen is shown, **Then** it displays the existing We.PLM logo as a static image, with no looping animation.
2. **Given** the design schema is "AtlasCopco," **When** the application's splash screen is shown, **Then** it displays the Atlas Copco logo as a static image, with no looping animation.
3. **Given** either design schema, **When** the splash screen is shown, **Then** it still waits for the application's initial data to finish loading before dismissing, unaffected by the removal of the animation.

---

### Edge Cases

- What happens if the design schema value in the database is something other than "WePLM" or "AtlasCopco" (missing, blank, or an unrecognized value)? The application behaves as though it were "AtlasCopco," the same as when it has never been explicitly set.
- What happens to a user who already has the Feature Request page open, or bookmarked, when the schema is (or becomes) "AtlasCopco"? They can no longer navigate to or reach it, the same as any other removed page.
- What happens to the AI assistant's own code and conversation-handling logic under the "AtlasCopco" schema? Nothing — this change only hides its one existing trigger button; the assistant's own implementation is untouched and unremoved, exactly as the original request specified, even though this makes it currently unreachable from the UI under "AtlasCopco" (Infrastructure Register is its only existing entry point).
- What happens for a visually borderline element (something pill-shaped with slight internal rectangular detailing)? It is judged by its intended shape: anything meant to read as fully round or pill-shaped keeps that shape; anything meant to read as a rounded rectangle becomes 6px under the AtlasCopco schema.
- What happens if the design schema value changes while someone already has the application open? Reasonable default: the new value takes effect from the next time the application is loaded, not necessarily instantly within an already-open session (see Assumptions).
- What happens to the "Scheduled" downtime status tag's own color once it matches the brand navy's AtlasCopco value? It becomes #008eb8 like every other brand-navy surface, per the explicit scope decision above, even though this places it visually close to the existing "Approved" booking status color.
- What happens to a shade derived from the brand navy (such as a button's hover-darkened state) under "AtlasCopco"? It is derived from #008eb8 the same way today's derived shade is derived from the original navy, not left using the old color's own derived shade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST read a design schema setting with exactly two recognized values, "WePLM" and "AtlasCopco," defaulting to "AtlasCopco" whenever the setting has never been explicitly set or holds an unrecognized value.
- **FR-002**: The design schema setting MUST be controlled only at the backend/database level — the application MUST NOT offer any in-app control to view or change it.
- **FR-003**: When the design schema is "AtlasCopco," every rounded rectangular UI surface in the application — including but not limited to buttons, modals, popovers, segmented controls, dropdowns, inputs, tooltips, context menus, table cells, badges, and page-level cards/panels — MUST use the same 6px corner rounding.
- **FR-004**: When the design schema is "WePLM," corner rounding across the application MUST stay exactly as it behaves today (unaffected by FR-003).
- **FR-005**: Fully circular or pill-shaped elements (avatars, status dots, toggle-switch knobs, fully-rounded pill badges) MUST be excluded from FR-003 under either schema and MUST remain their current shape.
- **FR-006**: The 6px rounding from FR-003 MUST apply identically in both light mode and dark mode.
- **FR-007**: A first-time visitor with no previously saved theme preference MUST see the application in light mode by default, regardless of the design schema.
- **FR-008**: A visitor who has previously saved their own theme preference (light or dark) MUST continue to see that saved preference, unaffected by FR-007 or by the design schema.
- **FR-009**: When the design schema is "AtlasCopco," the Infrastructure Register page's header MUST no longer show an AI assistant trigger button next to the Columns button.
- **FR-010**: When the design schema is "WePLM," the Infrastructure Register page's header MUST continue to show the AI assistant trigger button next to the Columns button, unchanged from today.
- **FR-011**: The AI assistant's own underlying implementation MUST remain fully intact and unremoved from the codebase regardless of the design schema, even though Infrastructure Register is its only existing trigger point and hiding that button under "AtlasCopco" leaves it unreachable from the application's own UI.
- **FR-012**: When the design schema is "AtlasCopco," the top navigation bar MUST NOT show a "Feature Request" link, and the Feature Request page MUST NOT be reachable by any means (navigation link, direct URL, or otherwise).
- **FR-013**: When the design schema is "WePLM," the top navigation bar MUST continue to show the "Feature Request" link, and the Feature Request page MUST remain fully reachable, unchanged from today.
- **FR-014**: Previously submitted feature request data MUST remain unaffected by the design schema value — this setting only changes whether the page and its navigation entry point are reachable, never the underlying data.
- **FR-015**: When the design schema is "AtlasCopco," every surface in the application that currently uses the application's one deep navy brand color — including but not limited to primary buttons, table headers, navigation active-state highlights, focus rings, and status tags that happen to reuse this color — MUST show #008eb8 instead.
- **FR-016**: When the design schema is "WePLM," every surface described in FR-015 MUST continue to show its original, unchanged navy color.
- **FR-017**: Any shade derived from the brand navy color (such as a button's hover-darkened state) MUST be derived from #008eb8 under "AtlasCopco," the same way it is derived from the original navy under "WePLM."
- **FR-018**: When the design schema is "WePLM," the application's splash screen MUST display the existing We.PLM logo as a static image, with no looping animation.
- **FR-019**: When the design schema is "AtlasCopco," the application's splash screen MUST display the Atlas Copco logo as a static image, with no looping animation.
- **FR-020**: The splash screen MUST continue to wait for the application's initial data to finish loading before dismissing, under either design schema, unaffected by FR-018/FR-019.

### Key Entities *(include if feature involves data)*

- **Design Schema Setting**: A single, application-wide value controlling which look the application presents. Two recognized values: "WePLM" (today's existing look across corner rounding, the Infrastructure Register header, brand navy color, splash screen, and Feature Request availability) and "AtlasCopco" (the new, sharper look with the AI button and Feature Request page both removed, the brand color re-themed, and a different splash screen). Defaults to "AtlasCopco" when unset or unrecognized. Held at the backend/database level only, with no in-app control surface.
- **Atlas Copco Logo Asset**: A static brand image, provided alongside this request, used only by the splash screen when the design schema is "AtlasCopco."

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the design schema set to "AtlasCopco," 100% of rounded rectangular surfaces sampled across the application (buttons, modals, popovers, cards, inputs, dropdowns) show the identical 6px corner rounding.
- **SC-002**: With the design schema set to "WePLM," 100% of rounded rectangular surfaces sampled across the application show their original, pre-existing corner rounding, unchanged.
- **SC-003**: A brand-new visitor's first view of the application is in light mode, 100% of the time, under either design schema value.
- **SC-004**: With the design schema set to "AtlasCopco," the Infrastructure Register page's header shows one fewer control (the AI assistant button) than the "WePLM" value shows, with the assistant's own underlying code never deleted or modified by this change.
- **SC-005**: With the design schema set to "AtlasCopco," the top navigation bar shows one fewer item (Feature Request) than the "WePLM" value shows, and zero paths remain to reach that page under "AtlasCopco," while all paths remain fully available under "WePLM."
- **SC-006**: With the design schema set to "AtlasCopco," 100% of surfaces sampled that previously showed the brand navy color (including the "Scheduled" status tag) show #008eb8 instead.
- **SC-007**: With the design schema set to "WePLM," 100% of those same sampled surfaces show their original, unchanged navy color.
- **SC-008**: The splash screen shows no looping animation under either design schema, 100% of the time, while still waiting for initial data to finish loading before dismissing.

## Assumptions

- "6px for everything" applies to every rounded-rectangle surface in the application (per the first clarification above), excluding fully circular/pill-shaped elements, which keep their current shape, and only while the design schema is "AtlasCopco."
- The design schema setting is a single, application-wide value (not scoped per user or per session) — every visitor sees the same schema-driven behavior at the same time.
- The design schema is read once per page load; a change made directly in the database is expected to take effect the next time the application is loaded, not necessarily instantly inside an already-open browser tab.
- The corner-radius and theme-default changes are purely visual/presentation changes — no underlying data or business logic changes.
- Removing the Feature Request page under the "AtlasCopco" schema is a frontend-only removal (the page, its route, and its navigation link); the underlying feature-request data and any backend endpoints are left untouched, reversible, and out of scope for this feature.
- Removing the AI assistant button from Infrastructure Register under the "AtlasCopco" schema does not remove or modify the AI assistant's own underlying code; Infrastructure Register is its only existing trigger point in the application today, so under "AtlasCopco" it is unreachable from the UI, by design, matching the original request's own distinction between "remove the button" and "remove the actual modal."
- "Default theme mode light" refers to the experience for visitors with no previously saved theme preference; it does not retroactively change what an already-saved preference shows, and is unaffected by the design schema.
- "The application's one deep navy brand color" refers to the specific color value already confirmed in the application today (and its documented derived shades, such as a button's hover-darkened state) — this feature does not introduce a new color system, only repaints this one color's value under one schema.
- The Atlas Copco logo image is the one attached to this request; it is added to the application's own asset files as part of implementation, not referenced from outside the project.
- The splash screen's existing minimum-display-duration and data-loading-gate behavior (how long it stays visible, and what it waits for before dismissing) is unaffected by removing its animation — only the visual content changes, not the timing/dismissal logic.
