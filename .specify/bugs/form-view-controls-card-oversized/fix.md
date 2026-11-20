# Bug Fix: Submitted Requests control card oversized in Form view

- **Slug**: form-view-controls-card-oversized
- **Fixed**: 2026-11-20
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Made the `h-full` class on both `controlsBlock` and `listBodyBlock` in `EnvironmentUptimeRequestListFeedStaticComponent.tsx` conditional on `layout === 'split'` (Dashboard view only), instead of unconditional. Form view's control card now sizes to its own content again instead of inflating with a large blank gap; Dashboard view's height-matching (the feature this fixed `h-full` was originally added for) is unaffected.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestListFeedStaticComponent.tsx` | modified | `controlsBlock`'s wrapper class is now a template literal that only appends `h-full` when `layout === 'split'`; `listBodyBlock`'s wrapper now uses `h-full` in `'split'` mode and reverts to the original `flex-1` in `'stacked'` mode (exactly matching its pre-regression behavior). |

## Diff Highlights

```tsx
// controlsBlock - before
<div className="bg-white dark:bg-[#171717] p-4 rounded-xl border border-slate-300/70 dark:border-zinc-800/80 shadow-xs flex flex-col gap-3 h-full">

// controlsBlock - after
<div className={`bg-white dark:bg-[#171717] p-4 rounded-xl border border-slate-300/70 dark:border-zinc-800/80 shadow-xs flex flex-col gap-3${layout === 'split' ? ' h-full' : ''}`}>
```

```tsx
// listBodyBlock - before
<div className="h-full overflow-y-auto pr-1 flex flex-col gap-3.5">

// listBodyBlock - after
<div className={`overflow-y-auto pr-1 flex flex-col gap-3.5 ${layout === 'split' ? 'h-full' : 'flex-1'}`}>
```

## Tests Added or Updated

None — this repo has no test framework (confirmed in prior features' `tasks.md` prerequisites). Verified manually instead (see below).

## Local Verification

- Commands run: `npx tsc -b --force` → clean, no errors.
- Manual checks (live, via Chrome DevTools MCP against the running dev server):
  - **Form view**: control card now renders at its normal compact height, flush against the first request card below it - no blank gap. Screenshot-confirmed.
  - **Dashboard view**: re-measured the row-1 grid cells via `getBoundingClientRect()` after the fix - `cardsRowHeight` and `controlsRowHeight` both measured exactly `153.909...px`, confirming the height-match feature (the reason `h-full` was added in the first place) is still intact in split mode.
  - No new console errors in either view (only the same pre-existing, unrelated accessibility lint notices seen throughout this feature's development).

## Deviations from Assessment

None. The assessment's preferred remediation (conditional `h-full` based on `layout`) was applied exactly as proposed, and its flagged risk (the sibling `listBodyBlock` carrying the same unconditional `h-full`) was confirmed to need the identical fix and was addressed in the same change.

## Follow-ups

- None required. The underlying lesson (a shared JSX variable used by two layout modes needs its per-mode-only styling made explicitly conditional, not baked in unconditionally) was addressed at both call sites in this one file; no other components in this feature share JSX across layout modes the same way.
