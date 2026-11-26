# Research: Calendar Activity Backend & Admin Creation

No `[NEEDS CLARIFICATION]` markers remain — all 10 were resolved in `/speckit-specify`'s own 3-round grilling session. This phase records the concrete technical decisions, each grounded in a direct read of Downtime Announcements' existing backend (the one proven precedent for "admin-gated write, public read, same controller" in this codebase) and of the Uptime Request form's own dropdown/validation wiring (researched during `/speckit-specify`).

## 1. Backend structure: mirror Downtime Announcements almost field-for-field

**Decision**: `Features/CalendarActivities/` gets the exact same five-part shape Downtime Announcements already has — a sealed `CalendarActivitiesController` (`[ApiController]`, one route group), a singleton `CalendarActivitiesAssertion.Current` with imperative (not data-annotation) validation methods throwing `ValidationException`, a `CalendarActivitiesService` doing the actual EF Core work plus a private `MapToDTO`, two DTOs (`CreateCalendarActivityDTO` inbound, `CalendarActivityDTO` outbound), one `CalendarActivityNexus` EF Core entity, and one migration creating `IG_CalendarActivityTBL`.

**Rationale**: This is a direct, field-for-field match of a proven, already-working pattern in this exact codebase — the controller's own try/catch-per-action shape (`ValidationException` → 400, `Exception` → 500, consistent `APIResponse<T>.Succeeded`/`.Failed` wrapping), the Assertion class's imperative validation style, and the DI registration (`builder.Services.AddScoped<CalendarActivitiesService>();` in `Program.cs`, alongside every other feature service) all carry over unchanged. Reusing a working pattern this closely is lower-risk than inventing a new validation/response convention for one feature.

**Alternatives considered**:
- *Data-annotation attributes (`[Required]`, `[EmailAddress]`) on the DTO instead of an imperative Assertion class* — rejected: inconsistent with every other feature in this codebase (`EnvironmentUptimeRequestsAssertion`, `DowntimeAnnouncementsAssertion`, `ConfigurationConstantsAssertion` are all imperative), and this project's own convention is clearly imperative-only.

## 2. GetAll is public, not admin-only (a deliberate divergence from Downtime Announcements' own GetAll)

**Decision**: `CalendarActivitiesController`'s list/GetAll action carries NO `[Authorize]` attribute — any visitor (admin or not) can fetch the full activity list. Only the Create action is `[Authorize(Policy = "RequireAdmin")]`.

**Rationale**: Downtime Announcements' own `GetAllDowntimeAnnouncementsAsynchronous` happens to be admin-only, but that controller *also* contains two intentionally-public GET actions in the exact same file (`GetActiveDowntimeAnnouncement`, `GetDowntimeAnnouncementsInRange`) — proving "public read + admin write in one controller" is already an established, accepted shape in this codebase, not something this feature would be inventing. Spec User Stories 2 and 3 (viewing activity details, expanding overlapping rows) explicitly apply to "any visitor," so the list endpoint this feature actually needs is the public kind, not the admin-only kind.

**Alternatives considered**:
- *Copy Downtime Announcements' GetAll exactly (admin-only)* — rejected: would directly contradict spec FR-011/User Story 2 ("any visitor" can view activity details), which needs the list to be fetchable without an admin session.

## 3. Color and "Backdated" are derived display state, never persisted

**Decision**: No `ColorIndex`/`ColorKey` column and no `IsBackdated` column on `IG_CalendarActivityTBL`. The frontend computes both after fetching the full activity list:
- **Color**: sort all fetched activities by `createdAt` ascending; each activity's palette index is `sortedIndex % paletteSize`, reusing 015's own existing 3-color palette (blue/green/amber) verbatim.
- **Backdated**: `activity.startAt < todayYmd`, evaluated fresh on every render — the same "compare against `now`" technique already used for the existing "Today" cell highlight on this same page.

**Rationale**: Both values are 100% derivable from data the frontend already has (every activity's `createdAt` and `startAt`, once fetched) — storing either would be redundant, write-once-never-updated derived state for no benefit (per spec FR-010/FR-009, both are explicitly *not* admin-chosen or fixed-at-creation-time; "Backdated" specifically must be "evaluated fresh... not frozen at creation," which a stored column would get wrong the moment "today" moves forward).

**Alternatives considered**:
- *Store a `ColorIndex` on the entity, assigned at creation time by counting existing rows* — rejected: adds a column and a read-before-write race condition for zero benefit over a stable client-side sort-and-modulo, which is already deterministic given the same fetched data.
- *Store an `IsBackdated` boolean, recomputed by a scheduled job* — rejected: needless infrastructure (a background job) for a value a single comparison already gives for free on every render, exactly like "Today" already works.

## 4. Environment and Responsible Person dropdowns: reuse existing data sources outright

**Decision**: The create-activity form's Environment dropdown reuses the exact same `environmentOptions` derivation the Uptime Request form already uses (`TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery()` piped through `EnvironmentNameListUtility.current.splitToIndividualEnvironmentNames(...)`); the Responsible Person dropdown reuses the exact same `'Sponsor'` `ConfigurationConstants` growable-list query (`useOptionsQuery('Sponsor')`) the Uptime Request form, Environment Overview, and Feature Requests already all share.

**Rationale**: The user's own `/speckit-specify` request said "the same one as in the Uptime Request page form" for both fields, confirmed by research to be exact, already-shared data sources — not new, feature-specific lists. No new `ConfigurationConstants` key, no new environment-list query is needed.

**Alternatives considered**: None — this was a direct instruction, confirmed against the actual existing code, not a design choice with alternatives.

## 5. Date/time storage: naive local string in, UTC `DateTime` out, matching existing convention

**Decision**: `CreateCalendarActivityDTO.StartAt`/`EndAt` are naive `"YYYY-MM-DDTHH:mm"` strings (same shape as `CreateDowntimeAnnouncementDTO.StartAt`/`EndAt` and `CreateEnvironmentUptimeRequestDTO.FromAt`/`ToAt`), parsed via `DateTime.TryParse(..., CultureInfo.InvariantCulture, DateTimeStyles.None, ...)`, converted to UTC via the existing `CETTimeZoneUtility.ToUtc(...)` utility before being stored on `CalendarActivityNexus` as `DateTime` (`timestamp with time zone` columns).

**Rationale**: This is the exact, already-proven date-handling convention shared by both existing admin-write features in this codebase (Downtime Announcements and Uptime Requests) — introducing a different convention for this third feature would be inconsistent for no benefit.

**Alternatives considered**: None — matches two independent existing precedents exactly.

## 6. Frontend lane-assignment helper: adapted for real data, plus a cap-at-3 + per-week expand override

**Decision**: `CalendarActivityLaneAssignmentHelper.assignLanesForWeek` is revised to accept real fetched activities (their actual `startAt`/`endAt` `Date`/ISO values) instead of 015's fixed `YearMonthDay`-shaped sample data, and to return every assigned lane unconditionally (no capping inside the helper itself). `YearlyCalendarScreenController.tsx` then applies the display cap: for a given week, if its own lane count exceeds 3 AND that week isn't in a new local `expandedWeekKeys` state set, only lanes 0-2 render, plus a "Show +X More" control (`X` = lane count − 3); clicking it adds that week's own key to `expandedWeekKeys` (toggle-able back off), affecting only that week's own rendered height, never any other week's.

**Rationale**: Keeping the capping/expand logic in the screen controller (not the helper) keeps the helper itself a pure, reusable "pack overlapping activities into lanes" function — exactly its existing single responsibility from 015 — while the cap/expand concern, which is a per-render UI-state decision (is this specific week currently expanded by the user?), belongs with the component that owns that UI state, not inside a stateless layout helper. This also directly satisfies spec FR-014 ("expand only that specific week row... without affecting any other row") — since each week is keyed and tracked independently.

**Alternatives considered**:
- *Cap inside the helper itself, with an `isExpanded` parameter per call* — rejected: would make the helper stateful-by-proxy (it would need the caller to already know and pass in per-week expansion state), which is no simpler than just doing the capping at the render site that already has that state.

## 7. Frontend admin gating on "Add Activity": reuse the existing `useIsAdmin()` hook

**Decision**: `YearlyCalendarScreenController.tsx` wraps its existing `<PrimaryActionButtonSharedComponent label="Add Activity" />` in `{useIsAdmin() && (...)}`, the same conditional-render pattern already used to gate the AI assistant button on Infrastructure Register and the edit controls on Environment Overview/Uptime Requests.

**Rationale**: `useIsAdmin()` (from `AdminIdentityUtility.ts`) is this codebase's single, already-proven client-side admin-check hook, used identically across every other admin-gated UI control in this application — introducing a different mechanism for this one button would be inconsistent for no benefit. The actual security boundary is still the server-side `[Authorize(Policy = "RequireAdmin")]` on Create (per spec FR-007); this client-side check only controls whether the button is shown.

**Alternatives considered**: None — this is the codebase's own single existing convention, directly applicable.
