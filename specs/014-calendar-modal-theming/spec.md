# Feature Specification: Calendar Modal Light/Dark Theming

**Feature Branch**: `014-calendar-modal-theming`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "now, let's do the theme wise color for the calendar view modal in the 'Uptime Request' please, as of now it is only hard coded for dark mode but not for light mode"

## Clarifications

### Session 2026-11-26

- Q: The calendar modal has a separate set of colors for booking/status event cards (Pending/Approved/Completed/Downtime), deliberately chosen in a prior feature (010-calendar-status-colors) as semantic status indicators. Should those status-card colors also get a light-mode variant, or stay fixed regardless of theme? → A: Keep status colors fixed in both modes — only the modal's own chrome (sidebar, grid, borders, text) gets a light variant.
- Q: What should the new light-mode palette look like for everything else in the modal (canvas, sidebar, borders, text tones)? → A: Match this application's own existing light-mode design tokens, so the modal looks like a natural part of this app's light mode rather than a separate visual style.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The calendar modal matches the application's active theme (Priority: P1)

A user opens the Uptime Request page's calendar view (the Microsoft Teams-style calendar modal used to pick an availability window) while the application is in light mode, and sees the modal's background, sidebar, borders, and text rendered in colors appropriate for light mode — instead of today's behavior, where the modal always renders with the same dark backdrop and light text regardless of which theme the rest of the application is in.

**Why this priority**: This is the entire scope of the feature — today the modal is the one remaining surface in the application that ignores the user's theme choice entirely.

**Independent Test**: With the application in light mode, open the calendar modal and confirm its background, sidebar, borders, and every text tone read as light-mode-appropriate (not the same dark backdrop shown today); switch to dark mode and confirm the modal still renders exactly as it does today.

**Acceptance Scenarios**:

1. **Given** the application is in light mode, **When** a user opens the calendar modal, **Then** the modal's canvas, sidebar, main content area, borders, dividers, and every text tone render using the application's own existing light-mode colors, not the modal's current always-dark colors.
2. **Given** the application is in dark mode, **When** a user opens the calendar modal, **Then** it renders exactly as it does today, pixel-for-pixel unchanged.
3. **Given** either theme, **When** a user views a booking/status event card (Pending, Approved, Completed, or a downtime announcement) inside the modal, **Then** that card's own colors are identical in both themes, unaffected by this feature.
4. **Given** the application is in light mode, **When** a user interacts with any hover, selection, or preview state inside the modal (hovering a time slot, starting a selection, previewing a range, viewing today's highlighted column, viewing the selected week in the mini-calendar), **Then** every one of those states remains clearly visible and legible against the new light-mode background.
5. **Given** a user switches the application's theme while the calendar modal is already open, **When** the theme change takes effect, **Then** the modal's own colors update to match, the same way every other themed surface in the application already does.

### Edge Cases

- What happens to the modal's close button, scrollbar, and the subtle pulse/pop-in animations used for slot selection and new event cards? They must remain clearly visible and legible in light mode, using colors consistent with the rest of the modal's new light-mode palette, not left using their current dark-only values.
- What happens to the "Today" badge, the day-number accent color, and the building icon used on weekday columns? These function as the modal's own interactive/brand accent (not literal chrome or status semantics) and are reasonably expected to read fine against either background without needing a separate light-mode value, per this feature's own research into their actual contrast behavior.
- What happens to a user who has never changed their theme (first-time visitor, defaulting to light mode)? They see the new light-mode calendar modal by default, the same way every other screen in the application already defaults to light mode for first-time visitors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the application is in light mode, the calendar modal's canvas, sidebar, main content area, header bars, borders, dividers, and scrollbar MUST render using the application's own existing light-mode colors, rather than the modal's current always-dark values.
- **FR-002**: When the application is in light mode, every text tone in the calendar modal (headings, labels, day numbers, weekday abbreviations, muted/secondary text) MUST render using the application's own existing light-mode text colors, rather than the modal's current always-light-on-dark values.
- **FR-003**: When the application is in dark mode, the calendar modal MUST continue to render exactly as it does today, with no visual change from this feature.
- **FR-004**: Booking/status event card colors (Pending, Approved, Completed, and downtime announcement cards) MUST remain exactly as they are today, unaffected by this feature, in both light and dark mode.
- **FR-005**: Every interactive/state color inside the modal (hover backgrounds, the in-progress selection highlight, the range-preview highlight, the current-day/current-hour highlight, the disabled-slot background, the selected-week highlight in the mini-calendar) MUST have a light-mode-appropriate value that remains clearly visible and legible against the new light-mode background.
- **FR-006**: If the application's theme changes while the calendar modal is open, the modal's own colors MUST update to match, consistent with how every other themed surface in the application already behaves.

### Key Entities

- **Calendar Modal Theme Palette**: The full set of chrome colors (backgrounds, borders, text tones, hover/selection/preview states, scrollbar) used by the calendar modal. Today this is a single, always-dark palette; this feature adds a second, light-mode palette that activates whenever the application itself is in light mode. Booking/status event card colors are explicitly outside this entity's scope (per Clarifications).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the calendar modal's chrome surfaces (canvas, sidebar, borders, text) render in the application's own light-mode colors when the application is in light mode.
- **SC-002**: 100% of the calendar modal's chrome surfaces remain pixel-identical to today's appearance when the application is in dark mode.
- **SC-003**: 100% of booking/status event card colors are identical between light and dark mode, both before and after this feature.
- **SC-004**: Every interactive/hover/selection state inside the modal remains visibly distinguishable from its surrounding surface in light mode (not washed out or illegible).

## Assumptions

- "Theme wise color" refers to the application's existing light/dark mode mechanism (the same toggle and default-to-light-for-first-time-visitors behavior already used everywhere else), not a new, separate theming concept introduced just for this modal.
- The modal's accent/interactive blue tones (the "Today" badge, the day-number accent, the building icon, and the selection/preview highlight colors) are left unchanged in this feature's initial scope, since they already function as mid-tone accents likely to read clearly against either a light or dark background — this is a working assumption to be confirmed visually during implementation, not a settled design decision; if any of them prove illegible against the new light background, they get their own light-mode-appropriate adjustment at that point.
- This feature only changes the one existing calendar modal (`EnvironmentUptimeRequestAvailabilityModalController.tsx`) and its own scoped styles; no other screen, modal, or shared component is affected.
