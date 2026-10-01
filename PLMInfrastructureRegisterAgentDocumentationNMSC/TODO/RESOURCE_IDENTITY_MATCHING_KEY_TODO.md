# TODO: Decide How Sync Matches a Resource to an Existing Record

**Status**: Unresolved — explicitly parked by the user ("not too sure about this, skip this question") rather than decided. Do not silently pick a default when implementing Sync/Resource — ask again before writing the matching logic.

## The problem

Sync needs to tell "is this Azure thing I just found the same Resource I already have a record for, or a brand-new one?" on every run. Whatever field answers that question is the Resource's real identity — everything else (hostname, resource group, size, IP, etc.) is just an attribute that can change without it being a different Resource.

## Why this isn't trivial

- The legacy spreadsheet has a `New HOSTName` column — hostnames get renamed. If Sync matched on hostname, a rename would look like the old Resource disappeared (wrongly marked Decommissioned, per the existing Sync/Resource Status rule in `CONTEXT.md`) and a new one appeared, losing history.
- Azure's full Resource ID (e.g. `/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{name}`) embeds the subscription and resource group in the string itself. If a VM is ever moved to a different resource group or subscription, its Resource ID changes too, even though a human would still call it "the same machine." Whether this team actually does that kind of move wasn't established — the user wasn't sure.
- Azure VMs also expose a separate, permanent GUID (sometimes called the VM's "Unique ID" / `vmId`) that's generally understood to survive resource-group/subscription moves — a candidate for a move-proof matching key, but this needs verifying against current Azure docs before relying on it, and it may not exist for every `TYPE` (e.g. Storage Accounts aren't VMs and may not expose an equivalent).

## Open question to ask the user later

Which field should Sync use to match a newly-seen Azure resource to an existing Resource record:

- The full Azure Resource ID (simplest, but breaks on resource-group/subscription moves)
- The VM's permanent unique ID / equivalent per resource type (more resilient, needs verification it actually survives moves, and needs an equivalent identified for non-VM types like Storage Accounts)
- Something else

This blocks writing the actual Resource entity schema and the Sync matching logic — resolve before implementing either.
