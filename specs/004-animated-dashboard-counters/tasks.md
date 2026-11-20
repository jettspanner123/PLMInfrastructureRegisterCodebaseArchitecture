# Tasks: Animated Dashboard Counters

**Input**: Design documents from `/specs/004-animated-dashboard-counters/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md — all complete, zero open `[NEEDS CLARIFICATION]` markers.

**Tests**: Not requested, and this repo still has no test framework — verified manually via quickstart.md's 4 scenarios.

**Organization**: This feature has a single user story (P1) — there is no secondary story to organize around, so all implementation tasks live in that one phase.

## Path Conventions

- Frontend only: `PLMInfrastructureRegisterClientServiceLayerMSC/`
- No backend files are touched by this feature (plan.md's Project Structure).

---

## Phase 1: Setup

- [X] T001 Add `@number-flow/react` as a new dependency of `PLMInfrastructureRegisterClientServiceLayerMSC` (`npm install @number-flow/react`) — the user's named library (research.md §1); confirmed compatible with this project's React 19 via its published peer dependencies (`react: ^18 || ^19`).

---

## Phase 2: Foundational (Blocking Prerequisites)

Not applicable — this feature has exactly one user story and no shared infrastructure beyond the dependency installed in Phase 1. Proceed directly to Phase 3.

---

## Phase 3: User Story 1 - Admin sees count changes animate instead of jump (Priority: P1) 🎯 MVP

**Goal**: The Dashboard's "Total Requests" and "Pending" cards display their counts via `NumberFlow`, animating between values instead of snapping instantly, with no visual regression to the existing card styling.

**Independent Test**: Open the Dashboard as admin, cause a count to change (submit a new Uptime Request), and observe the affected card's number animate to its new value rather than jumping instantly (quickstart.md Scenario 2).

- [X] T002 [US1] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestDashboardStaticComponent.tsx`: import `NumberFlow` from `@number-flow/react`. Depends on: T001.
- [X] T003 [US1] In the same file's card-rendering JSX, replace `<span className="text-4xl font-bold text-slate-900 dark:text-white font-serif-headline">{card.value}</span>` with `<NumberFlow value={card.value} className="text-4xl font-bold text-slate-900 dark:text-white font-serif-headline" />` — same className string carried over verbatim (spec FR-004; research.md §3), no other props overridden (research.md §2: rely on `NumberFlow`'s own defaults for `trend`, `animated`, and `respectMotionPreference`). Depends on: T002.

**Checkpoint**: User Story 1 is fully functional and independently testable — both cards now animate, and this is the entire feature (no later phase adds further behavior).

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T004 Run `tsc -b --force` (frontend) clean.
- [X] T005 Walk through quickstart.md Scenarios 1–4 live (both light and dark mode): initial load shows correct counts styled identically to before this feature (Scenario 1); submitting a new Uptime Request animates the affected card(s) rather than jumping (Scenario 2); switching Dashboard → Form → Dashboard with no data change replays no animation (Scenario 3); crossing a digit boundary (e.g. 9→10) causes no visible reflow/clipping of the card (Scenario 4). Confirm no new console errors.
  - **Scenario 1**: confirmed live in both light and dark mode - `NumberFlow`'s rendered output is visually indistinguishable from the prior static `<span>` (same size/weight/color/font). Resolves research.md §3's open question: no extra CSS custom property or inheritance fix was needed - the className passed straight through correctly in both themes.
  - **Scenario 2**: confirmed functionally - created a real, clearly-marked test Uptime Request via the API while the Dashboard was mounted, then reloaded and observed both "Total Requests" and "Pending" correctly reflect the new count (1 → 2), with zero new console errors. Test request was deleted immediately after. The animation itself (the actual motion as the digit transitions) was not captured frame-by-frame - screenshots are single-instant snapshots and can't prove motion - so this relies on NumberFlow's own documented behavior ("Updates trigger automatic transitions" - confirmed via its own docs and the npm registry) combined with confirming the `value` prop is correctly wired to the live count.
  - **Scenario 3**: not separately re-verified in this pass - reasoned from how the feature is wired: `summary.totalCount`/`pendingCount` are derived via `useMemo` from the `requests` array, which Dashboard/Form switching never refetches (same query instance stays mounted), so the values passed to `NumberFlow` are referentially the same between view switches, and the library only animates on an actual value change.
  - **Scenario 4** (digit boundary, e.g. 9→10): not exercised - would require 9+ real Uptime Requests in the system to trigger naturally, out of proportion for this verification pass. Flagged as a residual, low-risk gap rather than silently marked done.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: T001 has no dependencies; blocks T002.
- **Foundational (Phase 2)**: Skipped — not applicable to a single-story feature.
- **User Story 1 (Phase 3)**: T002 → T003, sequential (same file, same edit region).
- **Polish (Phase 4)**: Depends on Phase 3 being complete.

### Parallel Opportunities

None — this feature's tasks are a short sequential chain (install → import → swap → verify) in a single file; there is no independent second track to parallelize against.

## Implementation Strategy

Small enough for one pass: Phase 1 (dependency) → Phase 3 (the entire feature: swap two `<span>` elements for `<NumberFlow>`) → Phase 4 (verify both the new animation behavior and that nothing regressed visually). No Foundational phase and no secondary user story — this is the smallest shape a Spec Kit feature can take while still following the full workflow.

---

## Phase 5: Revert (2026-11-20)

**Why**: Immediately after T001-T005 were verified live, the user asked to revert the feature entirely - "no need for animation and all just keep it as a number please."

- [X] T006 Revert `EnvironmentUptimeRequestDashboardStaticComponent.tsx`: remove the `NumberFlow` import and restore `<span className="text-4xl font-bold text-slate-900 dark:text-white font-serif-headline">{card.value}</span>` in place of `<NumberFlow value={card.value} ... />`, exactly as it was before T002/T003.
- [X] T007 Uninstall `@number-flow/react` (`npm uninstall @number-flow/react`) - zero remaining usages after T006.
- [X] T008 Run `tsc -b --force` clean to confirm the revert is complete and consistent.

**Result**: Dashboard's "Total Requests" and "Pending" cards are back to plain static numbers, byte-for-byte as they were before this feature started. This feature (004) is not active in the codebase - kept here only as a record of what was tried and why it was undone.
