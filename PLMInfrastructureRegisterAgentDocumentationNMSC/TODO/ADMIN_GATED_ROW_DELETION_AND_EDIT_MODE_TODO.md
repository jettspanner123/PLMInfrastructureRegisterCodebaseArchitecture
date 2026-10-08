# TODO: Admin-Gated Row Deletion & Edit Mode

**Status**: Deferred — blocked on this app getting a real authentication/authorization system.

## Why this exists

The Environment Overview table (`EnvironmentOverviewScreenController.tsx`) now supports adding a row via "Add Environment", but there is still no way to delete one. The natural next step — letting a user remove a row — needs to be restricted to users with admin rights, and this register doesn't have a real authentication system yet (see the comment in `ProfileSettingsSharedComponent.tsx`: "This register has no authentication system yet, so the profile dropdown's identity block is always this static, generic content."). There's no role/permission model to check against today, so building delete now would mean either leaving it open to everyone or faking a role check with nothing real behind it.

The same gap now also applies to the View/Edit Mode toggle (`ViewEditModeToggleSharedComponent.tsx`, shown on both Environment Overview and Infrastructure Register): it's currently visible to everyone and switches freely between modes. Once Edit Mode does something real, both the toggle's visibility and the ability to actually enter Edit Mode need the same admin-only restriction as row deletion — for the same reason: there's no role to check against yet.

**Update**: Edit Mode's first real behavior has now shipped (Status becomes an editable, searchable dropdown on the Environment Overview table, with a "+ Add New Status" option opening a create-new-status modal, and every change recorded in a full audit log — `IG_EnvironmentOverviewStatusHistoryTBL` via `EnvironmentOverviewStatusHistoryNexus`, tracking old value, new value, timestamp, and a per-browser placeholder changer id). This was a deliberate, explicit decision: ship the feature now, fully ungated, rather than wait for an auth system that doesn't exist yet — the user's own words were "the modal should be ADMIN only but, currently I'm developing the feature right? so don't add any role filter please, but keep in TODO that this feature will only be shown to admin only." So as of now, **anyone who opens this page can change any environment's Status and create new Status options, with zero restriction** — this is a known, accepted gap, not an oversight, and the items below are exactly what's still needed to close it.

Correction to this TODO's own earlier claim: `PermissionGuardSharedComponent` does **not** actually exist anywhere in this codebase (checked directly) — there is no admin-gating mechanism of any kind in this app yet, UI or backend. Whatever gate gets built for this will be new, not a reuse of something already shipped.

## What needs deciding when this is picked up

- What the authentication/authorization system itself looks like (identity provider, session model, how a user's role reaches the frontend) — this TODO assumes that work happens first, as its own separate effort.
- Where the admin check is enforced — almost certainly both new/existing endpoints (server-side, non-negotiable: the future DELETE endpoint, and the already-shipped `UpdateStatus`/`AddStatusOption` endpoints) and the frontend (hiding/disabling the relevant controls for non-admins).
- Once real user identity exists, `EnvironmentOverviewStatusHistoryNexus.ChangedByClientId` should be replaced with a real user id - every row currently written so far is stamped with a meaningless per-browser random id, not a real identity, and those existing history rows will stay that way (nothing retroactively fixes old rows).
- Whether deletion is a hard delete or a soft delete (an `IsDeleted` flag, matching the `IsDecommissioned` pattern this table used before it became the `Status` string) — soft delete would preserve history and match the register's general "nothing just disappears" feel.
- Whether this generalizes to any other table that gains a delete ability later, or stays specific to Environment Overview's own row-delete UI when it's eventually built.
- `ViewEditModeToggleSharedComponent` itself needs to stay hidden from non-admins entirely (not just disabled) — a visible-but-disabled toggle would advertise a feature that doesn't exist for that user. This needs a new gating component to be built; nothing like it exists today.
- Entering Edit Mode needs its own server-side check too, not just a hidden frontend toggle — the `UpdateStatus`/`AddStatusOption` endpoints must independently verify admin rights once that's possible, the same non-negotiable way a future DELETE endpoint will.
