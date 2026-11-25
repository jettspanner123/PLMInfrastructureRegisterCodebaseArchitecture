# Research: UI Polish & Feature Request Removal

No `[NEEDS CLARIFICATION]` markers remain — both forks were resolved via clarification rounds during `/speckit-specify`. This phase works out how to actually build what was agreed, informed by a full read of the relevant existing code.

## 1. Corner radius: one CSS theme-variable override, not 185 component edits

**Decision**: Toggle one class (`schema-atlascopco`) on `document.documentElement`/`document.body` — mirroring exactly how `.dark` already works in `ApplicationThemeUtility.applyTheme` — and add one CSS rule in `index.css` that redefines Tailwind's `--radius-{xs,sm,md,lg,xl,2xl,3xl,4xl}` theme variables to `6px` while that class is present, plus two small hand-written exceptions for the two spots that hardcode a literal radius instead of a Tailwind class.

**Rationale**: A full-codebase scan (`grep -rohE "rounded-(none|sm|md|lg|xl|2xl|3xl|full)\b"`) found 185 usages of the standard Tailwind radius scale and zero arbitrary `rounded-[...]` values anywhere in the `.tsx` layer. Tailwind v4's own documented default theme defines every `rounded-{size}` utility (except `full`) as `border-radius: var(--radius-{size})`, while `rounded-full` compiles to a fixed `calc(infinity * 1px)` that never reads a theme variable at all. Overriding those variables under one scoped selector therefore retargets all 185 usages at once, with `rounded-full` (pills, avatars, status dots, toggle knobs) automatically excluded — exactly matching spec FR-003/FR-005 with no component-by-component work and no risk of missing one.

Two exceptions found in `index.css` bypass Tailwind entirely and need their own override line under the same `schema-atlascopco` selector:
- `.data-table-sticky-header-container` — `border-top-left-radius`/`border-top-right-radius: 0.75rem` (a genuine rounded-rectangle page surface, in scope).
- `[data-sonner-toast]` — `border-radius: 12px !important` (the toast card itself, in scope; its own `[data-close-button]`'s `border-radius: 9999px !important` is a circular pill and stays untouched, as do the two scrollbar-thumb pills at `9999px` found in the same file).

**Alternatives considered**:
- *Editing all 185 usages individually* (e.g. a codemod swapping `rounded-lg`/`rounded-xl`/etc. for a literal `rounded-[6px]`) — rejected: far larger diff, harder to review, and loses the single-source-of-truth property the CSS-variable approach gives for any future radius tweak.
- *A second, parallel Tailwind theme/build* (compiling two separate CSS bundles, one per schema) — rejected: Tailwind v4's `@theme` variables are real runtime CSS custom properties specifically so a later, more specific selector can re-declare them without a second build; introducing a second bundle would be strictly more complex for no extra benefit.

## 2. The FRONTEND_DESIGN_SCHEMA setting reuses the existing generic ConfigurationConstants mechanism as-is

**Decision**: No new backend endpoint, DTO, or table. Add one entry to `ConfigurationConstantsAssertion`'s existing `OptionsFieldNameToConfigurationKey` allow-list (public fieldName `"FrontendDesignSchema"` → stored `ConfigurationKey` `"FRONTEND_DESIGN_SCHEMA"`, following this file's own existing dual-naming convention for every other field there), and one new EF Core migration seeding a single row (`ConfigurationKey = "FRONTEND_DESIGN_SCHEMA"`, `ConfigurationValue = ["ATLASCOPCO"]` as the same JSON-array-of-strings shape every other row already uses), mirroring the existing `AddConfigurationConstants` migration's own `InsertData` call. The frontend reads it with the exact same `TanstackQueryClientService.current.configurationConstants.useOptionsQuery('FrontendDesignSchema')` hook that `Sponsor` already uses, taking `options[0]` (defaulting to `'ATLASCOPCO'` whenever the list is empty, missing, or holds anything other than exactly `'WEPLM'`/`'ATLASCOPCO'`, per FR-001).

**Rationale**: The user's own request named the exact mechanism ("in the database, in the configuration constant table, add a new key") — this table already stores every field as `ConfigurationKey → List<string>`, and the existing `GetOptionsAsynchronous` already returns `new List<string>()` (→ empty → default `AtlasCopco`) for any key with no row at all, which is precisely the fallback FR-001 requires. Reusing the existing generic GET endpoint needs zero new backend surface area; the confirmed "pure backend/database setting, no in-app UI" clarification means no `AddOption`/`ReplaceOptions` caller is ever needed for this key either, so the existing write-side endpoints need no changes.

**Alternatives considered**:
- *A dedicated single-value settings table/endpoint* (e.g. a `GET /Settings/FrontendDesignSchema` returning one string instead of a list) — rejected: adds a new table, DTO, controller action, and service method for something the existing generic mechanism already models correctly as a one-item list; not worth the extra surface area for a value nothing in the app ever appends to.

## 3. One new shared frontend hook, mirroring the existing `useIsAdmin()` pattern

**Decision**: `FrontendDesignSchemaUtility.ts` (new file, `Utilities/`), exporting a `useFrontendDesignSchema(): 'WePLM' | 'AtlasCopco'` hook built on the query from decision #2 above — directly mirroring `AdminIdentityUtility.ts`'s own `useIsAdmin()` shape (same folder, same "one small hook wrapping one query/check" pattern already proven in this codebase).

**Rationale**: Every gated surface (the AI button, the nav item, the Feature Request route, the bootstrap CSS-class toggle) needs the same derived value; a single shared hook avoids re-deriving the default-on-empty/unrecognized-value fallback logic in four different places. `AdminIdentityUtility.useIsAdmin()` is the closest existing precedent for "one small derived boolean/enum consumed across several otherwise-unrelated features."

**Alternatives considered**:
- *Reading the raw query result directly in each of the four consuming files* — rejected: would duplicate the `options[0] → 'WEPLM' | 'AtlasCopco'` normalization (including the fallback-to-AtlasCopco rule) in four places instead of one.

## 4. Feature Request route stays registered; reachability is enforced inside its own screen-route wrapper

**Decision**: `FeatureRequestsScreenRoute.tsx` (the existing "zero-logic entrypoint wrapper mapped directly in the router," per this project's own architecture table) gains exactly one conditional: when `useFrontendDesignSchema()` is `'AtlasCopco'`, redirect away (to the application's root/home route) instead of rendering `FeatureRequestsScreenController`. The route itself stays registered in `ApplicationRouter.tsx`'s `createRoute(...)` tree unchanged.

**Rationale**: TanStack Router's route tree here is built once from module-scope `createRoute(...)` calls, not re-evaluated per render — there is no existing precedent in this codebase for conditionally removing a route from that tree at runtime (today's admin gating only ever hides UI controls, never a route), and restructuring route-tree construction to be schema-aware would be a far larger, riskier change than this feature calls for. Enforcing the redirect one layer down, inside the screen-route wrapper that already exists for exactly this kind of entrypoint logic, fully satisfies FR-012 ("not reachable by any means") without touching the router's own construction.

**Alternatives considered**:
- *Making route-tree construction itself schema-aware* (e.g. awaiting the schema fetch before building the tree, or rebuilding it on schema change) — rejected: the schema is fetched asynchronously the same way every other configuration constant is, and gating this deep in app bootstrap would delay the entire app's first paint on every load, for every schema value, to save what a one-line redirect in the existing wrapper already achieves.

## 5. Navigation item stays in the constant; filtering happens at render time

**Decision**: `NavigationCON.ts`'s `NAV_ITEMS` array keeps its existing `'feature-requests'` entry unchanged. `NavigationController.tsx` filters that array (excluding the `'feature-requests'` entry when `useFrontendDesignSchema()` is `'AtlasCopco'`) immediately before rendering the nav bar.

**Rationale**: `WePLM` must keep showing this item exactly as today, so the constant itself cannot simply drop the entry — filtering at the one render site that actually needs the schema-aware list keeps `NavigationCON.ts` a plain, schema-agnostic data file (consistent with every other constant in this codebase) rather than importing a React hook into a `*CON.ts` constants file, which this project's architecture reserves for pure data.

**Alternatives considered**:
- *Two separate `NAV_ITEMS` arrays (one per schema), exported as a function* — rejected: the single-array-filtered-at-render approach is a smaller diff and keeps the one existing array as the obvious single source of truth for "every nav item that can ever exist."

## 6. Brand navy re-theme: four new CSS variables, substituted into every literal usage, not a bulk find/replace

**Decision**: Introduce four new `--color-brand*` custom properties in `index.css`'s existing `:root` block (matching that block's own `--color-ink`/`--color-body`/etc. naming convention), set to today's exact literal values so `WePLM`'s rendered output is byte-for-byte unchanged, then override all four under the existing `.schema-atlascopco` selector:

| Variable | `:root` (WePLM, unchanged) | `.schema-atlascopco` (new) | Used for |
|---|---|---|---|
| `--color-brand` | `#0C2086` | `#008eb8` | The base brand navy itself |
| `--color-brand-hover` | `#081765` | `#006a89` | Hover-darken (buttons, send button, date/time picker) |
| `--color-brand-active` | `#051047` | `#004a60` | Active/pressed-darken (`ConfirmationModalSharedComponent` only — one step past hover) |
| `--color-brand-tint` | `#1e3ab8` | `#12b9ea` | Lighter accent tint (`TableHorizontalScrollPillSharedComponent` only, used at reduced opacity) |

A full-codebase catalog (grep across `PLMInfrastructureRegisterClientServiceLayerMSC/src`) found every literal usage of `#0C2086`/`#0D2086` and these three derived shades across 31 files, as Tailwind arbitrary-value classes (`bg-[HEX]`, `bg-[HEX]/NN`, `!bg-[HEX]`, `hover:!bg-[HEX]`, `hover:bg-[HEX]`, `active:!bg-[HEX]`, `text-[HEX]`, `border-[HEX]`, `border-[HEX]/NN`, `focus:ring-[HEX]`, `focus:ring-[HEX]/NN`, `focus-visible:ring-[HEX]`, `focus:border-[HEX]`, `accent-[HEX]`, `shadow-[HEX]/NN`), one raw inline `style={{backgroundColor:'#0C2086'}}` (`ChatAssistantSharedComponent.tsx`), and two raw CSS rules in `index.css` itself (`.data-table-sticky-header-container`'s `background-color`, and the existing `--table-selection-border-color: #0c2086` custom property already used by `TableSelectionService.ts`). Every one of these literal hex occurrences is replaced with a `var(--color-brand*)` reference in the exact same position (e.g. `bg-[#0C2086]` → `bg-[var(--color-brand)]`, `hover:!bg-[#081765]` → `hover:!bg-[var(--color-brand-hover)]`), preserving every opacity suffix/variant prefix unchanged. `--table-selection-border-color`'s own `:root` value becomes `var(--color-brand)` and is further overridden to `#008eb8` under `.schema-atlascopco` directly (its separate `.dark` override, `#60a5fa`, is a different, pre-existing dark-mode-only blue and stays untouched under either schema).

**Rationale**: Tailwind v4 resolves `bg-[var(--anything)]` arbitrary values at build time exactly like any other arbitrary value, so this is the same proven "one override, many consumers" architecture as the corner-radius fix (§1) — just with four variables instead of one, and per-file substitution instead of a theme-namespace override, since these are raw literal hex values with no shared Tailwind theme token backing them the way `rounded-lg` already had `--radius-lg`. The four-variable (not one) shape is load-bearing: a plain find-and-replace of every `#0C2086`-family hex to `#008eb8` would also flatten the hover/active/tint relationships that currently exist between the base color and its own derived shades, producing flat, undifferentiated hover/press states under `AtlasCopco`.

The three derived shades' exact AtlasCopco-side values were computed by converting each existing WePLM shade to HSL, confirming hover/active share the base's hue (~230°) and saturation (~84-87%) with only lightness stepping down (~28.6% → 21.4% → 14.9%, i.e. two successive ~70-75% lightness multiplications), then applying that same hue/lightness-stepping relationship to `#008eb8`'s own HSL (194°, 100%, 36%). The tint shade follows a different relationship in the original (lower saturation, higher lightness, not a simple lightness-only step), so its `AtlasCopco` equivalent was derived by applying the same relative saturation reduction and absolute lightness increase the original tint shows over its own base.

**Scope boundary (not asked about again — follows directly from the earlier "recolor everything, no exceptions" clarification)**: Only literal occurrences of this exact brand-navy hex family are in scope. Several components already substitute a *different*, Tailwind-stock color in dark mode (`dark:text-blue-400`, `dark:border-blue-400`, `dark:bg-blue-600`, `dark:accent-blue-500`, `dark:text-sky-400`, etc.) specifically because the literal brand navy wasn't used there in dark mode to begin with — those are untouched by this feature, since "wherever you have used the deep navy color" cannot reasonably extend to a color that was never the deep navy. `--table-selection-border-color`'s own `.dark` value (`#60a5fa`) falls in this same untouched category for the same reason.

**Alternatives considered**:
- *A single `--color-brand` variable, with hover/active/tint computed via CSS `color-mix()` at the call site* — rejected: `color-mix()`-based darkening doesn't reproduce the original hand-tuned hover/active/tint relationships as closely as directly specifying each pre-computed value, and would require touching every call site's class string anyway (to add the `color-mix()` wrapper) for no less effort than just swapping in the right named variable.
- *Leaving the Tailwind-stock dark-mode substitutes alone but also recoloring them* — rejected per the scope boundary above; they were never "the deep navy," so recoloring them isn't "wherever you have used the deep navy color," it's a different, unrequested change to this app's existing dark-mode palette.

## 7. Splash screen: static `<img>` instead of `<video>`, dismissal keyed on the existing readiness timer instead of a video-loop-end event

**Decision**: `SplashScreenLogoStaticComponent.tsx` drops its `<video>`/`onEnded`/loop-replay logic entirely and renders a plain `<img>` instead, whose `src` is `useFrontendDesignSchema() === 'AtlasCopco' ? atlasCopcoLogo : weplmLogo` — reusing the exact same static asset (`src/Assets/weplm.jpeg`) already imported by `NavigationController.tsx` for `WePLM`, and a new `src/Assets/Images/AtlasCopcoLogo.webp` (the image attached with this request, placed in the existing `Assets/Images/` subfolder alongside `DancingAIAgentMascotImage.png`, the one other static logo-style image already there) for `AtlasCopco`. `SplashScreenController.tsx`'s own dismissal changes from "wait for `isReadyToDismiss` AND a video loop to end" to a plain `useEffect` that calls `onReady()` as soon as `isReadyToDismiss` becomes `true` — since there is no video to loop under either schema value anymore, the existing `allQueriesSettled` + `MINIMUM_DISPLAY_DURATION_MS` timer logic (unchanged) is now the sole dismissal trigger.

**Rationale**: The component's existing entrance motion (`motion.div` scale/opacity fade-in) is a generic "logo appears" transition, not "the animation" the request refers to — that phrase matches the literal `.webm` video content, which both schema values remove per the request's own wording ("remove the animation... when WEPLM"; "use this image... when ATLASCOPCO," implying AtlasCopco never had a looping animation to begin with either). Keeping the fade-in wrapper means the splash screen still feels like a deliberate, designed transition rather than an abrupt image swap, at zero cost since it's schema-agnostic motion, not brand-specific content.

**Alternatives considered**:
- *Extracting a static frame from the existing `.webm` for WePLM* instead of reusing `weplm.jpeg` — rejected: `weplm.jpeg` is already the canonical static brand mark used in the nav bar; extracting a video frame would produce a second, slightly different static asset for the same brand with no benefit.
- *Keeping `onLoopComplete`/video-ended-based dismissal logic as dead code, just never invoked* — rejected: leaves a misleading, unreachable code path for a future reader to puzzle over; removing it cleanly is the smaller, more honest diff.
