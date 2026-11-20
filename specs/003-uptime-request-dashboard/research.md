# Research: Uptime Request Dashboard View

## 1. Admin-only visibility and view-mode toggle pattern

**Decision**: Reuse `useIsAdmin()` from `AdminIdentityUtility` to gate rendering the segmented control, and render it with the existing generic `SegmentedControlSharedComponent` (two `{ value, label, icon }` options), owning the current view-mode (`'dashboard' | 'form'`) as local state directly inside `EnvironmentUptimeRequestsScreenController` - no dedicated wrapper component like `ViewEditModeToggleSharedComponent`.

**Rationale**: This is the exact same admin-gating mechanism Environment Overview already uses for its View/Edit Mode toggle (`{isAdmin && <ViewEditModeToggleSharedComponent .../>}`), confirming it's the established pattern for an admin-only header control in this app. A dedicated wrapper component made sense for View/Edit Mode because it owns a keyboard shortcut (Ctrl/Cmd+E) and a controlled/uncontrolled hybrid API reused across two unrelated pages (Resources, Environment Overview). Neither applies here - spec.md defines no keyboard shortcut, and this toggle has exactly one call site - so a wrapper would be unused abstraction; the screen controller owns the state directly, same as any other single-use piece of local UI state in this codebase.

**Alternatives considered**: A dedicated `UptimeRequestViewModeToggleSharedComponent` mirroring `ViewEditModeToggleSharedComponent` byte-for-byte - rejected as unnecessary indirection for a single call site with no shared behavior to reuse.

## 2. Default-and-never-persisted view-mode state

**Decision**: `useState<'dashboard' | 'form'>('dashboard')` with no persistence (no local storage, no URL param) - confirmed with the user (spec FR-003) to mirror View/Edit Mode's own "always resets, never remembered" behavior.

**Rationale**: Directly matches the explicitly confirmed requirement and an existing precedent in this exact codebase, so there's no new persistence mechanism to design or maintain.

## 3. Data source for the four summary cards and the 30-day trend

**Decision**: No new backend endpoint. Reuse the already-fetched `useEnvironmentUptimeRequestsQuery()` result (the exact same list the Form view's request feed already renders) and compute all four card counts plus the 30-day daily trend client-side, in the new `EnvironmentUptimeRequestDashboardStaticComponent`.

**Rationale**: `GetAllEnvironmentUptimeRequestsAsynchronous` already returns every non-deleted request (with `Status` and `CreatedAt`) in one call, and this page already fetches that full list regardless of which view is showing (the Form view's list feed needs it too) - so there is no new data-fetching cost, and FR-011 ("no new backend data-write capability") is satisfied trivially since nothing new is even read server-side. Current data volume (tens of requests based on current ticket numbering) makes client-side aggregation (array filters/reduces) effectively instant - no pagination or server-side aggregation concerns at this scale.

**Alternatives considered**: A new backend `/EnvironmentUptimeRequests/summary` endpoint returning pre-aggregated counts/trend - rejected as unnecessary backend surface area for data the frontend already holds in full.

## 4. Data source for the downtime announcements list

**Decision**: Reuse the existing `useAllDowntimeAnnouncementsQuery(enabled)` hook, passing `enabled = (viewMode === 'dashboard')`, and filter its result to `announcement.status !== 'Expired'` client-side (keeping `'Active'` and `'Scheduled'`) for display.

**Rationale**: This hook already exists specifically to fetch every announcement regardless of status (used today by the admin History modal) and already accepts an `enabled` flag - the exact mechanism this app's own history already uses to avoid firing the query when its consumer isn't visible (see this session's earlier Downtime Banner 401 fix, which added the same kind of `enabled` gating to a sibling query for the same reason). Passing `viewMode === 'dashboard'` as `enabled` means the query only fires while the Dashboard is actually showing, not on every Form-view render.

**Alternatives considered**: A new filtered backend endpoint returning only Active+Scheduled announcements - rejected for the same reason as §3: the existing endpoint already returns a superset of what's needed, and the filter is a one-line client-side predicate.

## 5. Charting approach for the 30-day trend

**Decision**: Add `recharts` as a new frontend dependency - an explicit user choice (asked directly: hand-rolled SVG vs. a charting library) over building a custom SVG bar chart.

**Rationale**: This was a genuine trade-off with user-visible consequences (built-in tooltips/responsiveness vs. zero new dependency and full visual control) rather than an internal implementation detail, so it was asked rather than decided silently. The user chose the library. A simple `<BarChart>`/`<AreaChart>` with `ResponsiveContainer`, styled to match this app's existing color tokens (`#0C2086` / `sky-400` dark-mode accent already used throughout Uptime Requests), covers the "small graph" requirement without custom SVG path math.

**Alternatives considered**: Hand-rolled SVG bars (no new dependency) - presented to and declined by the user in favor of the library's built-in polish.

## 6. View-switch animation

**Decision**: Reuse the existing `motion/react` package (already a dependency, already used via `AnimatePresence` throughout this app's modals/dropdowns) with a simple crossfade (`initial`/`animate`/`exit` opacity, short duration) wrapping whichever of Dashboard/Form is currently rendered, keyed by `viewMode`.

**Rationale**: Satisfies spec FR-010 ("animate, not snap") using the exact same animation primitive already used throughout this codebase for content swaps (e.g. `ModalSharedComponent`, `GlobalSearchModalSharedComponent`) - no new dependency, no new animation pattern to learn or maintain. A crossfade is the simplest transition that reads as intentional rather than jarring; spec.md's Assumptions section already deferred the exact animation style to implementation.

**Alternatives considered**: A directional slide (matching e.g. a tab-bar swipe) - plausible but adds layout complexity (both panels needing simultaneous width) for no requirement calling for directionality; crossfade is the minimal choice that satisfies FR-010.
