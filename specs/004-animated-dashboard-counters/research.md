# Research: Animated Dashboard Counters

## 1. Library and package identity

**Decision**: `@number-flow/react` (npm), latest published version `0.6.2` at the time of writing.

**Rationale**: The user named this exact library by URL (`number-flow.barvian.me`). Facts confirmed directly from the library's own documentation site and the npm registry (not assumed): it is "An animated number component. Dependency-free. Accessible. Customizable," its React binding is `@number-flow/react`, its peer dependencies are `react: ^18 || ^19` and `react-dom: ^18 || ^19` - both satisfied by this project's existing React 19 - and it depends internally on the dependency-free `number-flow` core package plus `esm-env`. Usage is a single component: `import NumberFlow from '@number-flow/react'`, rendered as `<NumberFlow value={123} />`, which automatically animates whenever its `value` prop changes.

**Alternatives considered**: None - the user specified this library directly rather than asking for "some animated number," so there was no library-choice decision to make (unlike `recharts` in feature 003, which was a genuine open choice presented to and decided by the user).

## 2. Relevant props for this feature's scope

**Decision**: Use only the `value` prop (e.g. `<NumberFlow value={summary.totalCount} />`), accepting every other prop's documented default - no `format`, `trend`, `transformTiming`/`spinTiming`/`opacityTiming`, `isolate`, `digits`, or `plugins` overrides.

**Rationale**: The two counts are plain integers (no currency/percentage formatting, no locale requirement - spec FR-005 explicitly says this feature doesn't change what's counted or computed, only how it's displayed), so `format`/`locales` are unnecessary. `trend` defaults to adaptive direction, which is the correct behavior for a count that can both increase (new request) and decrease (deletion) - spec's Acceptance Scenario 2 covers both directions without specifying a required direction, so the adaptive default satisfies it. `animated` defaults to `true` (required - the entire feature is the animation) and `respectMotionPreference` defaults to `true`, which directly satisfies the spec's reduced-motion edge case with zero extra code - the library handles it, not this app.

**Alternatives considered**: Explicitly setting `trend={0}` or custom `transformTiming` - rejected as unnecessary since the defaults already satisfy every functional requirement in spec.md; no requirement calls for a specific animation duration/easing (documented as an open, undisclosed default in the library's own docs - not something this spec needs to pin down).

## 3. Visual integration with existing card styling

**Decision**: Apply the existing number's Tailwind classes (`text-4xl font-bold text-slate-900 dark:text-white font-serif-headline`) directly to the `<NumberFlow>` element via its `className` prop, exactly as they were applied to the `<span>` it replaces.

**Rationale**: `NumberFlow` renders a custom element but is designed as a drop-in text replacement (confirmed via its basic usage example `<NumberFlow value={123} />` with no required wrapper or extra setup) - spec FR-004 requires the replacement to visually match the prior static number exactly, so reusing the identical className string is the direct way to satisfy that requirement without inventing new styling.

**Confidence / what still needs empirical verification**: The library's documentation did not explicitly confirm (within what could be fetched) whether font-family/font-size/color always inherit flawlessly across its internal custom-element/shadow-DOM boundary in every browser, or whether any additional CSS custom property is needed for pixel-perfect sizing. Rather than guess a specific undocumented CSS variable, this will be verified empirically during implementation exactly as this session already verifies every other visual change: live, in both light and dark mode, via Chrome DevTools MCP screenshots compared against the current static-number appearance. If a visual mismatch appears, research.md will be updated with the specific fix found (documented in tasks.md's polish phase, same pattern as 003's T026 reconciliation).

## 4. No new backend or data-model work

**Decision**: No contracts, no data-model entities for this feature - confirmed by re-reading spec.md's own Assumptions section: "No new backend behavior, data, or API changes are required."

**Rationale**: The two values being animated (`summary.totalCount`, `summary.pendingCount`) are already fully computed client-side by the existing `EnvironmentUptimeRequestDashboardStaticComponent` (feature 003's `useMemo` block) - this feature only changes the JSX that displays them.
