# TODO: Admin-Gated Row Deletion on Environment Overview

**Status**: Deferred — blocked on this app getting a real authentication/authorization system.

## Why this exists

The Environment Overview table (`EnvironmentOverviewScreenController.tsx`) now supports adding a row via "Add Environment", but there is still no way to delete one. The natural next step — letting a user remove a row — needs to be restricted to users with admin rights, and this register doesn't have a real authentication system yet (see the comment in `ProfileSettingsSharedComponent.tsx`: "This register has no authentication system yet, so the profile dropdown's identity block is always this static, generic content."). There's no role/permission model to check against today, so building delete now would mean either leaving it open to everyone or faking a role check with nothing real behind it.

## What needs deciding when this is picked up

- What the authentication/authorization system itself looks like (identity provider, session model, how a user's role reaches the frontend) — this TODO assumes that work happens first, as its own separate effort.
- Where the admin check is enforced — almost certainly both the new DELETE endpoint (server-side, non-negotiable) and the frontend (hiding/disabling the delete control for non-admins, the same way `PermissionGuardSharedComponent` already gates other admin-only UI elsewhere in the app).
- Whether deletion is a hard delete or a soft delete (an `IsDeleted` flag, matching the `IsDecommissioned` pattern this table already uses) — soft delete would preserve history and match the register's general "nothing just disappears" feel.
- Whether this generalizes to any other table that gains a delete ability later, or stays specific to Environment Overview's own row-delete UI when it's eventually built.
