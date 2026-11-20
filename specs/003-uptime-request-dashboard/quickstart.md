# Quickstart: Uptime Request Dashboard View

Prerequisites: a running frontend (`npm run dev` in `PLMInfrastructureRegisterClientServiceLayerMSC/`) and backend, logged in as a non-admin for Scenario 1, and as an admin (via the existing Admin Login flow) for Scenarios 2-5.

## Scenario 1 - Non-admin sees no change

1. Log out of (or never log into) the admin account.
2. Visit the Uptime Requests page.
3. **Expect**: no segmented control anywhere in the header; the page looks and behaves exactly as it did before this feature - submission form on the left, request list feed on the right, Downtime Announcement banner above both (when one is active).

## Scenario 2 - Admin lands on Dashboard by default

1. Log in as admin.
2. Visit the Uptime Requests page (fresh load).
3. **Expect**: the segmented control shows "Dashboard" selected by default. Four cards (Total, Pending, Approved, Completed) show counts matching what's actually in the system (cross-check against the Form view's list feed). A 30-day trend chart renders with a visible bar/point for every day in the window, including days with zero requests. No Downtime Announcement banner is visible.

## Scenario 3 - Switching to Form and back

1. From the Dashboard (Scenario 2), click "Form" in the segmented control.
2. **Expect**: the content area animates (crossfades) into exactly today's existing form+list+banner view - no instant snap.
3. Click "Dashboard" again.
4. **Expect**: it animates back to the dashboard.
5. Reload the page entirely.
6. **Expect**: regardless of which view was selected before the reload, the page comes back on "Dashboard" (never remembered).

## Scenario 4 - Downtime awareness without the banner

1. As admin, create one Downtime Announcement scheduled for a future start time, and (if possible) one that's currently active.
2. View the Dashboard.
3. **Expect**: both appear in a list on the Dashboard, with no "End Now" or other action control next to them.
4. Let both announcements expire (or delete/end them).
5. **Expect**: the list shows an empty state, not a blank gap.

## Scenario 5 - Trend chart reflects real data

1. As admin, submit a couple of real Uptime Requests (any environment/dates).
2. View the Dashboard.
3. **Expect**: "Total Requests" increases accordingly, "Pending" increases (new requests start Pending), and today's point on the 30-day trend chart increases by the number just created.
