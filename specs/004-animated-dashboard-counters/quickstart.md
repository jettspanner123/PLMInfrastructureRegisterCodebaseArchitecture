# Quickstart: Animated Dashboard Counters

Prerequisites: a running frontend (`npm run dev` in `PLMInfrastructureRegisterClientServiceLayerMSC/`), logged in as admin (the Dashboard view is admin-only, per feature 003).

## Scenario 1 - Counts display correctly on first load

1. Log in as admin, visit the Uptime Requests page (lands on Dashboard by default).
2. **Expect**: "Total Requests" and "Pending" cards show their correct current counts, styled identically to before this feature (same size, weight, color, font, in both light and dark mode).

## Scenario 2 - A count animates when it changes

1. With the Dashboard open and visible, submit a new Uptime Request (via Form view, then switch back to Dashboard - or have another browser/session do it while Dashboard stays open).
2. **Expect**: "Total Requests" (and "Pending", since a new request starts Pending) visibly transition from the old value to the new one - not an instant jump.

## Scenario 3 - No animation when the value hasn't changed

1. With the Dashboard open, switch to Form view and back to Dashboard without changing any data.
2. **Expect**: the cards show the same values as before, with no animation replaying (nothing changed, so nothing should visibly transition).

## Scenario 4 - No layout shift during a multi-digit transition

1. Arrange for a count to cross a digit boundary (e.g. 9 → 10) - submit enough requests, or use an existing dataset already near a boundary.
2. **Expect**: the card does not visibly reflow, jump, or clip its border/padding while the extra digit animates in.
