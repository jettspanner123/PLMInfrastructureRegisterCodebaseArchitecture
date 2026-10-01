# TODO: Manual Entry Path for Physical Machines

**Status**: Deferred — not part of the initial build. Build this once the core Sync-based Resource flow is working.

## Why this exists

Resources normally only enter the register through Sync scanning Azure (see `CONTEXT.md`). But the legacy spreadsheet has rows with `TYPE` = **Physical Machine** — real, non-cloud computers that Azure has no knowledge of. Sync can never discover these, no matter how it's configured, because they don't exist in Azure at all.

The user confirmed physical machines still need to be tracked going forward (not just historical/legacy data), so there needs to be some way to manually add one to the register.

## What this feature needs to do

- Let a user manually create a Resource record with `TYPE` = Physical Machine.
- All of its fields are Manual (there is no Azure data to auto-fill, since Sync never touches it) — every Dynamic field that a Sync'd Resource would normally have populated automatically instead needs to be entered by hand for a Physical Machine, or left blank/not-applicable.
- A manually-created Physical Machine must never be touched or decommissioned by Sync, since Sync has no way to know whether it still exists — its Resource Status should be managed manually too.

## Open questions to resolve when building this

- Should a manually-entered Physical Machine have the exact same set of fields as an Azure-sourced Resource (with the Dynamic ones just being freely editable instead of auto-filled), or a reduced field set specific to physical hardware?
- Who should be allowed to add/edit/decommission a Physical Machine once authentication exists (see the access-control note in `ADD_OR_REMOVE_SUBSCRIPTION_FEATURE_TODO.md`)?
