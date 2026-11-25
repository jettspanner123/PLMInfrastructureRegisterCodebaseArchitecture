# Implementation Plan: UI Polish & Feature Request Removal

**Branch**: `012-ui-polish-cleanup` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-ui-polish-cleanup/spec.md`

## Summary

A single backend-held `FRONTEND_DESIGN_SCHEMA` setting (`WePLM` | `AtlasCopco`, defaulting to `AtlasCopco`) gates five visual/structural changes — app-wide 6px corner rounding, removing the AI assistant button from Infrastructure Register, removing the Feature Request page/nav link, re-theming the application's brand navy color to `#008eb8`, and swapping the splash screen's looping animation for a static, schema-matching logo — while leaving the light-mode-by-default change unconditional. The corner-radius and brand-color changes are both delivered as CSS custom-property overrides (no per-component logic) toggled by one class on `<html>`; the brand-color change additionally requires substituting 31 files' literal hex values for `var(--color-brand*)` references, since (unlike radius) Tailwind has no existing theme-token layer for arbitrary hex literals to hook into. The remaining gated changes (AI button, Feature Request route/nav, splash screen asset) are conditional renders/redirects driven by one new shared hook that reads the setting once per page load.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 (frontend); C# / .NET (backend) — no new language/runtime.

**Primary Dependencies**: Tailwind CSS v4 (CSS theme variables), TanStack Router (file/config-based routing), TanStack Query (existing `configurationConstants.useOptionsQuery` hook), Entity Framework Core (existing `ConfigurationConstants` table/migration pattern) — zero new dependencies.

**Storage**: PostgreSQL via the existing `IG_ConfigurationConstantTBL` table (`ConfigurationKey` → JSON-serialized `List<string>`), reused as-is — one new seeded row, no schema change.

**Testing**: No automated test framework exists in this project; verification is manual, live, via Chrome DevTools MCP (established practice this session), covering both design schema values.

**Target Platform**: Web — the existing application shell, navigation, and Infrastructure Register screen.

**Project Type**: Web application (existing React frontend + .NET backend, both touched).

**Performance Goals**: None beyond existing — one extra cached GET request at app startup (2-minute `staleTime`, same as every other configuration-constant read), no new per-render cost beyond a single hook read.

**Constraints**:
- Tailwind v4's `rounded-{xs,sm,md,lg,xl,2xl,3xl,4xl}` utilities all read `border-radius: var(--radius-*)`, while `rounded-full` compiles to a fixed `calc(infinity * 1px)` that never reads a `--radius-*` variable — confirmed via Tailwind's own documented default theme. This means every one of the 185 existing `rounded-*` utility usages in this codebase (confirmed via a full-codebase scan: no arbitrary `rounded-[...]` values exist anywhere) can be retargeted to 6px with a single scoped CSS rule overriding those theme variables, with zero per-component edits and with `rounded-full` (pills, avatars, dots, toggle knobs) automatically unaffected — exactly matching FR-003/FR-005.
- A handful of surfaces hardcode a literal `border-radius` in plain CSS instead of a Tailwind utility class, found via the same scan, and need their own explicit override alongside the theme-variable one: the data-table sticky header's top corners (`0.75rem`, in `index.css`) and the Sonner toast card (`border-radius: 12px !important`, also `index.css`). Their own circular/pill siblings (a scrollbar thumb, the toast's dismiss button) already use `9999px` and need no change.
- TanStack Router's route tree here is built once from `createRoute(...)` calls at module scope, not re-evaluated per render — there is no existing precedent in this codebase for conditionally removing or redirecting a whole route based on a runtime value (today's `isAdmin` gating only hides UI controls, never a route itself). The Feature Request route must stay registered in the tree either way; reachability is enforced inside its own screen-route wrapper instead (redirecting away when the schema is `AtlasCopco`), which satisfies FR-012's "not reachable by any means" without restructuring the router.
- The design schema value is fetched asynchronously (same `configurationConstants.useOptionsQuery` mechanism as every other configuration constant) — there is an initial loading window before the real value is known. Since the stated default is `AtlasCopco`, every gated surface defaults to its `AtlasCopco` behavior optimistically during that window, flipping to `WePLM` behavior only once the fetch confirms it — avoiding a flash of removed-feature content for the common/default case. **One confirmed exception**: a navigational redirect (the Feature Request route) cannot safely use this same optimistic-default approach, since a wrong guess there isn't just a visual flash — it fires a real navigation with no later render able to undo it. That one case instead gates on a second hook (`useIsFrontendDesignSchemaResolved()`) that only becomes true once the real value is known.
- The brand-navy color has no existing Tailwind theme-token layer the way corner radius did (`rounded-lg` already resolved to `var(--radius-lg)` before this feature touched it) — every one of its 31 call sites is a raw literal hex inside a Tailwind arbitrary-value class (or, in one case, an inline `style` prop), so retargeting it requires substituting each literal occurrence for a `var(--color-brand*)` reference, not just redefining one shared theme namespace. Four variables (not one) are needed, since the color has three existing derived shades (hover, active, a lighter tint) with their own hand-tuned relationships to the base that a flat find-and-replace would destroy.
- Several components already substitute a *different*, Tailwind-stock color in dark mode (`dark:text-blue-400`, `dark:bg-blue-600`, `dark:accent-blue-500`, `dark:text-sky-400`, etc.) specifically because they never used the literal brand navy in dark mode to begin with. These are out of scope — "wherever you have used the deep navy color" cannot reasonably extend to a color that was never the deep navy.
- The splash screen's existing dismissal logic is driven by a video's own `onEnded` event (replay-if-not-ready-yet, dismiss-if-ready); removing the video for both schema values removes that event entirely, so dismissal must be restructured to key off the already-existing `isReadyToDismiss` state directly (a plain `useEffect`), independent of any video lifecycle.

**Scale/Scope**: One new backend migration (one seeded row) plus one backend allow-list entry (reusing the fully generic, already-existing `GET /ConfigurationConstants/{fieldName}` endpoint — no new endpoint, no new DTO); one new shared frontend hook (plus one small addition to it, a resolved-state check for the one navigational-redirect exception); two new CSS override blocks (radius, brand color — four new custom properties); literal-hex-to-CSS-variable substitution across 31 existing frontend files (see research.md §6 for the full list); a splash-screen component restructure (video → static `<img>`, one new image asset) plus its dismissal-logic change; conditional-render edits in three existing frontend files (Resources screen, Navigation, Feature Requests screen route) plus the existing theme-bootstrap file; zero deletions of working code (the Feature Request feature, the AI assistant button, and the splash animation's own video file all stay fully intact in the codebase/repository, since `WePLM` must keep using the first two and nothing requires deleting the now-unreferenced video asset).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (confirmed again this session) — no project-specific principles to gate against. Vacuous pass.

## Project Structure

### Documentation (this feature)

```text
specs/012-ui-polish-cleanup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/
    └── frontend-design-schema-field.md   # The one new allow-listed fieldName on an existing endpoint
```

### Source Code (repository root)

```text
PLMInfrastructureRegisterOrchestratorServiceLayerMSC/
├── Features/ConfigurationConstants/Assertion/ConfigurationConstantsAssertion.cs   # EXTEND: one new fieldName -> key entry
└── Migrations/                                                                    # ADD: one new migration seeding the FRONTEND_DESIGN_SCHEMA row

PLMInfrastructureRegisterClientServiceLayerMSC/src/
├── Utilities/
│   ├── ApplicationThemeUtility.ts                      # unchanged — light-default already correct (confirmed in spec research)
│   └── FrontendDesignSchemaUtility.ts                  # NEW — mirrors AdminIdentityUtility.ts's own useIsAdmin() hook shape; also gains useIsFrontendDesignSchemaResolved()
├── Router/ApplicationRouter.tsx                         # EXTEND: read the schema once at bootstrap, toggle the new CSS class (same spot theme does today)
├── Routes/FeatureRequestsScreenRoute.tsx                 # EXTEND: redirect away when schema is AtlasCopco
├── Features/Navigation/
│   ├── Constants/NavigationCON.ts                       # unchanged — NAV_ITEMS keeps the Feature Request entry (filtered at render, not removed from the constant)
│   └── NavigationController.tsx                         # EXTEND: filter out the Feature Request entry when schema is AtlasCopco
├── Features/Resources/ResourcesScreenController.tsx      # EXTEND: render the AI assistant button only when schema is WePLM
├── Features/SplashScreen/
│   ├── SplashScreenController.tsx                       # EXTEND: dismiss on isReadyToDismiss directly (no more video-ended gate)
│   └── Components/static/SplashScreenLogoStaticComponent.tsx   # EXTEND: <video> → schema-conditional <img>
├── Assets/Images/AtlasCopcoLogo.webp                     # NEW — the attached logo, added to the existing static-image subfolder
├── index.css                                             # EXTEND: two CSS rule blocks under .schema-atlascopco — the existing --radius-* override, plus four new --color-brand* overrides
└── 31 existing files across Shared/Components, Features/*, using the brand-navy hex today
                                                           # EXTEND: each literal #0C2086/#0D2086/#081765/#051047/#1e3ab8 Tailwind arbitrary-value (or the one inline style)
                                                           # becomes a var(--color-brand*) reference in the same position — see research.md §6 for the full list
```

**Structure Decision**: Almost everything lives in existing files except one new frontend utility (`FrontendDesignSchemaUtility.ts`, mirroring the existing `AdminIdentityUtility.ts` hook pattern exactly), one new image asset (`AtlasCopcoLogo.webp`), and one new backend migration. No new screens, no new backend endpoint or DTO, no new database table — this reuses the existing generic `ConfigurationConstants` mechanism and the existing theme-bootstrap/CSS-class-toggle pattern already proven by dark mode. The brand-color work is the one part of this feature touching a large, flat list of existing files (31) rather than a small, centralized set — an inherent consequence of those files already hardcoding a literal color value with no shared token to redirect, not a sign of a more invasive architecture.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — vacuous Constitution Check pass, no new dependencies, no new database table, no new backend endpoint.
