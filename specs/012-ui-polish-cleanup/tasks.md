---

description: "Task list for 012-ui-polish-cleanup"
---

# Tasks: UI Polish & Feature Request Removal

**Input**: Design documents from `/specs/012-ui-polish-cleanup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test framework exists in this project; verification is the manual quickstart.md walkthrough via Chrome DevTools MCP. No test tasks are included.

**Note**: This file was regenerated to add User Story 6 (brand navy re-theme) and User Story 7 (splash screen), amending the already-implemented Round 1/2 scope (User Stories 1-5, all previously completed and verified live). Task IDs below are renumbered in full priority order; phases/tasks already shipped keep their `[X]` status.

## Phase 1: Setup

- [X] T001 Run `npx tsc -b` and `npx oxlint` (from `PLMInfrastructureRegisterClientServiceLayerMSC/`) plus `dotnet build` (from `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/`) to confirm a clean baseline before this feature's edits begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Seed and expose the `FRONTEND_DESIGN_SCHEMA` setting so every gated user story has one shared, correctly-defaulting value to read.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Add a new EF Core migration under `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Migrations/` seeding one row into `IG_ConfigurationConstantTBL` via `migrationBuilder.InsertData(...)`: `ConfigurationKey = "FRONTEND_DESIGN_SCHEMA"`, `ConfigurationValue = "[\"ATLASCOPCO\"]"`.
- [X] T003 [P] In `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/ConfigurationConstants/Assertion/ConfigurationConstantsAssertion.cs`, add `["FrontendDesignSchema"] = "FRONTEND_DESIGN_SCHEMA"` to the existing `OptionsFieldNameToConfigurationKey` dictionary.
- [X] T004 Create `PLMInfrastructureRegisterClientServiceLayerMSC/src/Utilities/FrontendDesignSchemaUtility.ts`, exporting `useFrontendDesignSchema(): 'WePLM' | 'AtlasCopco'` and `useIsFrontendDesignSchemaResolved(): boolean`, built on `TanstackQueryClientService.current.configurationConstants.useOptionsQuery('FrontendDesignSchema')`.

**Checkpoint**: The `FRONTEND_DESIGN_SCHEMA` setting is seeded, servable through the existing generic endpoint, and readable from any React component via one shared hook.

---

## Phase 3: User Story 1 - A design schema setting decides which look is shown (Priority: P1) 🎯 MVP

**Goal**: The application reads the design schema once per page load and makes it available everywhere else that needs to branch on it, defaulting correctly when unset or unrecognized.

**Independent Test**: Set the `FRONTEND_DESIGN_SCHEMA` row to each of its two values (and to a missing/unrecognized value) in turn and confirm `useFrontendDesignSchema()` resolves to the expected value each time.

### Implementation for User Story 1

- [X] T005 [US1] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Router/ApplicationRouter.tsx`, call `useFrontendDesignSchema()` at the same top-level spot the existing theme-class bootstrap already runs, and toggle a new `schema-atlascopco` class on both `document.documentElement` and `document.body`, present only when resolved `'AtlasCopco'`, defaulting present (optimistic) during the initial loading window.

**Checkpoint**: Checking/un-checking the `schema-atlascopco` class now correctly reflects the backend's `FRONTEND_DESIGN_SCHEMA` value on every page load.

---

## Phase 4: User Story 2 - Consistent, sharper corners under the AtlasCopco schema (Priority: P1)

**Goal**: Every rounded rectangular surface in the application becomes 6px while `schema-atlascopco` is present, and reverts to today's existing rounding when it is absent.

**Independent Test**: With the design schema set to `AtlasCopco`, compare corner rounding on a representative sample of surfaces across both light and dark mode; repeat with `WePLM` and confirm each reverts to its original rounding.

### Implementation for User Story 2

- [X] T006 [US2] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/index.css`, add a CSS rule under `.schema-atlascopco` redefining Tailwind v4's `--radius-xs` through `--radius-4xl` theme variables to `6px`.
- [X] T007 [US2] In the same file, under the same selector, add the two hardcoded-radius exceptions: `.data-table-sticky-header-container` top corners and `[data-sonner-toast]`'s own radius, both to `6px`.
- [X] T008 [US2] Manually verify quickstart.md Scenario 2.

**Checkpoint**: User Stories 1 and 2 together deliver the full corner-radius change.

---

## Phase 5: User Story 3 - Light mode as the default first-time experience, regardless of schema (Priority: P2)

**Goal**: Confirm the already-existing light-mode-by-default behavior is genuinely unaffected by either design schema value.

### Implementation for User Story 3

- [X] T009 [US3] Manually verify quickstart.md Scenario 3 — no code change expected; confirms FR-007/FR-008 hold under both schema values.

**Checkpoint**: Light-mode-by-default is confirmed unconditional on the design schema.

---

## Phase 6: User Story 6 - The brand navy color re-themes under the AtlasCopco schema (Priority: P2)

**Goal**: Every surface using the application's one deep navy brand color (and its hover/active/tint derived shades) shows `#008eb8` (and its own derived shades) instead, while `schema-atlascopco` is present, and the original navy unchanged while it is absent — per data-model.md's `BrandColorPalette` table and research.md §6.

**Independent Test**: With the design schema set to `AtlasCopco`, sample a primary button, a table header, the navigation active-item highlight, a focus ring, and the "Scheduled" downtime status tag, confirming all show `#008eb8` (or a proportionally-derived shade); repeat under `WePLM` and confirm all show the original navy, unchanged.

### Implementation for User Story 6

- [ ] T010 [US6] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/index.css`, add four new custom properties to the existing `:root` block — `--color-brand: #0C2086`, `--color-brand-hover: #081765`, `--color-brand-active: #051047`, `--color-brand-tint: #1e3ab8` — then override all four under `.schema-atlascopco` to `#008eb8`, `#006a89`, `#004a60`, `#12b9ea` respectively (per data-model.md's `BrandColorPalette` table). Also change `--table-selection-border-color`'s existing `:root` value from the literal `#0c2086` to `var(--color-brand)`, and add a `.schema-atlascopco { --table-selection-border-color: #008eb8; }` override — leave its separate pre-existing `.dark` override (`#60a5fa`) completely untouched.
- [ ] T011 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence (`#0C2086`/`#0D2086`/`#081765`/`#051047`/`#1e3ab8`, preserving each one's exact Tailwind arbitrary-value prefix/opacity-suffix) for the matching `var(--color-brand*)` reference, in these 8 files: `src/Shared/Components/ChatAssistantSharedComponent.tsx` (also replace the raw inline `style={{backgroundColor:'#0C2086'}}` with `style={{backgroundColor:'var(--color-brand)'}}`), `src/Shared/Components/ColumnVisibilityDropdownSharedComponent.tsx`, `src/Shared/Components/CustomTimePickerSharedComponent.tsx`, `src/Shared/Components/ButtonSharedComponent.tsx`, `src/Shared/Components/MarkdownMessageSharedComponent.tsx`, `src/Shared/Components/CustomSelectSharedComponent.tsx`, `src/Shared/Components/ConfirmationModalSharedComponent.tsx` (includes the `--color-brand-active` usage), `src/Shared/Components/CreatableCustomSelectSharedComponent.tsx`.
- [ ] T012 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in these 8 files: `src/Shared/Components/CustomDateTimePickerSharedComponent.tsx`, `src/Shared/Components/CustomDatePickerSharedComponent.tsx`, `src/Shared/Components/CopyableTableCellSharedComponent.tsx`, `src/Shared/Components/ExpandableSearchSharedComponent.tsx`, `src/Shared/Components/CreateOptionModalController.tsx`, `src/Shared/Components/TableHorizontalScrollPillSharedComponent.tsx` (includes the `--color-brand-tint` usage), `src/Shared/Components/TableHeaderCellSharedComponent.tsx`, `src/Shared/Components/ProfileSettingsSharedComponent.tsx`.
- [ ] T013 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in: `src/Features/FeatureRequests/Components/FeatureRequestFormStaticComponent.tsx`, `src/Features/FeatureRequests/Components/FeatureRequestCardStaticComponent.tsx`.
- [ ] T014 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in: `src/Features/EnvironmentOverview/Constants/EnvironmentOverviewCON.ts`, `src/Features/EnvironmentOverview/Components/UptimeScheduleModalController.tsx`, `src/Features/EnvironmentOverview/EnvironmentOverviewScreenController.tsx`.
- [ ] T015 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in: `src/Features/Resources/ResourcesScreenController.tsx`, `src/Features/Resources/Components/AddCustomColorModalController.tsx`.
- [ ] T016 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in `src/Features/DowntimeAnnouncements/Components/DowntimeAnnouncementHistoryModalController.tsx` — this is the "Scheduled" status-tag's own file; per the Clarifications session, recolor it with no exception carved out.
- [ ] T017 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in `src/Features/ChatAssistant/Components/ClarifyingQuestionCardSharedComponent.tsx`.
- [ ] T018 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in these 5 files: `src/Features/EnvironmentUptimeRequests/EnvironmentUptimeRequestDetailScreenController.tsx`, `src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestCardStaticComponent.tsx`, `src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestDetailModalController.tsx`, `src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestDashboardStaticComponent.tsx`, `src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestFormStaticComponent.tsx`.
- [ ] T019 [P] [US6] (depends on T010) Substitute every literal brand-navy hex occurrence for the matching `var(--color-brand*)` reference, in `src/Features/Navigation/NavigationController.tsx` — do not touch this file's unrelated `'feature-requests'` nav-filtering logic from User Story 5.
- [ ] T020 [US6] (depends on T011-T019) Manually verify quickstart.md Scenario 5: all sampled brand-navy surfaces (including the "Scheduled" tag) show `#008eb8` under `AtlasCopco` and the original navy under `WePLM`; confirm a `dark:text-blue-400`-style Tailwind-stock dark-mode substitute (never the literal brand navy) is unaffected either way.

**Checkpoint**: The brand-color re-theme is independently testable by toggling the schema value alone, with zero regression to any surface's hover/active/tint relationships.

---

## Phase 7: User Story 4 - A simpler Infrastructure Register header under the AtlasCopco schema (Priority: P3)

**Goal**: The AI assistant trigger button next to the Columns button on Infrastructure Register renders only under `WePLM`.

### Implementation for User Story 4

- [X] T021 [US4] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/Resources/ResourcesScreenController.tsx`, wrap the existing `<ChatAssistantSharedComponent />` usage in a `useFrontendDesignSchema() === 'WePLM'` check.
- [X] T022 [US4] Manually verify the Infrastructure Register portion of quickstart.md Scenario 4.

**Checkpoint**: The Infrastructure Register header now reflects the design schema, independently of every other story.

---

## Phase 8: User Story 7 - The splash screen reflects the active design schema (Priority: P3)

**Goal**: The splash screen shows a static, schema-matching logo with no looping animation under either schema value, per data-model.md's `SplashScreenLogoAsset` table and research.md §7.

**Independent Test**: With the design schema set to `WePLM`, load the application and confirm the splash screen shows the static We.PLM logo with no animation; with `AtlasCopco`, confirm it shows the static Atlas Copco logo instead, also with no animation; under either value, confirm it still dismisses once initial data finishes loading.

### Implementation for User Story 7

- [ ] T023 [US7] Add the Atlas Copco logo attached with this request as a new asset file at `src/Assets/Images/AtlasCopcoLogo.webp`, alongside the existing `DancingAIAgentMascotImage.png` in the same subfolder.
- [ ] T024 [US7] In `src/Features/SplashScreen/Components/static/SplashScreenLogoStaticComponent.tsx`, remove the `<video>` element, its `onEnded` handler, and the `splashScreenAnimation` import; render a plain `<img>` instead, whose `src` is the existing `src/Assets/weplm.jpeg` when `useFrontendDesignSchema()` is `'WePLM'` and the new `AtlasCopcoLogo.webp` (T023) when `'AtlasCopco'`, keeping the component's existing `motion.div` fade-in wrapper unchanged.
- [ ] T025 [US7] In `src/Features/SplashScreen/SplashScreenController.tsx`, remove the video-loop-end-based dismissal path (`handleVideoEnded`/`onLoopComplete`) and replace it with a plain `useEffect` that calls the existing dismiss callback as soon as `isReadyToDismiss` becomes `true` — leave the existing `allQueriesSettled`/`MINIMUM_DISPLAY_DURATION_MS` timer logic that computes `isReadyToDismiss` itself unchanged.
- [ ] T026 [US7] Manually verify quickstart.md Scenario 6.

**Checkpoint**: The splash screen now reflects the design schema with no animation under either value, independently of every other story.

---

## Phase 9: User Story 5 - Feature Request page only exists under the WePLM schema (Priority: P4)

**Goal**: The "Feature Request" navigation link and page are both unreachable under `AtlasCopco`, and fully intact and unchanged under `WePLM`.

### Implementation for User Story 5

- [X] T027 [US5] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/Navigation/NavigationController.tsx`, filter the array read from `NavigationCON.NAV_ITEMS` to exclude the `'feature-requests'` entry whenever `useFrontendDesignSchema() === 'AtlasCopco'`.
- [X] T028 [US5] In `PLMInfrastructureRegisterClientServiceLayerMSC/src/Routes/FeatureRequestsScreenRoute.tsx`, redirect to the application's root route when `useIsFrontendDesignSchemaResolved() && useFrontendDesignSchema() === 'AtlasCopco'` instead of rendering `FeatureRequestsScreenController` (gated on the resolved-state hook specifically, to avoid a race condition against the optimistic default).
- [X] T029 [US5] Manually verify the navigation/Feature Request portion of quickstart.md Scenario 4.

**Checkpoint**: All seven user stories are independently functional and testable.

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T030 Run `npx tsc -b` and `npx oxlint` (frontend) plus `dotnet build` (backend) against the final state of every file touched by this feature (Round 1/2 + Round 3 scope), confirming no new warnings/errors.
- [ ] T031 Run the complete quickstart.md walkthrough (all 6 scenarios, in one sitting) live via Chrome DevTools MCP, under both `AtlasCopco` and `WePLM`, confirming no regression to any other existing screen.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS every user story.
- **User Story 1 (Phase 3)**: Depends only on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational and on User Story 1 (targets the `schema-atlascopco` class T005 introduces).
- **User Story 3 (Phase 5)**: Depends only on Foundational.
- **User Story 6 (Phase 6)**: Depends only on Foundational; T011-T019 each depend on T010 (the CSS variables must exist before any file can reference them) but not on each other.
- **User Story 4 (Phase 7)**: Depends only on Foundational.
- **User Story 7 (Phase 8)**: Depends only on Foundational.
- **User Story 5 (Phase 9)**: Depends only on Foundational.
- **Polish (Phase 10)**: Depends on all seven user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Foundational only.
- **User Story 2 (P1)**: Foundational + User Story 1 (CSS selector targets US1's class).
- **User Story 3 (P2)**: Foundational only — independent of every other story.
- **User Story 6 (P2)**: Foundational only — independent of every other story; internally, T011-T019 depend on T010.
- **User Story 4 (P3)**: Foundational only — independent of every other story.
- **User Story 7 (P3)**: Foundational only — independent of every other story.
- **User Story 5 (P4)**: Foundational only — independent of every other story.

### Parallel Opportunities

- T002 and T003 (different files, backend) can run in parallel.
- Once Foundational (Phase 2) is complete, User Stories 3, 6, 4, 7, and 5 can all proceed in parallel with each other and with User Story 1/2's own sequence, since none of them touch the same files as User Story 1/2 or as each other (User Story 5's `NavigationController.tsx` edit and User Story 6's `NavigationController.tsx` edit (T019) touch the same file but different, non-overlapping logic — run sequentially against that one file, not concurrently).
- Within User Story 6, T011 through T019 (9 file-group tasks, 31 files total, zero file overlap between groups) can all run in parallel once T010 is done.

---

## Parallel Example: User Story 6

```bash
# Once T010 (CSS variables) is done, launch all 9 file-group substitution tasks together:
Task: "Substitute brand-navy hex in 8 Shared/Components files (T011)"
Task: "Substitute brand-navy hex in 8 more Shared/Components files (T012)"
Task: "Substitute brand-navy hex in FeatureRequests components (T013)"
Task: "Substitute brand-navy hex in EnvironmentOverview files (T014)"
Task: "Substitute brand-navy hex in Resources files (T015)"
Task: "Substitute brand-navy hex in DowntimeAnnouncements file (T016)"
Task: "Substitute brand-navy hex in ChatAssistant file (T017)"
Task: "Substitute brand-navy hex in EnvironmentUptimeRequests files (T018)"
Task: "Substitute brand-navy hex in NavigationController.tsx (T019)"
```

---

## Implementation Strategy

### Already Shipped (Round 1/2 scope)

Phases 1-5, 7, and 9 (Setup, Foundational, User Stories 1, 2, 3, 4, 5) are complete and were verified live in a prior session, including a race-condition fix in User Story 5's redirect logic (T028) and a spec correction confirming User Story 4's AI assistant has no other trigger point in the application.

### Remaining Work (Round 3 scope)

1. Complete Phase 6 (User Story 6 - brand color): T010 first, then T011-T019 in parallel, then T020 to verify.
2. Complete Phase 8 (User Story 7 - splash screen): T023 (asset) can run in parallel with T010-T019; T024 and T025 touch different files and can run in parallel with each other once T023 lands; T026 verifies.
3. Complete Phase 10 (Polish): full `tsc`/`oxlint`/`dotnet build` check and the complete 6-scenario quickstart.md walkthrough.

### Notes

- No automated tests exist in this repo; live manual verification via Chrome DevTools MCP per this project's standing practice.
- T010 (index.css) must run before any of T011-T019, and not concurrently with T006/T007 if those are still in flight (same file) — in practice T006/T007 are already shipped, so T010 is the only outstanding `index.css` edit.
- T019 (NavigationController.tsx, brand color) and T027 (NavigationController.tsx, nav-item filtering) touch the same file — T027 is already shipped, so T019 is the only outstanding edit there.
