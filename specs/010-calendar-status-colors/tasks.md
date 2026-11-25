---

description: "Task list for 010-calendar-status-colors"
---

# Tasks: Calendar Event Card Status Colors

**Input**: Design documents from `/specs/010-calendar-status-colors/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated test framework exists in this project; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

**File**: Every task below edits the same single file — `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestAvailabilityModalController.tsx` — so no task in this list is marked `[P]`.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) against the current state of `EnvironmentUptimeRequestAvailabilityModalController.tsx` to confirm a clean baseline before this feature's edits begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Get each real uptime-request event carrying its own status, and have the literal per-status color classes ready to look up — both needed before the single user story can wire them together.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, extend the `TeamsCalendarEvent` interface with one new optional field: `status?: EnvironmentUptimeRequestStatusEnumModel` (present only when `source === 'uptimeRequest'` — data-model.md's `TeamsCalendarEvent` extension).
- [X] T003 In the same file, where `realUptimeEvents` is built (the existing `.flatMap((request) => CalendarBookingConversionHelper.current.convertRangeToEvents(...))` call from feature 009), wrap that call's result with `.map((event) => ({ ...event, status: request.status }))` so every day-segment produced from one request carries that request's own status (research.md §3) — `CalendarBookingConversionHelper` itself is not touched.
- [X] T004 In the same file, add a new literal (non-interpolated) constant, `BOOKING_STATUS_CARD_STYLES: Record<string, { card: string; stripe: string; pill: string }>`, keyed by `EnvironmentUptimeRequestStatusEnumModel.Pending` / `.Approved` / `.Completed`, with these exact values (data-model.md's `BookingStatusCardStyles` table — research.md §1/§2):
  - Pending: `{ card: 'bg-[#ffa826] border border-[#ffa826]/50', stripe: 'bg-[#ffcf88]', pill: 'bg-[#8c5c15]' }`
  - Approved: `{ card: 'bg-[#26acff] border border-[#26acff]/50', stripe: 'bg-[#88d1ff]', pill: 'bg-[#155f8c]' }`
  - Completed: `{ card: 'bg-[#29d944] border border-[#29d944]/50', stripe: 'bg-[#89ea98]', pill: 'bg-[#177725]' }`

**Checkpoint**: Foundation ready — every real uptime-request event carries its own status, and the exact literal classes for all three recognized statuses exist as one lookup.

---

## Phase 3: User Story 1 - Tell a booking's status apart at a glance (Priority: P1) 🎯 MVP

**Goal**: Each existing-booking event card's background, border, stripe, and time pill all reflect its own status color; the in-progress pick and downtime cards stay exactly as they are today.

**Independent Test**: Open the calendar for an environment with at least one Pending, one Approved, and one Completed booking visible at once; confirm each renders with its own distinct, correct color across background/border/stripe/pill, and that in-progress/downtime cards are unaffected (quickstart.md Scenarios 1-2).

### Implementation for User Story 1

- [X] T005 [US1] In `EnvironmentUptimeRequestAvailabilityModalController.tsx`, inside the `dayEvents.map((ev) => ...)` render block, replace the current three separate `isDowntime ? x : y` ternaries (one each for the card's own className, the stripe's className, and the pill's className) with one computed `cardColors = { card, stripe, pill }` object per card, resolved in this order (research.md §4): `isDowntime` → the existing fixed red styling (`bg-[#5a2323] border border-[#e35b5b]/50` / `bg-[#e35b5b]` / `bg-[#7a3232]`, unchanged); else `ev.source === 'uptimeRequest' && ev.status` present in `BOOKING_STATUS_CARD_STYLES` → that entry; else (the in-progress pick, or a defensive fallback) → the existing fixed purple styling (`bg-[#3d375a] border border-[#5b5fc7]/50` / `bg-[#7b83eb]` / `bg-[#464775]`, unchanged). Reference `cardColors.card`/`cardColors.stripe`/`cardColors.pill` at the three spots that previously used the inline ternaries. Do not change any text color class anywhere on the card (FR-006).
- [X] T006 [US1] Manually verify via quickstart.md Scenario 1 (each of Pending/Approved/Completed renders its own distinguishable background/border/stripe/pill, with unchanged text) and Scenario 3 (at-a-glance distinguishability across all three at once).
- [X] T007 [US1] Manually verify via quickstart.md Scenario 2 (the in-progress pick and an existing downtime card are both pixel-for-pixel unaffected by this feature).

**Checkpoint**: User Story 1 — the entire feature — is fully functional and independently testable.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T008 Run `npx tsc -b` and `npx oxlint` against the final state of `EnvironmentUptimeRequestAvailabilityModalController.tsx`; confirm no new warnings/errors.
- [X] T009 Run the complete quickstart.md walkthrough (all 3 scenarios, in one sitting) live via Chrome DevTools MCP, confirming no regression to features 006-009's calendar behavior (scrolling, jump controls, booking-selection, right-click delete, details modals, live polling).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS the user story.
- **User Story 1 (Phase 3)**: Depends only on Foundational. This feature has exactly one user story, so there is no cross-story independence to manage.
- **Polish (Phase 4)**: Depends on User Story 1 being complete.

### Parallel Opportunities

None — every task in this feature edits the same single file.

---

## Implementation Strategy

### MVP First (and only) Scope

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1) — this delivers the entire feature.
3. **STOP and VALIDATE**: run quickstart.md's full 3-scenario walkthrough.
4. Complete Phase 4 (Polish).

### Notes

- No `[P]` markers anywhere — every task touches the same one file.
- No automated tests (none exist in this repo); live manual verification via Chrome DevTools MCP per this project's standing practice.
