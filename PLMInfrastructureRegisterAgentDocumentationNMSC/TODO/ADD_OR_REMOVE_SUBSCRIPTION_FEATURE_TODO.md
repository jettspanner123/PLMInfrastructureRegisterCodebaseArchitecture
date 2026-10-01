# TODO: Add/Remove Subscription Feature

**Status**: Deferred — not part of the initial build. Build this once the core Resource register and Sync pipeline are working.

## Why this exists

Sync does not auto-discover every Azure subscription the app's credentials can see. It only scans a **specific, configured list of subscription IDs** that someone deliberately added to the register — this was a deliberate choice so that a random subscription the service principal happens to have access to (for unrelated reasons) never silently shows up as tracked infrastructure.

That configured list needs to live somewhere and be editable, which is what this feature is: a page where a user can add or remove subscription IDs from the list Sync scans.

## What the feature needs to do

- Show the current list of configured subscriptions (the ones Sync is actively scanning).
- Let a user **add** a new subscription ID to the list.
- Let a user **remove** a subscription ID from the list.
- Once a subscription is added, Sync should pick it up and start creating/updating Resource records for everything it finds in that subscription on its next run.
- Once a subscription is removed, Sync should stop scanning it going forward.

## Known subscriptions already in use (from the legacy Excel data)

For reference when building this — these are the subscription values already present in the historical CSV (`PLM_Infrastructure_Register_Infrastructure_Register.csv`), so they're likely the first entries someone will configure:

- `ac-hybrid-devtest-01`
- `ac-hybrid-production-01`
- `ct-private-devtest-01`

(Some rows also have the subscription blank or `N/A` — not real subscriptions, ignore those.)

## Open questions to resolve before/while building this (do not assume — ask the user)

- **Removing a subscription**: when a subscription is removed from the configured list, what happens to the Resources that were already synced from it? Same treatment as a Resource disappearing from Azure (mark as Decommissioned, per the existing Sync/Resource Status rules in `CONTEXT.md`), or something else (e.g. hide them, or require explicit confirmation before decommissioning a whole subscription's worth of Resources at once)?
- **Validation on add**: should adding a subscription ID validate that the app's Azure credentials actually have access to it before saving, or accept any ID and let the next Sync run surface the problem (e.g. an access error)?
- **Access control**: this page lets someone change what infrastructure the whole app tracks, which is a sensitive action. The app has no authentication yet (also deferred — see note below), but once login exists, this page will very likely need to be restricted to specific roles rather than open to every logged-in user. Revisit this when auth is actually built.

## Related deferred work

- **Authentication/login**: the user has confirmed no authentication is needed for the initial build, but a login will be added later. This subscription-management page is a good candidate for being access-gated once that happens, since it controls what infrastructure the entire register tracks.
- **Sync's own Azure identity**: Sync currently authenticates to Azure via `DefaultAzureCredential`, which reuses whoever is locally logged in via `az login` on the machine running the app (confirmed with the user — this is a deliberate "for now" choice, not a final design). This only works for local development on a machine where someone has run `az login`, and breaks once that CLI session expires or once the app runs somewhere the developer isn't personally logged in (a server, a teammate's machine, a production deployment). Before this app runs anywhere other than a developer's own machine, it needs a dedicated Azure identity for Sync itself — most likely a Service Principal (App Registration) with Reader-level access to the configured subscriptions, following the same "secret lives in `.env`, read via `ENValidatorHelper`" pattern already used for the database connection string. Revisit this alongside deciding where/how the app is actually deployed.
