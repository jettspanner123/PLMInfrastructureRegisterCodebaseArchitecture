# PLM Infrastructure Register

Replaces a manually-maintained Excel register of Azure infrastructure with an app that renders the same table but keeps Azure-derived columns in sync automatically instead of by hand.

## Language

**Resource**:
One entry in the register — a piece of Azure infrastructure (a Virtual Machine, Storage Account, or Physical Machine) tracked by the system. One row in the old spreadsheet is one Resource.
_Avoid_: Machine, Server, Asset, Entry

**Sync**:
The process by which the app scans the connected Azure subscription(s) and creates or updates Resource records to match what currently exists in Azure. Physical Machines are the one exception: since they aren't Azure resources, Sync can never discover them, so they're added to the register manually instead of through Sync.
_Avoid_: Scan, Import, Discovery

**Resource Status**:
The lifecycle state of a Resource (e.g. Running, Stopped, Decommissioned). Sync sets a Resource's status to Decommissioned once it can no longer find that Resource in Azure, but never deletes the record — decommissioned Resources remain visible as history.
_Avoid_: State

**Dynamic Field**:
A Resource attribute whose value is fetched from Azure during Sync and cannot be edited directly by a user (e.g. Size, CPU, RAM, Private IP Address).
_Avoid_: Automated field, Azure field, Synced field

**Manual Field**:
A Resource attribute entered and edited directly by a user; Sync never overwrites it (e.g. Function, Comment, DBA Support).
_Avoid_: Editable field, Static field
