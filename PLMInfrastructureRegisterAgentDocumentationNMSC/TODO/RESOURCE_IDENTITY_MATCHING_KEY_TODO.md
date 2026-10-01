# RESOLVED: How Sync Matches a Resource to an Existing Record

**Status**: Resolved. Sync matches on the full **Azure Resource ID**, stored in `ResourceNexus.AzureResourceId`.

## The decision

The user confirmed: use the Azure Resource ID (e.g. `/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{name}`) as the stable key Sync uses to tell "is this the same Resource I already have, or a new one" on every run.

## The known trade-off, accepted deliberately

If a VM is ever moved to a different resource group or subscription, its Resource ID changes, and Sync will treat it as a brand-new Resource — the old record gets marked Decommissioned (per the Sync/Resource Status rule in `CONTEXT.md`) and a new one is created, splitting what a human would call "the same machine" into two historical records.

This was accepted as a reasonable starting point rather than over-engineering for a move pattern that was never confirmed to actually happen. If resource-group/subscription moves turn out to be common and this becomes a real problem, the fix is contained: swap the matching key (e.g. to the VM's permanent unique ID) in one column and one piece of matching logic — not a rebuild of Sync or the Resource entity.

## Original context (for history)

- The legacy spreadsheet's `New HOSTName` column proved hostnames get renamed, which is why hostname was ruled out as the matching key.
- Azure VMs also expose a separate, permanent GUID (sometimes called the VM's "Unique ID" / `vmId`) that's generally understood to survive resource-group/subscription moves. It was considered but not chosen for the initial implementation — noted here in case the trade-off above ever needs revisiting.
