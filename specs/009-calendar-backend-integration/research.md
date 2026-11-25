# Research: Calendar Backend Integration

No `[NEEDS CLARIFICATION]` markers remain — all open product questions were resolved via two rounds of `AskUserQuestion` clarification before `spec.md` was written, and all open naming/approach questions below were resolved via two further rounds before this plan was written. This phase works out how to actually build what was agreed.

## 1. Uptime-request filtering: extend the existing endpoint with optional query params

**Decision**: Extend `EnvironmentUptimeRequestsController`'s existing parameterless `GetAllEnvironmentUptimeRequests` action with three optional query parameters — `Environment` (string?), `FromAt` (DateTime?), `ToAt` (DateTime?) — all nullable, all independently optional. `EnvironmentUptimeRequestsService.GetAllEnvironmentUptimeRequestsAsynchronous` gains matching optional parameters and applies each filter only when its value is provided (`environment is not null` → `.Where(x => x.Environment == environment)`, similarly for the date range against `FromAt`/`ToAt` overlap). Calling the endpoint with zero query parameters MUST return the exact same unfiltered result it does today — every existing caller (e.g. the dashboard/table view) keeps working unchanged.

**Rationale**: User's explicit choice over the two alternatives (client-side-only filtering, or a brand-new dedicated endpoint). Extending the existing endpoint in a backward-compatible way is the smallest surface-area change that satisfies FR-001/FR-010's environment scoping, reuses the existing route/service/DTO entirely, and needs no new endpoint name.

**Alternatives considered**: Pure client-side filtering of the existing unfiltered list — rejected by the user in favor of real server-side filtering. A new dedicated `/ForCalendar` endpoint — rejected in favor of extending the one endpoint that already does this job, avoiding a second near-duplicate GET action.

## 2. Downtime needs one genuinely new, unauthenticated endpoint

**Decision**: Add `GET /Api/V1/DowntimeAnnouncements/InRange?FromAt=...&ToAt=...` to `DowntimeAnnouncementsController`, with no `[Authorize]` attribute (same public tier as the existing `GetActiveDowntimeAnnouncement`). Both query params are required (the calendar always has a concrete visible date range to ask for). `DowntimeAnnouncementsService.GetDowntimeAnnouncementsInRangeAsynchronous(DateTime fromAt, DateTime toAt)` returns every non-deleted `DowntimeAnnouncementDTO` whose `[StartAt, EndAt]` window overlaps `[fromAt, toAt]`, **across all environments** — the response is not environment-filtered server-side.

**Rationale**: This is the one piece of this feature that cannot be satisfied by client-side filtering alone, because the calendar's caller is never authenticated at all in this app (confirmed: the only auth policy anywhere is `RequireAdmin` — there is no "logged-in but not admin" tier to place a narrower endpoint behind), and the only other existing public endpoint (`GetActiveDowntimeAnnouncement`) is deliberately narrow (single, currently-active announcement only) by its own design. `FromAt`/`ToAt` naming mirrors the existing uptime-request entity's own field names, for consistency across this feature's two new sets of query parameters, per the user's explicit naming choice. Returning all environments (rather than adding a third `Environment` query param here too) was chosen because the downtime dataset is small and `Environments` is stored as a single comma-joined string column requiring server-side parsing to filter on anyway — simplest to return everything in range and let the already-small result be filtered by environment in the browser, the same place the uptime-request filtering now also effectively happens for environment matching against each card.

**Alternatives considered**: `GET .../ForDateRange?StartAt=&EndAt=` (mirrors the downtime entity's own field names instead) and `GET .../Overlapping?FromAt=&ToAt=` — both presented to the user as alternatives; `InRange` with `FromAt`/`ToAt` was explicitly chosen. Opening up the existing admin-gated `GetAllDowntimeAnnouncement` to non-admins was not offered as an option at all, since it would also expose soft-deleted-adjacent admin fields (`EndedEarlyAt`, true historical/expired entries) to every calendar viewer with no access control — the new endpoint intentionally returns only what's needed for the visible range, not the admin's full unfiltered history.

## 3. New read-only details modals

**Decision**: Two new components, both under `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/` (next to the existing availability modal, since both are opened from it): `EnvironmentUptimeRequestDetailModalController.tsx` and `DowntimeAnnouncementDetailModalController.tsx`. Both follow the existing `[Name]ModalController.tsx` convention (exported default function, explicit `React.JSX.Element` return type, exported `[ComponentName]Props` interface) and the existing "modal data caching ref" pattern from `CODING-RULES.md` §10.2 (so the modal's content doesn't vanish mid-exit-animation). Both are strictly read-only — no status/message editing inline.

- `EnvironmentUptimeRequestDetailModalController` shows requester name/email, environment, date/time range, status (as a badge), and message — the same field set `EnvironmentUptimeRequestDetailScreenController.tsx` already renders via its local `DetailFieldRow` pattern, reused/adapted rather than reinvented (per frontend CODING-RULES §0, reuse before writing new code). It includes a link/button to `ApplicationRouteCON.ENVIRONMENT_UPTIME_REQUEST_DETAIL_PATTERN` (the existing full detail page) for anyone who needs to actually change status or add an admin message (FR-006).
- `DowntimeAnnouncementDetailModalController` shows heading, description, affected environments, and time window (FR-007) — a new, smaller field set, since no existing downtime detail screen exists to adapt from.

**Rationale**: Matches the user's explicit naming choice (full entity names, mirroring `EnvironmentUptimeRequestDetailScreenController`'s existing stem) and the spec's Story 3 requirement for a compact, read-only summary rather than inline editing.

**Alternatives considered**: `UptimeRequestSummaryModalController`/`DowntimeSummaryModalController` (shorter names) — presented, not chosen.

## 4. New TanStack Query wiring, with polling for cross-tab freshness

**Decision**: Two new entries in `TanstackQueryKeysCON.ts`, following the codebase's existing parameterized-key precedent (e.g. `CHAT_CONVERSATIONS(clientId)`):

```ts
ENVIRONMENT_UPTIME_REQUESTS_FOR_ENVIRONMENT: (environment: string) => [...]
DOWNTIME_ANNOUNCEMENTS_IN_RANGE: (fromAt: string, toAt: string) => [...]
```

And two new hooks in `TanstackQueryClientService.ts`: `useEnvironmentUptimeRequestsForEnvironmentQuery(environment, fromAt, toAt)` and `useDowntimeAnnouncementsInRangeQuery(fromAt, toAt)`. Both are called only while the availability modal is open (`enabled: isOpen`) and both set `refetchInterval: 15000` (15 seconds) while enabled — directly reusing TanStack Query's own built-in polling option, with no new library and no custom interval/timer code. `fromAt`/`toAt` passed to both are the calendar's own fixed 5-week range (the current week's Sunday through the end of the 5th week — the same bound the 008 feature already established), recomputed each time the modal opens, not stored as persistent state.

**Rationale**: 15 seconds was the user's explicit choice, matching the closest sibling-app precedent found in AssetSphere (`refetchInterval: 15000` on its Notifications query — the one place in either app's history that needed a "feels near-live" list). `enabled: isOpen` scopes the polling to exactly the window the spec's User Story 5 describes ("while a user has the calendar open") and avoids any background network activity once the modal is closed, consistent with this being a lightweight internal tool rather than a dashboard meant to stay open indefinitely.

**Alternatives considered**: `CALENDAR_UPTIME_REQUESTS(env)`/`CALENDAR_DOWNTIME(from,to)` naming (use-case-first instead of filter-first) — presented, not chosen. A 30-second interval — presented, not chosen (15s was preferred for freshness).

## 5. Right-click "Delete" is genuinely new wiring — reusing an existing shared component

**Correction (found during planning, after this document's first draft)**: the right-click delete affordance does **not** already exist in any form. `justCreated` on `TeamsCalendarEvent` is used only to trigger a pop-in CSS animation class — there is no `onContextMenu`, no delete handler, and no `ContextMenuSharedComponent` usage anywhere in the modal file today. `cancelSelection()` only resets the half-made `startSlot`/`hoverSlot` selection state (before both clicks of a pick are made) — it never touches a completed pick. This entire story is new, not a reconnection of something already local-only.

**Decision**: Reuse `ContextMenuSharedComponent` exactly the way `ResourcesScreenController.tsx` already uses it elsewhere in this codebase — one instance rendered once in the modal, local `{isOpen, x, y}` state set by an `onContextMenu` handler, a single `isDestructive` "Delete" `ContextMenuItem`. That handler is wired **only** onto the in-progress pick's own event card (`source === 'inProgress'`, decision §6); real, backend-sourced event cards (`uptimeRequest`/`downtime`) get their `onContextMenu` set to call `event.preventDefault()` and nothing else — this suppresses the browser's own native context menu (which would otherwise look broken popping up inside a modal dialog) without ever invoking the custom delete menu, satisfying FR-010 without introducing a jarring native menu as a side effect. Choosing "Delete" clears the pick by calling `onFromChange('')`/`onToChange('')` (decision §9) — there is no separate local state to clear, since the in-progress card is itself derived from those same props.

**Rationale**: No new component, no new props beyond what `ContextMenuSharedComponent` already exposes. The only genuinely new wiring is the conditional `onContextMenu` branch distinguishing "in-progress" from "real" cards, and the delete action's upward call to the two callback props.

## 6. Distinguishing event-card kinds — and making `events` itself a fully derived value, not stored state

**Decision**: Add one new discriminant field to the existing `TeamsCalendarEvent` shape: `source: 'inProgress' | 'uptimeRequest' | 'downtime'`. Each real (non-in-progress) card also carries a `backendId: string` (the real `EnvironmentUptimeRequestDTO.Id`/`DowntimeAnnouncementDTO.Id`). Clicking a card with `source !== 'inProgress'` looks up the full record by `backendId` from the already-fetched TanStack Query data to populate the details modal — no duplicate fields (requester, message, description, etc.) are carried on `TeamsCalendarEvent` itself.

**Revised during planning**: the modal's existing `const [events, setEvents] = useState<TeamsCalendarEvent[]>([])` is removed entirely. `events` becomes a plain `const` recomputed every render — the same "recompute fresh every render" pattern this file already uses for `todayYmd`/`currentHour`/`allDays` (features 006-008):

```ts
const inProgressEvents = (fromAt && toAt)
  ? CalendarBookingConversionHelper.current.convertRangeToEvents(parseNaiveDateTime(fromAt), parseNaiveDateTime(toAt), allDays, '...', 'inProgress')
  : [];
const realUptimeEvents = /* derived from useEnvironmentUptimeRequestsForEnvironmentQuery's data, converted */;
const realDowntimeEvents = /* derived from useDowntimeAnnouncementsInRangeQuery's data, converted */;
const events = [...inProgressEvents, ...realUptimeEvents, ...realDowntimeEvents];
```

**Rationale**: Once the in-progress pick's source of truth is the outer form's `fromAt`/`toAt` props (decision §9), keeping a separate local `events` state for it would require manually re-syncing that state on every prop change, open, close, and poll tick — exactly the class of bug (stale/duplicate cards) the "derive, don't store" pattern this codebase already established for the calendar's own date math was adopted to avoid. Making every event (real or in-progress) a pure derived value removes an entire category of merge/dedupe code this feature would otherwise need, and keeps one consistent mental model for the whole file rather than a special case for one source.

**Downtime rendering color**: derived purely from `source === 'downtime'` at render time (red), not a separate stored field.

## 7. Converting a real backend timestamp into `day`/`startHour`/`endHour`, and back

**Decision (confirmed exact mechanics during planning)**: `CalendarBookingConversionHelper` (decision §3) exposes both directions, both composing with the day-decomposition math already used by `handleSlotClick`'s completion branch today (currently inline there, extracted into the helper so all three call sites share it):

- **Timestamp span → `TeamsCalendarEvent[]`** (`convertRangeToEvents`): maps a `fromAt`/`toAt` pair into one entry per calendar day the span touches, clipped to that day's actual hour range (first day: the span's start hour through 23; last day: 0 through the span's end hour; full days between: 0 through 23). The grid treats `endHour` as inclusive and displays `formatHourLabel12(ev.endHour + 1)` as the visible end time, so converting a real `toAt` timestamp's hour into `endHour` must subtract 1 accordingly (the inverse of the existing display convention). Any day the span touches that falls outside `allDays` (feature 008's fixed 5-week range) is skipped, not clamped.
- **`(startDayIndex, startHour, endDayIndex, endHour)` → naive datetime strings** (`convertPickToDateTimeStrings`): the reverse, used when a live click-completion needs to report the pick upward (decision §9). Output format is the naive `"YYYY-MM-DDTHH:mm"` string `CreateEnvironmentUptimeRequestInputInterfaceModel` already documents as its exact expected shape ("straight from `<input type=\"datetime-local\">`, interpreted server-side as CET/CEST, never UTC, never browser-local") — `endHour + 1` again, matching the grid's own inclusive-hour convention.
- **Parsing a naive datetime string back into day/hour** (needed for `inProgressEvents`'s derivation, decision §6): construct the `Date` from its numeric Y/M/D/H parts individually — the same technique `EnvironmentUptimeRequestFormStaticComponent.tsx`'s own `formatSelectedDateTime` already uses — never `new Date(isoString)` directly, which would apply the browser's local timezone to a string that is deliberately timezone-naive.

**Rationale**: Reuses the existing day/hour index math (`getSlotIndex`, the `0..34` absolute-day-indexing scheme from feature 008) and the exact naive-string convention the outer form already established, instead of inventing a new timestamp format or rendering model. Extracting the previously-inline decomposition loop out of `handleSlotClick` is itself a net simplification of that function, not just new code elsewhere.

## 8. Failure handling for the two new queries

**Decision**: Per FR-013, a failed/errored `useEnvironmentUptimeRequestsForEnvironmentQuery`/`useDowntimeAnnouncementsInRangeQuery` does not block the modal from opening or from the user making their own in-progress pick — the grid simply renders with zero existing-booking/downtime cards, plus a small, non-blocking inline notice (reusing whatever this codebase's existing lightweight toast/notice pattern is, not a new component) that existing data couldn't be loaded.

**Rationale**: Directly implements the spec's Edge Case ("What happens if the backend is unreachable when the calendar opens?"). No new error-boundary component is introduced — TanStack Query's own `isError`/`error` state from the two new hooks is sufficient to drive this.

## 9. Wiring the picked span to the outer form (User Story 6)

**Finding (corrects the original premise this feature started from)**: the outer form, `EnvironmentUptimeRequestFormStaticComponent.tsx`, is **already fully wired on its own side** — `fromAt`/`toAt` are real `useState<string>('')`, `onFromChange`/`onToChange` are real setters (that also clear validation errors), the "Select dates..." button already renders the picked range via `formatSelectedDateTime` once both are set, `handleSubmit` already builds `CreateEnvironmentUptimeRequestInputInterfaceModel{ ..., fromAt, toAt, ... }`, and a successful submission already calls `handleReset()` which clears both back to `''`. The entire gap is inside the calendar modal: its props interface declares `environment`/`fromAt`/`toAt`/`onFromChange`/`onToChange` but the component body never references them.

**Decision**: 
- Destructure and use all five props.
- On completing a two-click pick (`handleSlotClick`'s existing completion branch), compute the naive datetime strings via `CalendarBookingConversionHelper.current.convertPickToDateTimeStrings(...)` and call `onFromChange(fromAtString)` / `onToChange(toAtString)` — instead of writing directly into any local event-array state (there no longer is one, per decision §6).
- The in-progress card is *always* derived from the `fromAt`/`toAt` props (decision §6's `inProgressEvents`), never from anything the modal stores itself. This single mechanism transparently covers: showing a previously-picked span when the modal reopens (since the parent never cleared its own props just because the modal closed), reacting to the outer form's own `handleReset()` after a successful submit (FR-017 — the props go back to `''`, so `inProgressEvents` becomes `[]` on the next render, with no special-case "was this submitted?" check needed), and reacting to the right-click "Delete" action (FR-016 — which itself just calls `onFromChange('')`/`onToChange('')`, the same as any other clearing).

**Rationale**: This is the simplest design that satisfies User Story 6's three acceptance scenarios (propagate-on-pick, persist-across-reopen, clear-on-delete-or-submit) with a single data flow and no new state-synchronization code — the calendar becomes a fully controlled view of whatever span the outer form currently holds, plus its own transient half-made-selection UI state (`startSlot`/`hoverSlot`/`previewRange`, which legitimately stays local since it's meaningless before a pick is complete).

**Alternatives considered**: Keeping a separate local "committed pick" state in the modal, synced to the props via a `useEffect` with manual reconciliation — rejected as strictly more code (a sync effect plus the state it syncs) to arrive at the exact same rendered result as deriving directly, with the added risk of the two falling out of sync.
