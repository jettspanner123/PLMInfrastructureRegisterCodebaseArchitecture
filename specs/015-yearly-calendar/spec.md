# Feature Specification: Yearly Maintenance Calendar Page

**Feature Branch**: `015-yearly-calendar`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "create a new page, this page is like a yearly calendar, users can view this page (no login required), but any changes like adding some event or something like that requires admin access, this page is basically a yearly calendar, a slide bar shows a monthly wise calendar, user can click on any month they like, and in the space left other than the sidebar, there will be a full grid view of the entire selected month, from 1 to 30 or 27 or 31 whatever it is, i already have the design and layout of the exact thing in the PLMInfrastructureRegisterAgentDocumentationNMSC\UI_HTML\YEARLY_CALENDAR_VIEW.html file, please read it and implement it in a new page, add the new page in the top navigation links segmented controller — this page can be accessible by all either by user or admin — the code the file has is a pure HTML CSS JavaScript file but when you are adapting it please make sure to use React code and use all the tools or functions or things we already have — currently the HTML code is of different design scheme or something like that when you are implementing make sure to use our design scheme our colors and all — basically let's do the front end for now and let's not talk about the back end for now please — the new page that you will be creating for this will have no page header"

## Clarifications

### Session 2026-11-26

- Q: This pass is frontend-only, with no backend yet. Should the page actually include a working "Add Event" interaction for admins in this iteration, or should it be pure viewing/navigation for now, with event creation deferred to a later backend-integrated feature? → A: View/navigate only for now — event creation (and the admin-gating around it) becomes its own later feature once a backend exists.
- Q: What should the new navigation link say, and what should the page's URL be? → A: "Yearly Calendar" / `/yearly-calendar`.
- Q: The user provided further context describing how activities/events will eventually work (multi-day date ranges, with no limit on how many can overlap the same days) — does this change this pass's scope to actually render sample events on the grid, or is it forward-looking context only? → A: Both — the grid's layout is built ready for that future overlapping-activities model, AND this pass includes sample/placeholder activity data now, purely so the visual (including overlapping multi-day activities) can be seen and evaluated; this sample data is preview-only, with no backend or persistence behind it (amends FR-009 below).
- Q: Should the month-change animation match the calendar modal's own scope exactly (only the text label slides) or go further? → A: Both the month/year text label AND the day grid itself slide together, directionally, when the viewed month changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anyone can browse the yearly maintenance calendar by month (Priority: P1)

Any visitor — whether logged in as an admin or not — can open the "Yearly Calendar" page from the top navigation and see a full, correctly-laid-out grid of every day in a given month, with a month-picker sidebar that lets them jump to any month of any year, a one-click way back to the current month, and no sign-in step required at any point.

**Why this priority**: This is the entire scope of the feature for this pass — a complete, working viewing/navigation experience, with event creation explicitly deferred (see Clarifications).

**Independent Test**: Load the application as a logged-out visitor, open the Yearly Calendar page, confirm it renders without prompting for login, pick several different months (including months in a different year) from the sidebar, and confirm the main grid updates each time to show that month's full set of days correctly positioned under their weekday columns.

**Acceptance Scenarios**:

1. **Given** a visitor with no admin session, **When** they open the Yearly Calendar page, **Then** it renders fully and immediately, with no login prompt or access restriction of any kind.
2. **Given** the Yearly Calendar page is open, **When** the visitor picks a month from the sidebar's month selector, **Then** the main grid updates to show every day of that month, each positioned under its correct day-of-week column (Sunday through Saturday), spanning as many full weeks as that month requires.
3. **Given** the sidebar's month selector is showing one year, **When** the visitor navigates to the previous or next year, **Then** the sidebar's 12-month selector updates to that year, and picking any of its months updates the main grid accordingly.
4. **Given** the Yearly Calendar page is open on any month other than the current one, **When** the visitor uses the "Today" control, **Then** the view returns to the current month, with today's date visually distinguished from every other day in the grid.
5. **Given** the current month is in view, **When** the grid renders, **Then** today's date is visually distinguished from every other day shown.
6. **Given** the Yearly Calendar page, **When** it renders, **Then** it does not show the standard page title/subtitle header block used by this application's other pages — the main content area starts directly with the calendar's own view controls.
7. **Given** the Yearly Calendar page is open, **When** the visitor changes the viewed month (via the arrow buttons, the sidebar, or the Today control), **Then** both the month/year label and the day grid itself animate with a directional slide — toward one side for a later month/year, the other side for an earlier one — rather than changing abruptly.

### User Story 2 - A preview of how overlapping multi-day activities will look (Priority: P2)

A visitor sees sample activities placed on the grid, each spanning a range of consecutive days, so the visual design for a real activity/event system can be evaluated before any backend exists. Several sample activities can occupy the same or overlapping days at once, with no fixed limit on how many can overlap, and every one of them stays individually visible rather than being hidden behind another.

**Why this priority**: This is a visual preview, not the real feature — it depends on User Story 1's grid already existing, and is lower priority than the core browsing experience itself.

**Independent Test**: With the page showing a month that includes the sample activity data, confirm at least one activity visibly spans more than one day, confirm at least two sample activities overlap the same day(s), and confirm both remain individually readable rather than one obscuring the other.

**Acceptance Scenarios**:

1. **Given** a month containing a sample activity that spans multiple consecutive days, **When** the grid renders, **Then** that activity's full date range reads as one continuous span from its start day through its end day.
2. **Given** a month containing two or more sample activities whose date ranges overlap (sharing some or all of the same days), **When** the grid renders, **Then** every one of those activities remains individually visible and distinguishable, with no limit on how many may overlap the same days.
3. **Given** the sample activity data shown, **When** a visitor reads it, **Then** nothing presents it as real, persisted data — it is understood as a preview of the future activity feature, not an operational schedule.

### Edge Cases

- What happens for a month that doesn't evenly fill whole weeks (e.g. a month starting mid-week or ending mid-week)? The grid shows the minimum number of full Sunday-to-Saturday rows needed to contain every day of the selected month, including a few leading/trailing days from the adjacent months where needed to complete those rows (matching the reference design), visually de-emphasized so the selected month's own days remain the clear focus.
- What happens for months of different lengths (28, 29, 30, or 31 days, and leap-year February)? The grid always shows the correct number of days for that specific month and year, with no fixed day count assumed.
- What happens if a visitor is already logged in as an admin when they open this page? They see the exact same viewing/navigation experience as any other visitor — there is nothing for this pass to gate, since event creation/editing is out of scope for now (see Clarifications and Assumptions).
- What happens to year navigation at very distant past or future years? No limit is imposed in this pass; a visitor can navigate indefinitely in either direction.
- What happens to a sample activity whose date range would extend into an adjacent month, beyond the currently-selected month's own days? This pass's sample data stays fully contained within whichever single month it is meant to demonstrate, so no sample activity needs to be clipped or continued across a month boundary; a real activity that spans a month boundary is left for the future, backend-integrated feature to handle.
- What happens when far more activities overlap the same days than can fit while each stays fully readable at once? Every overlapping activity still renders as its own distinct, individually-colored element (per User Story 2); exactly how much visual detail each one shows at a given width is a presentation choice left to implementation, not a constraint on how many may overlap.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST provide a new page, reachable from the top navigation under the label "Yearly Calendar," that any visitor can open without any login or access check.
- **FR-002**: The page MUST show a sidebar that lets the visitor pick any of the 12 months of a given year, and navigate that year selector backward or forward to a different year.
- **FR-003**: The page MUST show, in the remaining space beside the sidebar, a full grid of every day of the currently-selected month, with each day positioned under its correct day-of-week column.
- **FR-004**: The day grid MUST correctly reflect the selected month's actual length (28–31 days, including leap-year February) and MUST span only as many calendar-week rows as that month requires.
- **FR-005**: The page MUST provide a one-click "Today" control that returns the view to the current month and year.
- **FR-006**: When the current month is shown, the grid MUST visually distinguish today's date from every other day shown.
- **FR-007**: The page MUST NOT render this application's standard per-page title/subtitle header block that other pages show; its main content begins directly with the calendar's own view controls.
- **FR-008**: The page's visual design (colors, corner rounding, light/dark mode behavior, typography) MUST follow this application's own existing design system, not the reference file's own distinct color scheme.
- **FR-009**: This pass MUST include sample/placeholder activity data for preview purposes only — not real data from any backend — and MUST present it in a way that is clearly understood as preview content, not an operational schedule (amended per Clarifications; supersedes this requirement's original "no events at all" wording).
- **FR-010**: The grid MUST support a sample activity whose date range spans more than one consecutive calendar day, rendering its full span (start day through end day) as one continuous activity.
- **FR-011**: The grid MUST support more than one sample activity occupying the same or overlapping date range at once, with no fixed limit on how many may overlap the same days.
- **FR-012**: When sample activities overlap, each one MUST remain individually visible and distinguishable — never obscured or merged into an indistinguishable block.
- **FR-013**: Changing the viewed month, by any means (the arrow buttons, the sidebar's month/year picker, or the Today control), MUST animate both the month/year label and the day grid with a directional slide transition — one direction for moving to a later month/year, the other for an earlier one — rather than an abrupt change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of days in any selected month are shown, each correctly positioned under its actual day-of-week column, verified across at least one 28-day, one 30-day, one 31-day, and one leap-year 29-day February.
- **SC-002**: A visitor with no admin session can reach and fully use the page with zero login prompts, 100% of the time.
- **SC-003**: Switching the selected month or year updates the visible grid with no full-page reload.
- **SC-004**: The "Yearly Calendar" link is present in the top navigation on every page load and correctly opens this page.
- **SC-005**: The page's colors and corner rounding match this application's own existing light/dark mode design system, not the reference file's own fixed dark-only palette.
- **SC-006**: 100% of sample overlapping-activity scenarios shown render every activity individually visible, with none hidden behind another, regardless of how many activities overlap the same days.
- **SC-007**: 100% of month changes animate both the label and the grid with a directional slide; none happen as an abrupt, unanimated jump cut.

## Assumptions

- The reference file (`PLMInfrastructureRegisterAgentDocumentationNMSC\UI_HTML\YEARLY_CALENDAR_VIEW.html`) is a layout/structure reference only — its own color palette and fonts are not carried over; only its structural idea (year/month sidebar picker + full main-pane month grid with weekday columns, multi-day activity bars, overlapping-activity handling) is adapted, rebuilt with this application's own existing design tokens and components. Per the amended Clarifications, the reference file's own sample event *content* (its specific fictional activity names/dates) is not reused verbatim either — this pass's own sample data is built fresh, sized to clearly demonstrate multi-day spans and overlapping ranges within a single month.
- This pass's sample activity data is illustrative only, invented for this pass to demonstrate the layout — it does not represent any real, currently-planned maintenance window or activity.
- The calendar week starts on Sunday, matching the reference file's own weekday header order (Sunday through Saturday).
- "Any changes like adding some event... requires admin access" describes a future capability, not built in this pass (per Clarifications). When that capability is built, it is expected to reuse this application's existing admin-access mechanism (the same `useIsAdmin()`-gated pattern already used to gate edit controls on Infrastructure Register, Uptime Request, and Environment Overview), rather than introducing a new access-control mechanism — but the actual gated add/edit UI, and any data persistence behind it, is explicitly out of scope for this spec.
- "No page header" means this page omits the per-page title/subtitle block each other page currently renders inside its own content (e.g. "Infrastructure Register" / "Azure Resources tracked by this register."); the application's top navigation bar itself is unaffected and still appears, since the page must still be reachable from it.
- No backend changes are included in this pass; the page is a purely visual/navigational frontend experience for this round, consistent with the user's own explicit request to defer backend discussion.
