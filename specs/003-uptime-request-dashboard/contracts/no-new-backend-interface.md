# Contracts: Uptime Request Dashboard View

**No new or changed backend interface.** This feature is implemented entirely in the frontend and reuses two existing, unmodified endpoints exactly as they already respond today:

- `GET /Api/V1/EnvironmentUptimeRequests` (unchanged) - the Dashboard's four cards and 30-day trend are computed client-side from this response's existing `status`/`createdAt` fields (research.md §3).
- `GET /Api/V1/DowntimeAnnouncements` (the existing "get all" endpoint backing `useAllDowntimeAnnouncementsQuery`, unchanged) - the Dashboard's downtime list filters this response's existing `status` field to exclude `'Expired'` client-side (research.md §4).

Neither endpoint's request shape, response shape, authentication, or authorization changes. There is nothing new to version, document, or contract-test here beyond what those two endpoints already guarantee.
