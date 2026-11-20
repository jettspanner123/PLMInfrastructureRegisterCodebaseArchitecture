# Tasks: Uptime Request Dashboard View

**Input**: Design documents from `/specs/003-uptime-request-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/no-new-backend-interface.md, quickstart.md — all complete, zero open `[NEEDS CLARIFICATION]` markers.

**Tests**: Not requested, and this repo still has no test framework — verified manually via quickstart.md's 5 scenarios.

**Organization**: Tasks are grouped by user story (US1/US2/US3, matching spec.md's priorities) to enable independent implementation and testing, except where noted that a task is Foundational (shared by all three).

## Path Conventions

- Frontend only: `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/`
- No backend files are touched by this feature (contracts/no-new-backend-interface.md).

---

## Phase 1: Setup

- [X] T001 Add `recharts` as a new dependency of `PLMInfrastructureRegisterClientServiceLayerMSC` (`npm install recharts`) — the user's explicit choice over a hand-rolled SVG chart (research.md §5).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Every US1/US2/US3 task depends on this phase — the view-mode toggle and the dashboard component's shell must exist first, since none of the three stories' content can render without somewhere to render into.

- [X] T002 [P] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Constants/EnvironmentUptimeRequestsCON.ts`: add constants for the segmented control's two option labels (`"Dashboard"`, `"Form"`) and the dashboard's card titles (`"Total Requests"`, `"Pending"`, `"Approved"`, `"Completed"`), following this file's existing constant-naming convention.
- [X] T003 [P] Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestDashboardStaticComponent.tsx`: an empty-shell component accepting `requests: EnvironmentUptimeRequestInterfaceModel[]` as a prop (the already-fetched list — research.md §3), rendering just a container `div` for now. US1/US3 fill in its actual content; nothing in this task calls Jira, the backend, or any new query.
- [X] T004 Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/EnvironmentUptimeRequestsScreenController.tsx`: import `useIsAdmin` from `AdminIdentityUtility` and `SegmentedControlSharedComponent`; add `const [viewMode, setViewMode] = useState<'dashboard' | 'form'>('dashboard')` (never persisted — spec FR-003, research.md §2); render the segmented control in the header only `{isAdmin && (...)}`, with options `{ value: 'dashboard', label: ... }` / `{ value: 'form', label: ... }` using T002's constants. Depends on: T002.
- [X] T005 In the same file, wrap the existing content area (banner + 50:50 form/list grid) and the new `EnvironmentUptimeRequestDashboardStaticComponent` (T003) in a conditional keyed by `viewMode`, inside `AnimatePresence`/`motion.div` from `motion/react` (crossfade, matching this app's existing `AnimatePresence` usage elsewhere — research.md §6, spec FR-010). Non-admin users (where `viewMode` is always effectively `'form'` since they never see the toggle) must render identically to today — spec FR-002. Depends on: T003, T004.

**Checkpoint**: Admin sees a working, animated Dashboard/Form toggle; Dashboard shows an empty shell; Form shows today's exact existing content; non-admins see no change at all.

---

## Phase 3: User Story 1 - Admin gets an at-a-glance overview by default (Priority: P1) 🎯 MVP

**Goal**: The Dashboard shows four accurate summary cards and a 30-day request-volume trend chart.

**Independent Test**: Log in as admin, land on Dashboard, confirm the four cards' counts and the trend chart's 30 days of data match the real Uptime Request data (quickstart.md Scenario 2 and 5).

- [X] T006 [US1] In `EnvironmentUptimeRequestDashboardStaticComponent.tsx`, compute `totalCount`/`pendingCount`/`approvedCount`/`completedCount` from the `requests` prop (data-model.md §1: `totalCount` = all non-deleted requests regardless of status; the other three = counts where `status` matches `'Pending'`/`'Approved'`/`'Completed'` respectively). Depends on: T003.
- [X] T007 [US1] Render four cards in `EnvironmentUptimeRequestDashboardStaticComponent.tsx` using T006's counts and T002's title constants, styled consistently with this app's existing card/stat conventions (e.g. `CardSharedComponent`). Depends on: T006.
- [X] T008 [P] [US1] In the same file, compute a 30-day daily trend array (data-model.md §2: one entry per calendar day across the last 30 days, oldest first, `{ date: 'YYYY-MM-DD', count }}`, including days with `count: 0` so the axis is continuous — spec FR-007). Depends on: T003.
- [X] T009 [US1] Render the trend array from T008 as a `recharts` `<ResponsiveContainer>` + `<BarChart>` (or `<AreaChart>`), styled with this app's existing accent colors (`#0C2086` light / `sky-400` dark, as already used elsewhere in this feature's own components). Depends on: T001, T008.

**Checkpoint**: User Story 1 is fully functional and independently testable — an admin landing on Dashboard sees accurate cards and a real 30-day trend, even before US2/US3 exist.

---

## Phase 4: User Story 2 - Admin can still submit and manage requests via Form view (Priority: P2)

**Goal**: Selecting "Form" shows exactly today's existing page, unchanged, and switching between the two views always animates.

**Independent Test**: As admin, select "Form" and confirm the submission form + request list feed + banner render exactly as before this feature; switch back and forth and confirm each switch animates; reload the page and confirm it always resets to Dashboard (quickstart.md Scenario 3).

- [X] T010 [US2] Verify (and adjust if needed) that Foundational's T005 conditional renders the *entire* pre-existing content block — `DowntimeAnnouncementBannerSharedComponent` plus the 50:50 form/list grid — completely unmodified when `viewMode === 'form'`, with no new props, wrappers, or behavior changes beyond the `motion.div` crossfade wrapper itself. Depends on: T005.
- [X] T011 [US2] Confirm no persistence mechanism (local storage, URL param, React Query cache, etc.) was introduced for `viewMode` anywhere — a full page reload while on "Form" must land back on "Dashboard" (spec FR-003, research.md §2). This is a verification task, not new code: if T004 was implemented as a plain `useState`, this task only needs a manual reload check per quickstart.md Scenario 3's step 5-6. Depends on: T004.

**Checkpoint**: Both views are reachable, switching is animated, and the default-reset behavior is confirmed — User Stories 1 and 2 together deliver a fully usable toggle.

---

## Phase 5: User Story 3 - Admin retains downtime awareness without the banner (Priority: P3)

**Goal**: The Dashboard shows every currently Active or Scheduled downtime announcement in a read-only list.

**Independent Test**: Create one active and one scheduled downtime announcement, view the Dashboard, confirm both appear with no action controls; let them expire and confirm an empty state appears instead (quickstart.md Scenario 4).

- [X] T012 [US3] In `EnvironmentUptimeRequestDashboardStaticComponent.tsx`, call `TanstackQueryClientService.current.downtimeAnnouncements.useAllDowntimeAnnouncementsQuery(enabled)` with `enabled` passed in as a prop equal to `viewMode === 'dashboard'` from the screen controller (research.md §4 — reuses the existing `enabled`-gated hook so it only fires while Dashboard is actually showing). Depends on: T003, T004.
- [X] T013 [US3] Filter the query's result to `announcement.status !== 'Expired'` (data-model.md §3) and render the remaining items (heading, status, start/end time) in a read-only list — no "End Now" or other action control (spec FR-009). When the filtered list is empty, render this app's existing `EmptyStateSharedComponent` instead of a blank gap (spec.md Edge Cases). Depends on: T012.
- [X] T014 [US3] Confirm `DowntimeAnnouncementBannerSharedComponent` is rendered only inside the `'form'` branch from T005/T010, never inside the Dashboard branch (spec FR-005 — the new list in T013 replaces the banner's purpose on this view only). Depends on: T005, T013.

**Checkpoint**: All three user stories are independently functional — quickstart.md's full Scenario 1-5 walkthrough passes end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T015 Run `tsc -b --force` (frontend) clean.
- [X] T016 Walk through quickstart.md Scenarios 1-5 end-to-end through the actual UI (non-admin sees no change; admin defaults to Dashboard with accurate cards/trend; Form remains reachable and unchanged with animated switching that never persists across reload; the downtime list shows Active+Scheduled with no actions and a proper empty state); confirm no new console errors.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: T001 has no dependencies; needed before T009 (which actually imports `recharts`), not before anything else.
- **Foundational (Phase 2)**: T002/T003 are independent of each other (parallel). T004 depends on T002 (needs the label constants). T005 depends on T003 and T004. Blocks Phase 3-5 entirely.
- **User Story 1 (Phase 3)**: T006 → T007, sequential (same method/file). T008 can run in parallel with T006/T007 (independent computation in the same file, no shared state). T009 depends on T001 and T008.
- **User Story 2 (Phase 4)**: T010 and T011 are both verification-only tasks against Foundational's existing code; no new dependency on US1.
- **User Story 3 (Phase 5)**: T012 → T013 → T014, sequential (same file, each building on the last).
- **Polish (Phase 6)**: Depends on all of Phases 3-5 being complete.

### Parallel Opportunities

- T002 and T003 (Foundational — independent new/edited files).
- T006/T007 and T008 (US1 — independent computations in the same new file, no shared state between the two).
- T010 and T011 (US2 — both are independent verification checks).

## Implementation Strategy

Small enough for one pass: Phase 1 (dependency) → Phase 2 (toggle + empty dashboard shell + animated swap — nothing meaningful to look at yet) → Phase 3 (the actual dashboard value: cards + trend, independently demoable as the MVP) → Phase 4 (confirm the existing form/list genuinely still works and the reset-on-reload behavior holds) → Phase 5 (the downtime list, layered onto the same dashboard component) → Phase 6 (verify everything together). Unlike the prior Jira feature, this one is almost entirely frontend and almost entirely additive — User Story 2 in particular is mostly verification of Foundational's own wiring rather than new code, since "the Form view still works" falls out naturally from how the toggle itself was built.

---

## Phase 7: Revision (2026-11-20) - Simplify Dashboard to 2 cards, drop trend chart, 50:50 layout

**Why**: Direct user follow-up after Phases 1-6 shipped: remove the Approved/Completed cards and the 30-day trend chart entirely, and change the Dashboard's layout from a single stacked column to the same 50:50 split Form view already uses - left pane keeps the (now 2) cards + downtime list, right pane reuses the Form view's own request list feed verbatim.

- [X] T017 Edit `EnvironmentUptimeRequestDashboardStaticComponent.tsx`: remove the Approved/Completed cards and the entire trend chart (data computation, `recharts` imports, and JSX) - leaving just the Total Requests + Pending cards and the unchanged downtime announcements list.
- [X] T018 Edit `EnvironmentUptimeRequestsCON.ts`: remove the now-unused `DASHBOARD_CARD_APPROVED_LABEL`, `DASHBOARD_CARD_COMPLETED_LABEL`, and `DASHBOARD_TREND_TITLE` constants. Depends on: T017.
- [X] T019 Uninstall `recharts` (`npm uninstall recharts`) - it has zero remaining usages after T017. Depends on: T017.
- [X] T020 Edit `EnvironmentUptimeRequestsScreenController.tsx`: restructure the Dashboard branch into the same 50:50 grid the Form branch already uses - left pane renders `EnvironmentUptimeRequestDashboardStaticComponent` (sticky, matching the Form view's left pane), right pane renders `EnvironmentUptimeRequestListFeedStaticComponent` with the same props already passed to it in the Form branch. Depends on: T017.
- [X] T021 Run `tsc -b --force` clean; verify live (both light and dark mode) that the Dashboard now shows 2 cards + downtime list on the left and the full requests list on the right, with no console errors, and that Form view and the admin/non-admin gating are both unaffected. Depends on: T018, T019, T020.

**Known minor inconsistency found during T021, not fixed**: the reused request list feed's empty state says "using the form on the left," which is only true in Form view (Dashboard's left pane has no form). Left as-is pending a decision on whether to special-case the copy per view.

**Docs reconciled**: spec.md (User Story 1, FR-005/FR-006 revised, FR-007 removed, SC-001 revised, Edge Cases, Assumptions), data-model.md (§2 trend model removed), plan.md (Summary and Primary Dependencies revised) - all carry a 2026-11-20 revision note rather than silently rewriting the original design history.
