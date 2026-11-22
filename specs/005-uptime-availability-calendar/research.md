# Research: Uptime Request Availability Calendar

## 1. Data sources - no new queries needed

**Decision**: Reuse `TanstackQueryClientService.current.environmentUptimeRequests.useEnvironmentUptimeRequestsQuery()` (already fetched by the parent screen controller and already passed down as `requests` in this exact feature area) and `TanstackQueryClientService.current.downtimeAnnouncements.useAllDowntimeAnnouncementsQuery(enabled)` (the same hook feature 003's Dashboard already uses, with the same `enabled` gating pattern - here, `enabled = isModalOpen`, so it only fires while the availability modal is actually open).

**Rationale**: Both endpoints already return every non-deleted record with no environment filter server-side (confirmed by reading `EnvironmentUptimeRequestsService.GetAllEnvironmentUptimeRequestsAsynchronous` and the existing `DowntimeAnnouncementsService` equivalent) - exactly the superset this feature needs, filtered down client-side to the selected environment and the visible month. No new backend work is justified when the existing endpoints already return a strict superset of what's needed (same reasoning this session used for feature 003's downtime list).

**Alternatives considered**: A new backend endpoint scoped by environment + date range - rejected for the same reason as every prior feature's "no new backend surface for data already fully fetched" decisions this session.

## 2. Filtering rules (restating spec FR-005/FR-007 as concrete predicates)

**Decision**:
- Uptime Requests: `environment === selectedEnvironment && (status === 'Pending' || status === 'Approved' || status === 'Completed')`.
- Downtime Announcements: `environments.includes(selectedEnvironment) && (status === 'Active' || status === 'Scheduled')`.
- A record "touches" a given calendar day if that day falls within `[fromAt, toAt]` (Uptime Request) or `[startAt, endAt]` (Downtime Announcement) inclusive, compared in CET calendar-day terms (not raw UTC instants - a request ending at 1am CET on day N should still mark day N).

**Rationale**: Directly restates the spec's own FR-005/FR-007 wording into implementable boolean logic; the CET-day-boundary nuance mirrors the exact same `getCetDayKey`-style conversion this session already built once for feature 003's trend chart (since removed along with that chart, but the technique - `Intl.DateTimeFormat('en-CA', { timeZone: 'Etc/GMT-1', ... })` to get a `YYYY-MM-DD` key - is proven and will be recreated locally in the new modal component, not reintroduced into a shared utility, consistent with this session's established "keep single-purpose CET display logic local to its one caller" convention).

## 3. Status colors and marker icons

**Decision**: Reuse this app's existing status color convention exactly as already used in `EnvironmentUptimeRequestListFeedStaticComponent`'s status icon coloring and `EnvironmentUptimeRequestCardStaticComponent`'s badge variant mapping - Pending=amber, Approved=sky, Completed=emerald - applied to small marker dots/pills. Downtime Announcement markers are a fixed `red-300` (Tailwind) regardless of their own Active/Scheduled distinction, per the user's explicit instruction. Markers additionally carry a small icon: a clock/calendar-style icon for Uptime Requests (reusing the `CalendarClock` icon already used as this feature area's own icon, e.g. in the form header and card top-left badge) versus a distinct warning/alert icon for Downtime Announcements (reusing `AlertTriangle`, already used by `DowntimeAnnouncementBannerSharedComponent` for the exact same concept), so the two concepts are visually distinguishable without a text legend.

**Rationale**: Directly satisfies spec FR-006/FR-008, and reuses icons/colors already meaningful elsewhere in this exact app rather than inventing a new visual language.

## 4. Calendar rendering approach

**Decision**: A standard month-grid (6 rows × 7 columns, leading/trailing days from adjacent months dimmed), with each day cell independently rendering up to a small number of marker dots/pills for that day (one per touching record, ordered Uptime Requests first then Downtime Announcements, or chronologically by start date - exact visual list order is a minor implementation detail, not a scope question). No continuous multi-day bar spans across cells, no row-packing layout - per spec FR-009 and the user's own explicit complexity-reduction choice (Q12 in the spec's clarification history).

**Rationale**: This was a direct, deliberate trade-off the user chose specifically to bound this feature's complexity - restated here so the decision's reasoning survives into the planning record, not just the spec's Assumptions section.

**Alternatives considered**: True continuous-bar month view (Google Calendar fidelity) - explicitly rejected by the user for this phase; deferred to a hypothetical future feature alongside click/drag-to-select (also deferred).

**Implementation note (lowers risk further)**: `CustomDatePickerSharedComponent.tsx` (the component this feature's own relocated pickers already use internally) already contains a proven 6×7 month-grid generator - its `daysMatrix` `useMemo` (lines ~96-160: `viewYear`/`viewMonth` state, prev/next month handlers with year rollover, leading/trailing-month padding days, `formatDateString` helper, ISO/European week start). The new calendar's own month-grid generation should mirror this exact logic (adapted to attach markers per day instead of selection/disabled state) rather than reinventing month-grid math - this is the single biggest implementation-risk reducer this research turned up.

## 5. Relocating the date/time pickers

**Decision**: `CustomDateTimePickerSharedComponent` (the exact same component, same `value`/`onChange`/`mode="datetime"`/`minDate` props already used in the form today) moves into the new modal unchanged - no new picker component, no new validation logic. The modal receives `fromAt`/`toAt`/`onFromChange`/`onToChange` as props from the form (lifted state stays in `EnvironmentUptimeRequestFormStaticComponent`, exactly where it lives today) so the modal is a pure presentation layer over state the form already owns, not a second source of truth.

**Rationale**: Satisfies spec FR-011 ("functionally equivalent to what the two removed form fields previously provided") with zero behavior risk - the component, its validation, and its CET semantics are completely unchanged; only its physical location in the component tree changes.

## 6. Modal structure and trigger summary text

**Decision**: `ModalSharedComponent` with `maxWidth="7xl"` and `heightMode="capped"` (its own documented option for "unbounded/very tall content" that needs internal scrolling, which a month calendar plus two picker controls qualifies as). The new "Select Dates" trigger button displays a placeholder (e.g. "Select dates...") until both From and To are set, then a human-readable summary using the existing `CETDateTimeFormatUtility.current.formatDateTime(...)` for both values (the same formatter already used throughout this feature area), joined with an arrow - matching the exact display convention `EnvironmentUptimeRequestCardStaticComponent` already uses for its own From → To display.

**Rationale**: `'7xl'` is already the largest available `maxWidth` (confirmed - no new size needed), and reusing the existing CET formatter for the trigger's summary text keeps date display consistent with every other place this app already shows a CET range.
