# Data Model: UI Polish & Feature Request Removal

No new database table. One new row in the existing `IG_ConfigurationConstantTBL` table, read through the existing generic `ConfigurationConstants` mechanism.

## FrontendDesignSchema (existing table, one new row — not a new entity)

| Field | Value | Notes |
|---|---|---|
| `ConfigurationKey` | `"FRONTEND_DESIGN_SCHEMA"` | The literal key name the user specified; seeded once via a new migration, following the existing `AddConfigurationConstants` migration's own `InsertData` pattern. |
| `ConfigurationValue` | `["ATLASCOPCO"]` | A JSON-array-of-strings, the same storage shape every other configuration constant already uses — holds exactly one element. |
| Public `fieldName` (route-facing, not stored) | `"FrontendDesignSchema"` | Added to `ConfigurationConstantsAssertion`'s existing `OptionsFieldNameToConfigurationKey` allow-list, following that file's own `"Sponsor"`/`"Status"`-style public-name convention. |

**Recognized values**: `"WEPLM"` and `"ATLASCOPCO"` (case-insensitive on read, per FR-001's "unrecognized value" fallback). Any other value, an empty list, or a missing row all resolve to the same default: `AtlasCopco`.

**Validation rules**: None new — the existing generic `GetOptionsAsynchronous` has no per-key validation of list contents; the two-value allow-list is enforced entirely on the frontend's own read side (see below), since there is no write path for this key at all (confirmed: pure backend/database setting, no in-app UI).

**State transitions**: None — this is a single, backend-held value read once per page load; it is never written to by the application itself (no `AddOption`/`ReplaceOptions` caller is ever wired up for this key).

## FrontendDesignSchemaType (new frontend-only derived type)

```text
type FrontendDesignSchemaType = 'WePLM' | 'AtlasCopco'
```

Derived once per page load from the raw `ConfigurationConstants` read:

| Raw `ConfigurationValue[0]` (case-insensitive) | Derived `FrontendDesignSchemaType` |
|---|---|
| `"WEPLM"` | `'WePLM'` |
| `"ATLASCOPCO"` | `'AtlasCopco'` |
| anything else, or list empty/missing | `'AtlasCopco'` (default, per FR-001) |

## BrandColorPalette (new derived CSS custom properties — not stored)

Four new `index.css` custom properties, defined in `:root` at today's exact existing values (so `WePLM` renders byte-for-byte unchanged) and overridden under the existing `.schema-atlascopco` selector:

| Variable | `:root` (WePLM) | `.schema-atlascopco` | Replaces every literal occurrence of |
|---|---|---|---|
| `--color-brand` | `#0C2086` | `#008eb8` | `#0C2086` / `#0D2086` |
| `--color-brand-hover` | `#081765` | `#006a89` | `#081765` |
| `--color-brand-active` | `#051047` | `#004a60` | `#051047` |
| `--color-brand-tint` | `#1e3ab8` | `#12b9ea` | `#1e3ab8` |

`--table-selection-border-color`'s existing `:root` value changes from the literal `#0c2086` to `var(--color-brand)` (so it moves with the palette above); its separate `.dark` override (`#60a5fa`) is untouched under either schema, since it was never the brand navy to begin with. See research.md §6 for the full file-by-file literal-to-variable substitution list (31 files) and the HSL derivation behind each AtlasCopco-side value.

## SplashScreenLogoAsset (new static frontend assets — not stored)

| Schema | Asset | Path |
|---|---|---|
| `WePLM` | Existing We.PLM logo (already used in the nav bar) | `src/Assets/weplm.jpeg` (reused, not duplicated) |
| `AtlasCopco` | Atlas Copco logo, attached with this request | `src/Assets/Images/AtlasCopcoLogo.webp` (new file, added alongside the existing `DancingAIAgentMascotImage.png` in the same subfolder) |

Both render as a plain static `<img>`, replacing the existing looping `src/Assets/SplashScreenAnimation.webm` video entirely under either schema (see research.md §7). The video file itself is left in the repository, simply no longer referenced by `SplashScreenLogoStaticComponent.tsx`.

## Per-surface resolution (derived, not stored)

Computed once per page load from the one `FrontendDesignSchemaType` value above — no other field on any existing entity changes.

| Surface | `WePLM` | `AtlasCopco` |
|---|---|---|
| Corner radius (`schema-atlascopco` class on `<html>`/`<body>`) | Absent — every surface keeps today's existing, unchanged radii. | Present — `--radius-*` theme variables (and the two hardcoded-radius exceptions) become 6px app-wide; `rounded-full`/pill elements are unaffected either way. |
| Infrastructure Register header | AI assistant button renders next to Columns, unchanged from today. | AI assistant button does not render; since Infrastructure Register is its only existing trigger point in the application, the assistant becomes unreachable from the UI (its own code is untouched either way). |
| Top navigation bar / Feature Request page | `'feature-requests'` nav item renders; the route renders `FeatureRequestsScreenController` normally. | `'feature-requests'` nav item is filtered out; the route redirects away instead of rendering the screen controller. |
| Theme default (light mode for first-time visitors) | Unaffected — identical under either schema value, per FR-007/FR-008. | Unaffected — identical under either schema value, per FR-007/FR-008. |
| Brand navy color (buttons, table headers, nav highlights, focus rings, status tags, every other literal usage) | Original navy (`#0C2086` family), unchanged. | `#008eb8` family (per `BrandColorPalette` above), including coincidental status-tag reuses. |
| Splash screen | Static We.PLM logo, no animation. | Static Atlas Copco logo, no animation. |

No other field on any existing data model (resources, environment overview, uptime requests, downtime announcements, feature requests themselves) changes.
