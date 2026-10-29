# PRD: Admin Email/Password Login

## Objective
This app has no authentication system at all today - every feature is open to anyone who opens it. A long-standing TODO (`ADMIN_GATED_ROW_DELETION_AND_EDIT_MODE_TODO.md`) has been explicitly waiting on exactly this: Edit Mode, row deletion, cell formatting, and Status changes on Environment Overview / Infrastructure Register were all shipped deliberately ungated, with the stated plan to restrict them to admins "once auth exists." This PRD is that unblock - a real email/password admin login that issues a JWT, stored client-side, that identifies a specific logged-in admin by email.

**What this PRD does NOT cover**: what an admin can actually do differently once logged in. No existing feature becomes gated by this change. That is explicit future scope, picked up later using the TODO above as its starting point. This PRD is scoped purely to: an admin can log in with email + password, and the app remembers that they're logged in as a specific admin.

## Core Features
1. **Entry point**: a new button in the profile card (`ProfileSettingsSharedComponent.tsx`), placed directly above the existing "Settings" button, in the same column/section. Clicking it closes the profile card and opens a new login modal.
2. **Login modal**: a new, bespoke modal (new component, following `CreateOptionModalController`'s existing convention - `ModalSharedComponent` shell, inline error message state, reusing `InputSharedComponent`), with exactly two fields:
   - **Email**
   - **Password** (masked input)
   - A submit button (`PrimaryActionButtonSharedComponent`, matching every other form in this app) and a cancel/close affordance.
3. **On submit**: the frontend calls a new backend endpoint with the email + password. The backend looks up the admin account by email, verifies the password against its stored hash, and either:
   - **Success**: issues a JWT (claims: the admin's email as subject, `role: Admin`, 30-day expiry) and returns it.
   - **Failure (wrong email or password)**: returns 401, modal shows an inline error ("Invalid email or password.").
   - **Failure (too many recent wrong attempts for that email)**: returns 429, modal shows an inline error indicating a temporary lockout.
4. **Token storage**: the JWT is stored client-side via a new `AdminIdentityUtility.ts` (parallel to the existing `AnonymousClientIdentityUtility.ts` / `ApplicationUserPreferenceUtility.ts` convention - same tab-scoped localStorage/sessionStorage read/write already used for every other persisted preference in this app). The utility exposes:
   - `getAdminToken(): string | null`
   - `isLoggedInAsAdmin(): boolean` - decodes the stored JWT's `exp` claim client-side (no server round-trip) and returns `false` if missing or expired.
   - `getAdminDisplayIdentity(): string | null` - decodes the stored JWT's email claim, for display purposes.
   - `clearAdminToken(): void`
5. **Visible feedback on success**: a success toast ("Logged in as Admin"), and the profile card's role line (currently the static, generic `NavigationCON.PROFILE_DISPLAY_ROLE` label) switches to show "Administrator" whenever `AdminIdentityUtility.current.isLoggedInAsAdmin()` is true.
6. **Sign Out wiring**: the profile card's existing "Sign Out" button (today purely decorative - confirms a modal and does nothing real, since there was nothing real to sign out of) now also calls `AdminIdentityUtility.current.clearAdminToken()` on confirm, so the admin role indicator reverts and the stored JWT is removed.
7. **Account provisioning (this build only, not a generalizable flow)**: there is no self-service admin signup. The initial admin account(s) are created directly by hashing the email/password the user provides and inserting the row via direct SQL (Neon MCP), using the exact same hashing scheme (`PasswordHasher<T>`) the login endpoint itself uses to verify - the plaintext password is never persisted anywhere, only its hash. Adding further admins later follows the same manual path (or, in the future, a real admin-management UI/endpoint - out of scope here).

## Data Model
New table `IG_AdminAccountTBL`:

| Column | Type | Notes |
|---|---|---|
| `Id` | `uuid` | Primary key |
| `Email` | `text` | Unique (case-insensitive comparison on login) |
| `PasswordHash` | `text` | Produced by `PasswordHasher<T>.HashPassword(...)` - never a raw/plaintext password |
| `CreatedAt` | `timestamptz` | |

No soft-delete, no update endpoint, no roles/permissions column - every row in this table is implicitly an admin; there is exactly one role in this system right now.

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS (existing MSC architecture - singleton service, `*CON.ts` constants, TanStack Query mutation hook for the login call).
- Backend: .NET (feature-folder architecture, matching every other feature - new `Features/Admin/` folder: `AdminController`, `AdminService`, `AdminAssertion`, DTOs).
- New backend dependencies (none of this exists in the codebase today):
  - `Microsoft.Extensions.Identity.Core` - for `PasswordHasher<T>`, the minimal official password-hashing primitive (no full ASP.NET Core Identity user/role system needed, just the hasher itself).
  - `System.IdentityModel.Tokens.Jwt` - for issuing the signed JWT (`JwtSecurityTokenHandler`).
- New backend configuration required: a JWT signing key (e.g. `Jwt:SigningKey`), added to `appsettings`/environment config - a new secret the user will need to set.
- Database: PostgreSQL (Neon), via EF Core migration for `IG_AdminAccountTBL`.

## Endpoint
- `POST /api/Admin/Login` - body: `{ email, password }`.
  - Looks up `IG_AdminAccountTBL` by email (case-insensitive).
  - If found, verifies password via `PasswordHasher<T>.VerifyHashedPassword`.
  - Tracks recent failed attempts **in-memory**, keyed by normalized email: 5 wrong attempts within a 10-minute window triggers a 429 for that email until the window rolls over (known limitation: this resets on backend restart and does not share state across multiple backend instances - acceptable for this app's current single-instance deployment; revisit if that ever changes).
  - On success: resets that email's failed-attempt counter, issues a JWT (`sub`: email, `role`: `Admin`, `exp`: now + 30 days), returns `{ token }`.
  - On bad credentials: 401, generic message (does not reveal whether the email exists or the password was wrong, to avoid email enumeration).
  - This is the **only** new endpoint in this PRD - nothing else in the backend checks or requires this JWT yet (no `[Authorize]`, no gating). It exists purely to be issued and stored.

## Design Direction
- Button above "Settings": label **"Admin Login"**, with a lock/shield-style Lucide icon (e.g. `ShieldCheck` or `KeyRound`), same row/button styling already used for "Settings" and "Sign Out" in that same panel.
- Modal title: **"Admin Login"**, subtitle **"Enter your admin credentials to continue."**
- Fields: "Email" (placeholder `you@example.com`), "Password" (masked, placeholder `••••••••`).
- Submit button label: **"Log In"**.
- All copy above is a starting proposal - correct it when reviewing this PRD if any of it should read differently; nothing here is final until then.

## Requirements
- Functional requirements are captured in "Core Features" above.
- Authorization: none yet - this PRD only issues identity, it does not change what anyone can do. Explicitly deferred to a future PRD, using `ADMIN_GATED_ROW_DELETION_AND_EDIT_MODE_TODO.md` as its starting scope.
- Security:
  - Passwords are always hashed (`PasswordHasher<T>`), never compared or stored as plaintext, anywhere - including the one-time manual account-provisioning step.
  - Login failures never reveal whether the email exists.
  - Basic brute-force throttling (5 attempts / 10 minutes per email) on the login endpoint.
  - JWT signing key lives in backend configuration, never shipped to the frontend.

## Expected Outcome
A working "Admin Login" entry point in the profile card: a user who knows a valid admin email/password can log in, sees a success toast and the profile card's role line change to "Administrator", and stays logged in (JWT persisted, matching this app's existing tab-scoped storage convention) for 30 days or until they use "Sign Out" - all without any existing feature's behavior changing in any way.

## Constraints
- No self-service signup, no password reset flow, no admin-management UI - all out of scope, matching the explicit "future scope" framing of this request.
- No endpoint actually requires or validates this JWT for authorization yet - that is a deliberate, separate future PRD.
- In-memory lockout counter does not survive a backend restart and does not work across multiple backend instances - acceptable today given this app's current single-instance deployment.
