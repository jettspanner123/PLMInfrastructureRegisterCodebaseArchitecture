# Quickstart: Uptime Request Availability Calendar

Prerequisites: a running frontend (`npm run dev` in `PLMInfrastructureRegisterClientServiceLayerMSC/`) and backend, any user (this feature is not admin-gated - it lives on the ordinary Uptime Request submission form everyone already sees).

## Scenario 1 - Trigger is disabled until an Environment is picked

1. Open the Uptime Requests page (Form view).
2. **Expect**: the "Select Dates" button (where "From (CET)"/"To (CET)" used to be) is disabled, with a hint that an Environment must be selected first.
3. Select an Environment.
4. **Expect**: the "Select Dates" button becomes enabled.

## Scenario 2 - Calendar shows existing bookings for the selected environment, color-coded

1. Using two different real (or test) Uptime Requests already in the system for the same environment with different statuses (e.g. one Pending, one Approved), select that environment on the form and click "Select Dates".
2. **Expect**: the large modal opens showing a month calendar; both requests' day(s) show a marker in their respective status color (amber for Pending, sky for Approved), each with the Uptime Request icon.
3. Create (or use an existing) Active or Scheduled Downtime Announcement listing that same environment.
4. **Expect**: its day(s) also show a marker, in `red-300`, with the Downtime Announcement icon - visually distinct from the Uptime Request markers.

## Scenario 3 - Clicking a marker shows detail, without requester identity

1. With the modal open and at least one Uptime Request marker visible, click it.
2. **Expect**: a popover shows that request's ticket ID, environment, CET time range, and status - no requester name or email anywhere in the popover.
3. Click a Downtime Announcement marker.
4. **Expect**: a popover shows its heading, description, CET time range, and status.

## Scenario 4 - Setting dates still works exactly as before, just relocated

1. With the modal open, use the two date/time picker controls inside it to set a From and a To value.
2. Close the modal.
3. **Expect**: the "Select Dates" button now shows a human-readable summary of the chosen range (e.g. "Nov 30, 2026, 12:00 AM → Dec 2, 2026, 12:00 AM").
4. Submit the form with these values (plus the other required fields).
5. **Expect**: submission succeeds exactly as it did before this feature - same validation, same backend call, same resulting Uptime Request.

## Scenario 5 - Overlap is informational only, never blocking

1. Repeat Scenario 4 but deliberately choose a date range that overlaps an existing visible marker from Scenario 2.
2. **Expect**: submission still succeeds - no new validation error appears because of the overlap.
