# TODO: Add Storage Account Support to Sync

**Status**: Deferred — not part of the initial Sync implementation.

## Why this exists

The first real Sync implementation covers Virtual Machines only. The user confirmed this scoping: the current Dynamic-field list (CPU, RAM, Disk 1-4 performance, VM creation/deletion dates) is VM-shaped, and designing an equivalent mapping for Storage Accounts (which have none of those properties) would block shipping real VM data for a `TYPE` that's a small fraction of the actual register (9 of 184 rows in the legacy data, vs. 138 for Virtual Machines).

## What needs deciding when this is picked up

- Which of Storage Account's own properties (replication type, access tier, endpoint URLs, etc.) are even meaningful to this register — none of the existing Dynamic fields apply as-is.
- Whether Storage Accounts need their own Dynamic field set added to `ResourceNexus`/`ResourceColumnCON`, separate from the VM-shaped fields that don't apply to them (which would then need to render as blank/N/A for VM rows, same as they already do for the legacy data).
- Whether the Sync pipeline's Azure enumeration and matching logic (keyed on Azure Resource ID, see `RESOURCE_IDENTITY_MATCHING_KEY_TODO.md`) extends cleanly to Storage Accounts or needs its own pass.

Physical Machines are a separate, already-tracked gap — see `MANUAL_PHYSICAL_MACHINE_ENTRY_TODO.md`.
