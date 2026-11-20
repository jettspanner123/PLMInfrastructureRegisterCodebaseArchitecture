# Feature Specification: Animated Dashboard Counters

**Feature Branch**: `004-animated-dashboard-counters`

**Created**: 2026-11-20

**Status**: Reverted (2026-11-20)

**Input**: User description: "In the dashboard view, in the top cards, instead of just a static number, use the NumberFlow animated number component (https://number-flow.barvian.me/)."

> **Reverted**: Implemented and verified per tasks.md T001-T005, then the user asked to revert it immediately after - "no need for animation and all just keep it as a number please." The code was reverted (the `<NumberFlow>` swap undone, `@number-flow/react` uninstalled) and this feature is not active. Kept for history rather than deleted.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin sees count changes animate instead of jump (Priority: P1)

An admin viewing the Uptime Requests Dashboard watches the "Total Requests" and "Pending" counts animate smoothly (digits rolling/transitioning) whenever the underlying count changes, instead of the number instantly replacing itself with no transition.

**Why this priority**: This is the entire feature - there is no secondary behavior to build. The value is purely in how the existing counts are displayed.

**Independent Test**: With the Dashboard open, cause a count to change (submit a new Uptime Request, or have another session do so) and observe the affected card's number animate to its new value rather than jumping instantly.

**Acceptance Scenarios**:

1. **Given** the Dashboard is open showing a "Total Requests" count of N, **When** a new Uptime Request is created (incrementing the count to N+1), **Then** the card animates from N to N+1 instead of instantly displaying N+1.
2. **Given** the Dashboard is open showing a "Pending" count, **When** that count changes for any reason (new request, status change, deletion), **Then** the same card animates to the new value.
3. **Given** the Dashboard loads for the first time in a session (no prior displayed value to animate from), **When** the cards first render, **Then** the counts display correctly (an initial animate-in or an immediate static display are both acceptable - no jarring or incorrect value).

---

### Edge Cases

- What happens if the count doesn't change between renders (e.g. switching between Dashboard and Form and back)? No animation plays - the component only animates when its underlying value actually changes.
- What happens if a user has "reduce motion" enabled at the OS level? The animation is skipped or reduced per that preference, consistent with this app's general approach to motion (the existing Dashboard/Form view-switch animation and other `motion`-based transitions already in this app do not special-case reduced-motion, so no new behavior is required beyond what the chosen component provides by default).
- What happens to the card's layout/size while a multi-digit transition is animating (e.g. 9 to 10)? The card must not visibly reflow, jump, or clip during the transition.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Dashboard view's "Total Requests" and "Pending" summary cards MUST display their counts using an animated-transition number component, instead of a static text number.
- **FR-002**: When either count's underlying value changes while the Dashboard is visible, the displayed number MUST visibly animate from the old value to the new value.
- **FR-003**: When a count's value does not change, no animation MUST play (re-rendering the same value must not retrigger an animation).
- **FR-004**: The animated number MUST visually match the existing card styling (size, weight, color, font) the static number previously used, in both light and dark mode.
- **FR-005**: This feature MUST NOT change what the two counts represent or how they are computed - only how the already-correct values are displayed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a count changes while an admin is looking at the Dashboard, the admin visually perceives a transition rather than an instant jump, within the same render cycle the count update would have occurred anyway (no added delay before the new value is reflected).
- **SC-002**: The Dashboard's visual appearance (card layout, number size/position) is unchanged from before this feature, except for the added transition animation itself.

## Assumptions

- "Top cards" refers to the Dashboard view's two existing summary cards (Total Requests, Pending) added in the 003-uptime-request-dashboard feature - this feature only changes how their numbers are displayed, not which cards exist or what they count.
- The user named a specific component by URL (NumberFlow, `@number-flow/react` on npm, confirmed via its own documentation) rather than leaving the choice open - this is a direct implementation instruction, not an ambiguity to resolve.
- No new backend behavior, data, or API changes are required - this is a purely visual, frontend-only change to an already-complete feature.
