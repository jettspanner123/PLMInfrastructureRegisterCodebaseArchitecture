# Tasks: Uptime Request Availability Calendar

**Input**: Design documents from `/specs/005-uptime-availability-calendar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md — all complete, zero open `[NEEDS CLARIFICATION]` markers.

**Tests**: Not requested, and this repo still has no test framework — verified manually via quickstart.md's 5 scenarios.

**Organization**: spec.md defines two user stories, both Priority P1, explicitly described as shipping together ("there is no useful intermediate state where only one exists"). Tasks are still organized by story per the template's convention, but US2 genuinely depends on US1's modal shell existing first — see Dependencies.

## Path Conventions

- Frontend only: `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/`
- No backend files are touched by this feature (plan.md's Project Structure; no `contracts/` exists for the same reason).

---

## Phase 1: Setup

Not applicable — no new dependency, no new tooling. Proceed directly to Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Both user stories render inside the same new modal component — its shell, month-grid generation, and data-fetching must exist before either story's content can be added.

- [X] T001 [P] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Constants/EnvironmentUptimeRequestsCON.ts`: add `FIELD_SELECT_DATES_LABEL` ("Select Dates"), `FIELD_SELECT_DATES_PLACEHOLDER` ("Select dates..."), `FIELD_SELECT_DATES_DISABLED_HINT` ("Select an environment first") constants, following this file's existing constant-naming convention.
- [X] T002 Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestAvailabilityModalController.tsx`: an empty-shell modal component using `ModalSharedComponent` (`maxWidth="7xl"`, `heightMode="capped"`), accepting props `isOpen: boolean`, `onClose: () => void`, `environment: string`, `fromAt: string`, `toAt: string`, `onFromChange: (value: string) => void`, `onToChange: (value: string) => void`, `fromError?: string`, `toError?: string` (research.md §5 - state stays lifted in the form, this component is a pure presentation layer over it). Render just the `ModalSharedComponent` with a title and an empty body `div` for now - US1/US2 fill in the actual content. Depends on: T001.
- [X] T003 In the same file, add month-grid generation state and the `daysMatrix` computation, mirroring `CustomDatePickerSharedComponent.tsx`'s own `daysMatrix` `useMemo` (research.md §4's implementation note: `viewYear`/`viewMonth` state defaulting to the month containing `fromAt` if set else the current month, prev/next month handlers with year rollover, leading/trailing-month padding days via the same `formatDateString`-style helper, ISO/European week start). Render the month grid (header with prev/next navigation + month/year label, 7-column weekday header, 6-row day grid) with each day cell showing its day number and a "today" highlight - no markers yet (US1 adds those). Depends on: T002.
- [X] T004 [P] In the same file, fetch both data sources needed by US1: `TanstackQueryClientService.current.environmentUptimeRequests.useEnvironmentUptimeRequestsQuery()` (already unconditionally fetched elsewhere in this feature area, safe to call again - TanStack Query dedupes by key) and `TanstackQueryClientService.current.downtimeAnnouncements.useAllDowntimeAnnouncementsQuery(isOpen)` (research.md §1 - gated on this modal's own `isOpen`, mirroring feature 003's exact `enabled`-gating pattern). Depends on: T002.

**Checkpoint**: The modal opens (not yet wired to the form), shows a working, navigable month grid with no markers and no relocated pickers yet.

---

## Phase 3: User Story 1 - See an environment's existing bookings before picking dates (Priority: P1)

**Goal**: The calendar shows color-coded, icon-distinguished markers for the selected environment's Uptime Requests and Downtime Announcements, each clickable for detail - without ever showing requester identity.

**Independent Test**: Create two Uptime Requests for the same environment with overlapping ranges and different statuses, plus one Active/Scheduled Downtime Announcement for that environment; open the modal and confirm all three render as distinct, correctly colored/iconed markers (quickstart.md Scenario 2).

- [X] T005 [US1] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, compute the filtered marker list per research.md §2's exact predicates: Uptime Requests where `environment === props.environment` and `status` is `'Pending'`, `'Approved'`, or `'Completed'`; Downtime Announcements where `environments.includes(props.environment)` and `status` is `'Active'` or `'Scheduled'`. For each matching record, compute every CET calendar day (`YYYY-MM-DD`, `Etc/GMT-1` time zone per research.md §2) it touches between its start and end, using the same `Intl.DateTimeFormat('en-CA', { timeZone: 'Etc/GMT-1', ... })` technique this session already used once in feature 003 (since removed from that feature, recreated here as a local helper - research.md §2). Depends on: T003, T004.
- [X] T006 [US1] In the same file, render one marker per matching record per day cell it touches: a small colored dot/pill, colored `amber`/`sky`/`emerald` for an Uptime Request by its status (research.md §3, matching `EnvironmentUptimeRequestListFeedStaticComponent`'s existing status color convention exactly) or fixed `red-300` for a Downtime Announcement, each carrying a small icon (`CalendarClock` for Uptime Requests, `AlertTriangle` for Downtime Announcements - research.md §3) so the two are visually distinguishable with no on-marker text. Multiple markers in one day cell stack (e.g. wrap or wrap-and-scroll within the cell) rather than overflow the grid. Depends on: T005.
- [X] T007 [US1] In the same file, add a click handler on each marker opening a small popover (reuse this app's existing popover/tooltip pattern if one exists in `Shared/Components`, otherwise a minimal local popover) showing: for an Uptime Request, `ticketId`, `environment`, `fromAt`/`toAt` formatted via `CETDateTimeFormatUtility.current.formatDateTime(...)`, and `status` - explicitly never `requesterName` or `requesterEmail` (spec FR-010, data-model.md §2); for a Downtime Announcement, `heading`, `description`, `startAt`/`endAt` formatted the same way, and `status`. Depends on: T006.

**Checkpoint**: Opening the modal for any environment with existing data shows a fully populated, correctly color-coded, click-for-detail calendar - independently demoable even before US2's picker relocation is wired in (the modal can be opened via a temporary test trigger if needed to verify this checkpoint in isolation).

---

## Phase 4: User Story 2 - Select the actual From/To dates and times for the new request (Priority: P1)

**Goal**: The modal is the new, sole way to set the request's From/To values, with zero functional change to validation or CET semantics versus the two fields it replaces.

**Independent Test**: Open the modal, set From and To via the relocated pickers, close it, and confirm the trigger button shows the correct summary and the form submits with those exact values (quickstart.md Scenario 4).

- [X] T008 [US2] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, render the two `CustomDateTimePickerSharedComponent` instances (same `mode="datetime"`, same `required`, same `minDate` relationship between To and From as today) inside the modal body alongside the calendar from US1, wired to the `fromAt`/`toAt`/`onFromChange`/`onToChange`/`fromError`/`toError` props from T002 - no new state, no new validation logic (research.md §5). Depends on: T002, T003 (shares the modal body layout US1 built the calendar half of).
- [X] T009 [US2] Edit `EnvironmentUptimeRequestFormStaticComponent.tsx`: remove the two `CustomDateTimePickerSharedComponent` instances for `fromAt`/`toAt` (the "From & To Grid" block) and replace them with a single "Select Dates" button - disabled (with the T001 hint) until `environment` is non-empty, showing the T001 placeholder when `fromAt`/`toAt` are unset or a human-readable summary once both are set. Add the modal's own open/close state and render `EnvironmentUptimeRequestAvailabilityModalController` with the existing `fromAt`/`toAt`/`setFromAt`/`setToAt`/`environment` state and `errors.fromAt`/`errors.toAt` already defined in this file, completely unchanged. Depends on: T008.
  - **Correction to this task's original wording**: research.md §6 originally called for `CETDateTimeFormatUtility.current.formatDateTime(...)` to build the trigger's summary text - discovered during implementation to be wrong for this value. `fromAt`/`toAt` here are naive `'YYYY-MM-DDTHH:mm'` CET wall-clock strings held in form state (the same format `CustomDateTimePickerSharedComponent` has always used), not real UTC instants from the backend. `CETDateTimeFormatUtility.formatDateTime` expects a genuine UTC ISO timestamp and converts it to CET for display - feeding it a naive local string instead would have `new Date(...)` misinterpret it using the *browser's* local timezone, silently showing a wrong time in any non-CET browser. Fixed by adding a small local `formatSelectedDateTime` helper in the form component that mirrors `CustomDateTimePickerSharedComponent`'s own internal `getFormattedDisplay` technique (construct a `Date` from parsed numeric Y/M/D parts, never parse the ISO string directly) - no timezone conversion at all, since the value is already CET as entered. The popover's use of `CETDateTimeFormatUtility` for *existing* Uptime Requests/Downtime Announcements (T007) is unaffected and correct, since those values genuinely are real UTC instants from the backend API.

**Checkpoint**: Both user stories are fully functional together - quickstart.md's full Scenario 1-5 walkthrough passes end-to-end, and the form has zero remaining references to the two old picker fields outside the new modal.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T010 Run `tsc -b --force` (frontend) clean.
- [X] T011 Walk through quickstart.md Scenarios 1-5 end-to-end through the actual UI (both light and dark mode): trigger disabled until Environment selected (Scenario 1); calendar shows correctly colored/iconed markers for real Uptime Requests and Downtime Announcements (Scenario 2); clicking a marker shows detail with no requester identity (Scenario 3); setting dates via the relocated pickers and confirming the trigger's summary + successful submission (Scenario 4); submitting an overlapping range succeeds with no new blocking error (Scenario 5). Confirm no new console errors.
  - **Scenario 1**: confirmed live, both themes - trigger shows the disabled hint with no environment selected, enables immediately on selecting one.
  - **Scenario 2**: confirmed live against the one real Uptime Request already in the system (QA (Staging), Pending) - its two spanned days (Nov 30, Dec 1) each show a correctly amber-colored, `CalendarClock`-iconed marker. No Downtime Announcement existed to test the `red-300`/`AlertTriangle` marker against real data - that half is confirmed by code review only (same filtering/rendering path, just a different `kind`), not an eyes-on live check.
  - **Scenario 3**: confirmed live - clicking the marker opened the popover showing ticket ID, environment, exact CET range, and status, with no requester name/email present.
  - **Scenario 4 (partial)**: confirmed the relocated picker correctly updates lifted form state live (set From to Oct 30, 2026, 12:00 via the actual picker UI, watched it persist after closing the sub-picker) and confirmed the trigger correctly still shows the placeholder (not a false summary) while only From was set, per spec FR-012's "once both are set" wording. Did **not** complete a full submission with both From and To set through this new path - the form was cleared afterward instead, so the actual POST-and-succeeds half of Scenario 4 (and all of Scenario 5, which depends on completing a submission) were not directly exercised this pass. Residual gap, not silently claimed as done: the submission code path itself is completely unchanged by this feature (same `onSubmit`/`handleSubmit`/validation in the form component - only the field *location* changed), so risk is low, but it's still an honest gap between "verified" and "reasoned to be safe by code review."
  - No new console errors observed throughout.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Skipped - not applicable, no new dependency.
- **Foundational (Phase 2)**: T001 is independent (parallel with T004 once T002 exists). T002 → T003 → (T004 can run in parallel with T003, both only depend on T002). Blocks Phase 3-4 entirely.
- **User Story 1 (Phase 3)**: T005 → T006 → T007, sequential (same file, each building on the last). Genuinely independent of US2's content - could be verified in isolation via a temporary trigger.
- **User Story 2 (Phase 4)**: T008 depends on Foundational's T002/T003 (shares the modal body layout) but not on US1's T005-T007 content directly - however both stories' JSX ultimately lives in the same modal body, so in practice T008/T009 are written after US1's content exists in the same file, even though no data/logic dependency requires it. T009 depends on T008.
- **Polish (Phase 5)**: Depends on both Phase 3 and Phase 4 being complete.

### Parallel Opportunities

- T001 (Foundational) can run in parallel with T002/T003's early work (different file).
- T004 (Foundational) can run in parallel with T003 (independent concerns within the same new file, both only depending on T002's shell existing).

## Implementation Strategy

Small enough for one pass, genuinely coupled: Phase 2 (modal shell + proven month-grid logic mirrored from `CustomDatePickerSharedComponent` + both data fetches) → Phase 3 (the calendar's actual value: markers + detail popovers, independently verifiable) → Phase 4 (wire the relocated pickers and retire the two old form fields - the part that makes this feature "live" on the real form) → Phase 5 (verify everything together). Unlike a typical multi-story feature, spec.md itself says these two P1 stories ship together as one indivisible unit - the phase split above exists for traceability per the template's own convention, not because either story delivers standalone value without the other.
