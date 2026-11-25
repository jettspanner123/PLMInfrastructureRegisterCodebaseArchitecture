---

description: "Task list for 009-calendar-backend-integration"
---

# Tasks: Calendar Backend Integration

**Input**: Design documents from `/specs/009-calendar-backend-integration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test framework exists in either project (confirmed this session); verification is the manual quickstart.md walkthrough (direct endpoint calls + Chrome DevTools MCP). No test tasks are included.

**Projects touched**: `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/` (backend, C#) and `PLMInfrastructureRegisterClientServiceLayerMSC/` (frontend, TypeScript/React) — file paths below are relative to the repository root.

**Revision note**: This list was expanded during planning after a gap was found and the user approved closing it: the calendar's picked date/time never actually reached the outer "Submit Request" form (confirmed: `environment`/`fromAt`/`toAt`/`onFromChange`/`onToChange` were declared props, never used). The outer form itself was already fully wired on its own side. This added User Story 6 and reshaped the Foundational phase around a single "everything derived, nothing stored" architecture for `events` (research.md §6/§9) — see spec.md's second Clarifications entry.

## Phase 1: Setup

- [X] T001 Run `dotnet build` (from `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/`) and `npx tsc -b` + `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) to confirm a clean baseline before this feature's edits begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The one shared architecture change every user story needs — including closing the picked-span-never-reaches-the-form gap, which turned out to collapse into the same "derive, don't store" redesign the real-data rendering already needed.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestAvailabilityModalController.tsx`, extend the `TeamsCalendarEvent` shape with two new fields per data-model.md: `source: 'inProgress' | 'uptimeRequest' | 'downtime'` and `backendId?: string` (present only when `source !== 'inProgress'`).
- [X] T003 Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Helpers/CalendarBookingConversionHelper.ts` (singleton `CalendarBookingConversionHelper.current`) exposing both conversion directions, extracting the day-decomposition math currently inline in `handleSlotClick`'s pick-completion branch so all call sites share one implementation (research.md §7/data-model.md):
  - `convertRangeToEvents(fromAt: Date, toAt: Date, allDays: WeekDay[], title: string, source: 'inProgress' | 'uptimeRequest' | 'downtime', backendId?: string): TeamsCalendarEvent[]` — one entry per calendar day the span touches, clipped to that day's actual hour range; `endHour` derived from the timestamp's end hour minus 1 (the grid's existing inclusive-hour display convention); any day outside `allDays` is skipped, not clamped.
  - `convertPickToDateTimeStrings(startDayIndex: number, startHour: number, endDayIndex: number, endHour: number, allDays: WeekDay[]): { fromAt: string; toAt: string }` — the reverse, producing the naive `"YYYY-MM-DDTHH:mm"` strings `CreateEnvironmentUptimeRequestInputInterfaceModel` already expects (`endHour + 1` again).
- [X] T004 In the same modal file: remove the existing `const [events, setEvents] = useState<TeamsCalendarEvent[]>([])`. Destructure `environment`, `fromAt`, `toAt`, `onFromChange`, `onToChange` from props (currently declared in the props interface but unused). Rewrite `handleSlotClick`'s pick-completion branch (both clicks of a span now made) to compute the naive datetime strings via `CalendarBookingConversionHelper.current.convertPickToDateTimeStrings(...)` and call `onFromChange(fromAtString)` / `onToChange(toAtString)` — instead of writing into the now-removed local state (research.md §9). Add a parsing step (constructing a `Date` from the naive string's numeric Y/M/D/H parts individually — the same technique `EnvironmentUptimeRequestFormStaticComponent.tsx`'s own `formatSelectedDateTime` already uses, never `new Date(isoString)`) and derive `const inProgressEvents = (fromAt && toAt) ? CalendarBookingConversionHelper.current.convertRangeToEvents(parsedFromAt, parsedToAt, allDays, '...', 'inProgress') : []`. Establish `const events = [...inProgressEvents];` as the new base — later user stories append their own derived consts to this same array (data-model.md's "`events` is a fully derived value" section). The transient half-made-selection state (`startSlot`/`hoverSlot`/`previewRange`, before a pick's second click completes it) stays local, untouched by this change.

**Checkpoint**: Foundation ready — `TeamsCalendarEvent` can represent real backend data, a shared conversion routine exists for every direction this feature needs, and the in-progress pick is now a controlled view of the outer form's own `fromAt`/`toAt` state rather than anything the modal stores itself.

---

## Phase 3: User Story 6 - The picked slot actually becomes the submitted ticket (Priority: P1)

**Goal**: Completing a pick propagates to the outer form immediately, and survives the calendar being closed and reopened before submission.

**Independent Test**: Pick a range, confirm the outer form's "Select dates..." button updates immediately; close and reopen the calendar, confirm the same range still shows (FR-014/FR-015).

**Note**: Like Foundational-adjacent stories in prior features of this app, there is no additional implementation task here beyond Phase 2 — propagation-on-pick and persistence-across-reopen both fall directly out of T004's redesign (the in-progress card is always derived from the props the write-path just updated). This phase is pure verification of what Phase 2 already delivers. The other two acceptance scenarios for this story (clearing on delete, clearing on successful submit — FR-016/FR-017) are verified alongside User Story 4's and the final Polish pass respectively, since they depend on that other wiring also existing.

- [X] T005 [US6] Manually verify via quickstart.md Scenario 8, steps 1-2 only (propagate-on-pick, persist-across-reopen).

**Checkpoint**: User Story 6's core loop works independently and is ready for the rest of the feature to build on.

---

## Phase 4: User Story 1 - See what's already booked before picking a time (Priority: P1) 🎯 MVP

**Goal**: Existing uptime requests for the selected environment render as real event cards on the calendar.

**Independent Test**: With an existing Approved uptime request for an environment, open the calendar for that environment and confirm its real event card appears at the correct date/time with real details (FR-001/FR-002).

### Implementation for User Story 1

- [X] T006 [US1] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/EnvironmentUptimeRequestsController.cs`, add three optional `[FromQuery]` parameters (`string? environment`, `DateTime? fromAt`, `DateTime? toAt`) to the existing `GetAllEnvironmentUptimeRequests` action and pass them through to the service — per contracts/calendar-backend-endpoints.md §1. Calling the action with none of them MUST return the exact same result as today.
- [X] T007 [US1] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/Services/EnvironmentUptimeRequestsService.cs`, extend `GetAllEnvironmentUptimeRequestsAsynchronous` to accept the same three optional parameters and apply each filter only when its value is provided: exact match on `Environment`; otherwise include the row unfiltered. Date filter: only include a row when its `[FromAt, ToAt]` window overlaps `[fromAt, toAt]`, applied only when both `fromAt` and `toAt` are supplied (research.md §1).
- [X] T008 [US1] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/Assertion/EnvironmentUptimeRequestsAssertion.cs`, add a validation check (following the existing `Assert*`/`ValidationException` pattern) that if exactly one of `fromAt`/`toAt` is supplied without the other, the request is rejected with a clear message — both or neither.
- [X] T009 [US1] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Services/EnvironmentUptimeRequestsService.ts`, add a method that calls the existing GET-all endpoint with the new optional `environment`/`fromAt`/`toAt` query parameters.
- [X] T010 [US1] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Constants/TanstackQueryKeysCON.ts`, add `ENVIRONMENT_UPTIME_REQUESTS_FOR_ENVIRONMENT: (environment: string) => [...]` following the existing parameterized-key precedent (e.g. `CHAT_CONVERSATIONS`). In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Services/TanstackQueryClientService.ts`, add `useEnvironmentUptimeRequestsForEnvironmentQuery(environment: string, fromAt: Date, toAt: Date, enabled: boolean)` calling T009's new service method, `staleTime` matching the existing `useEnvironmentUptimeRequestsQuery`'s 60s (no polling yet — added in User Story 5).
- [X] T011 [US1] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, call the new query hook (scoped to the modal's `environment` prop, now already in use per T004, and the calendar's fixed 5-week `allDays` range). Define `const realUptimeEvents = ...` from the returned requests whose `Status` is Pending, Approved, or Completed (FR-001 — Rejected/Cancelled excluded), converting each via `CalendarBookingConversionHelper.current.convertRangeToEvents(...)` with `title` set to the environment name + time range text, `source: 'uptimeRequest'`, `backendId` set to the request's `Id`. Extend `const events = [...inProgressEvents, ...realUptimeEvents];`.
- [X] T012 [US1] In the same file, confirm `uptimeRequest`-sourced cards render with the environment name and time range visible without a click (FR-002) using the existing card markup (no new styling needed — this story's cards use the existing default color).
- [X] T013 [US1] Manually verify via quickstart.md Scenario 1 (steps 1 and 2) and Scenario 3 (steps 1 and 3).

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 5: User Story 2 - See downtime windows alongside bookings (Priority: P1)

**Goal**: Downtime announcements overlapping the calendar's 5-week range render as red event cards, including future-scheduled ones.

**Independent Test**: With a downtime announcement scheduled two weeks out for an environment, open the calendar for that environment and scroll to that week; confirm the red card appears (FR-003/FR-004).

### Implementation for User Story 2

- [X] T014 [US2] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Factories/ApplicationRouteFactory.cs`, add a new route constant for the `InRange` action under the existing `DowntimeAnnouncementRoutes` class (e.g. alongside `Active`/`EndEarly`), preserving the `/Api/V1/DowntimeAnnouncements` controller prefix.
- [X] T015 [US2] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/DowntimeAnnouncementsController.cs`, add a new `GET` action at that route, with **no `[Authorize]` attribute** (same public tier as the existing `GetActiveDowntimeAnnouncement`), taking required `[FromQuery] DateTime fromAt, [FromQuery] DateTime toAt` — per contracts/calendar-backend-endpoints.md §2.
- [X] T016 [US2] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/Services/DowntimeAnnouncementsService.cs`, add `GetDowntimeAnnouncementsInRangeAsynchronous(DateTime fromAt, DateTime toAt)` returning every non-deleted `DowntimeAnnouncementDTO` whose `[StartAt, EndAt]` overlaps `[fromAt, toAt]`, across all environments (no environment filter server-side — research.md §2).
- [X] T017 [US2] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/DowntimeAnnouncements/Assertion/DowntimeAnnouncementsAssertion.cs`, add a validation check that both `fromAt` and `toAt` are present and `fromAt <= toAt`, rejecting with a `ValidationException` otherwise (matching the existing assertion throwing convention).
- [X] T018 [US2] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/DowntimeAnnouncements/Services/DowntimeAnnouncementsService.ts`, add a method calling the new `InRange` endpoint with `fromAt`/`toAt`.
- [X] T019 [US2] In `TanstackQueryKeysCON.ts`, add `DOWNTIME_ANNOUNCEMENTS_IN_RANGE: (fromAt: string, toAt: string) => [...]`. In `TanstackQueryClientService.ts`, add `useDowntimeAnnouncementsInRangeQuery(fromAt: Date, toAt: Date, enabled: boolean)` calling T018's method, `staleTime` matching the existing `useActiveDowntimeAnnouncementQuery`'s 30s (no polling yet — added in User Story 5).
- [X] T020 [US2] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, call the new downtime query hook with the calendar's fixed 5-week range. Define `const realDowntimeEvents = ...` from the results filtered client-side to only those whose `Environments` array includes the modal's `environment` prop, converting each via `CalendarBookingConversionHelper.current.convertRangeToEvents(...)` with `title` set to the downtime's `Heading`, `source: 'downtime'`, `backendId` set to the announcement's `Id`. Extend `const events = [...inProgressEvents, ...realUptimeEvents, ...realDowntimeEvents];`.
- [X] T021 [US2] In the same file, render `downtime`-sourced cards with a red background/border (FR-004) — a new conditional className branch distinct from the existing default/uptime-request styling.
- [X] T022 [US2] Manually verify via quickstart.md Scenario 2 and Scenario 3 (step 2).

**Checkpoint**: User Stories 1, 2, and 6 all work independently — real bookings, real downtime, and the picked-span round-trip all render correctly.

---

## Phase 6: User Story 3 - Open details for an existing booking (Priority: P2)

**Goal**: Clicking a real event card (uptime request or downtime) opens a compact, read-only details modal.

**Independent Test**: Click an existing uptime request's card; confirm a details modal opens with requester, environment, date/time range, status, and message (FR-005/FR-006). Click a downtime card; confirm its own details modal opens (FR-007).

### Implementation for User Story 3

- [X] T023 [US3] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestDetailModalController.tsx` — a read-only `[Name]ModalController.tsx` (exported `EnvironmentUptimeRequestDetailModalControllerProps` interface, explicit `React.JSX.Element` return type) showing requester name/email, environment, date/time range, a status badge, and message, adapting the existing `DetailFieldRow`-style field layout from `EnvironmentUptimeRequestDetailScreenController.tsx` rather than reinventing it, plus the "modal data caching ref" pattern (CODING-RULES.md §10.2) so it doesn't vanish mid-exit-animation. Include a link/button navigating to `ApplicationRouteCON.ENVIRONMENT_UPTIME_REQUEST_DETAIL_PATTERN` for status/admin-message edits (FR-006) — no inline editing controls in this modal.
- [X] T024 [P] [US3] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/DowntimeAnnouncementDetailModalController.tsx` — a read-only modal showing heading, description, affected environments, and time window (FR-007), same caching-ref pattern as T023.
- [X] T025 [US3] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, wire a left-click handler on any `uptimeRequest`/`downtime`-sourced card: look up the full `EnvironmentUptimeRequestDTO`/`DowntimeAnnouncementDTO` from the relevant query's already-fetched data by the card's `backendId` (no new fetch — data-model.md's `CalendarExistingBookingsQuery state`), and open the matching modal from T023/T024 with it.
- [X] T026 [US3] Manually verify via quickstart.md Scenario 4.

**Checkpoint**: All of User Stories 1, 2, 3, and 6 work independently and together.

---

## Phase 7: User Story 4 - Undo an in-progress slot pick before submitting (Priority: P2)

**Goal**: Right-clicking the viewer's own not-yet-submitted pick offers a "Delete" option that also clears the outer form's picked range; right-clicking any real (backend-sourced) card does not.

**Independent Test**: Pick a date/time span, right-click it, confirm exactly one "Delete" option, click it, confirm the card disappears with no network call, and the outer form's picked-range display also clears (FR-008/FR-009/FR-010/FR-016).

### Implementation for User Story 4

- [X] T027 [US4] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, render one `ContextMenuSharedComponent` instance (local `{isOpen, x, y}` state), following the exact usage pattern already established in `ResourcesScreenController.tsx`. Wire `onContextMenu` per event card: for `source === 'inProgress'` cards, open the menu with a single `isDestructive` "Delete" `ContextMenuItem`; for `source === 'uptimeRequest'` or `'downtime'` cards, call `event.preventDefault()` only — no menu, no native browser menu either (research.md §5 / FR-010). Confirmed during planning that no part of this wiring exists yet in this file.
- [X] T028 [US4] Wire the "Delete" menu item's `onClick` to call `onFromChange('')` and `onToChange('')` (FR-016) — since the in-progress card is derived entirely from those props (T004), clearing them is the complete removal; no other local state needs touching, and no backend call is made (FR-009).
- [X] T029 [US4] Manually verify via quickstart.md Scenario 5, and quickstart.md Scenario 8 step 3 (the outer form's picked-range display also clears).

**Checkpoint**: All of User Stories 1, 2, 3, 4, and 6 work independently and together.

---

## Phase 8: User Story 5 - Stay current without manual refresh (Priority: P3)

**Goal**: The two new queries poll every 15 seconds while the calendar is open, so another user's or admin's change becomes visible without the viewer taking any action.

**Independent Test**: With the calendar open in one browser context, submit a new uptime request for the same environment from a second context; confirm the first context's calendar shows it within 15 seconds (FR-012).

### Implementation for User Story 5

- [X] T030 [US5] In `TanstackQueryClientService.ts`, add `refetchInterval: 15000` and `enabled: isOpen` (the modal's open state, passed through from the calling hook) to `useEnvironmentUptimeRequestsForEnvironmentQuery` (research.md §4).
- [X] T031 [US5] In the same file, add the identical `refetchInterval: 15000` / `enabled: isOpen` to `useDowntimeAnnouncementsInRangeQuery`.
- [X] T032 [US5] Manually verify via quickstart.md Scenario 6.

**Checkpoint**: All six user stories complete and independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T033 In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, add a small, non-blocking inline notice shown when either new query's `isError` is true, reusing this codebase's existing lightweight toast/notice pattern (not a new component) — the calendar must still open and still allow the in-progress pick regardless (FR-013 / research.md §8).
- [X] T034 Run `dotnet build` (backend) and `npx tsc -b` + `npx oxlint` (frontend) against the final state of every file touched by this feature; confirm no new warnings/errors.
- [X] T035 Run the complete quickstart.md walkthrough (all 8 scenarios, in order, in one sitting) — direct endpoint calls for Scenarios 1-2 and 7, live Chrome DevTools MCP for the rest, including Scenario 8's step 4 in full context now that every other story is done — confirming no regression to features 006/007/008's booking-selection, today/current-time coloring, weekend muting, scroll-to-now-on-open, or scrollable-weeks behavior.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Story 6 (Phase 3)**: Depends only on Foundational, and is almost entirely delivered by it (see the phase's Note) — verification-only, like Foundational-delivered stories in prior features of this app.
- **User Story 1 (Phase 4)**: Depends only on Foundational. Fully independent of User Story 2.
- **User Story 2 (Phase 5)**: Depends only on Foundational. Fully independent of User Story 1.
- **User Story 3 (Phase 6)**: Depends on Foundational (the `source`/`backendId` fields and the query caches it reads from). Soft dependency: independently testing this story needs at least one real card already rendering, in practice meaning User Story 1 or 2 has been completed first.
- **User Story 4 (Phase 7)**: Depends only on Foundational (the `source` discriminant and the `onFromChange`/`onToChange` props T004 already wires in). Fully independent of User Stories 1-3.
- **User Story 5 (Phase 8)**: Depends on User Story 1 AND User Story 2 (it adds polling to both of their query hooks).
- **Polish (Phase 9)**: Depends on all user stories being complete, including the full Scenario 8 walkthrough (which itself depends on User Stories 1, 4, and 6 all being done).

### Parallel Opportunities

- T023 and T024 (the two new detail modal files) touch different files with no shared dependency and can be done in parallel.
- Once Foundational (Phase 2) completes, User Story 1 (Phase 4), User Story 2 (Phase 5), and User Story 4 (Phase 7) have no dependencies on each other and could be worked in parallel by different people; User Story 3 (Phase 6) and User Story 5 (Phase 8) are best done after at least one/both of the P1 rendering stories so there's something real to click/poll during verification.
- No other [P] markers — most tasks within a story are either same-file sequences (controller → service → assertion within one backend feature) or deliberately ordered (service before the hook that calls it, hook before the component that calls it).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — this also fully delivers User Story 6 as a side effect.
2. Complete Phase 3 (User Story 6 — verification only) and Phase 4 (User Story 1).
3. **STOP and VALIDATE**: run quickstart.md Scenario 1 + Scenario 3 (steps 1/3) + Scenario 8 (steps 1-2) independently — a safe, shippable increment: real uptime-request bookings are visible, and a picked span actually reaches the outer form, even before downtime, details modals, delete, or live polling exist.

### Incremental Delivery

1. Setup + Foundational → shared data shape ready, picked-span round-trip already works.
2. User Story 6 → validate (verification only).
3. User Story 1 → validate → real uptime-request bookings visible (MVP).
4. User Story 2 → validate → downtime windows visible too.
5. User Story 3 → validate → click-for-details works on both kinds of real cards.
6. User Story 4 → validate → right-click delete correctly scoped and clears the outer form too.
7. User Story 5 → validate → cross-tab live updates.
8. Polish → full regression pass, including the full Scenario 8 walkthrough.

### Notes

- Tasks span two independently-ruled projects (backend C#, frontend TypeScript) — each respects its own `CODING-RULES.md` throughout.
- No automated tests (none exist in either project); live manual verification via quickstart.md per this project's standing practice.
