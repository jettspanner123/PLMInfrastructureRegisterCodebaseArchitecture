# Bug Assessment: Submitted Requests control card oversized in Form view

- **Slug**: form-view-controls-card-oversized
- **Created**: 2026-11-20
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

> Okay so the bug that I'm facing is that, when in the "Form" View, the "Submitted Request" controls card is too big, which was not the case before I asked you to make the controls card and top 2 cards the same height in the "Dashboard" view.

## Symptom

In the Uptime Requests page's **Form** view (`EnvironmentUptimeRequestListFeedStaticComponent` rendered with its default `layout="stacked"`), the "Submitted Requests" control card (title + badge, search input, status filter) now renders far taller than its content requires, leaving a large blank gap below the "All Statuses" filter before the first request card starts. Expected: the control card should be a compact block sized to its own content (title row + search input + filter dropdown + padding), exactly as it looked before the Dashboard height-matching change.

Confirmed live via Chrome DevTools MCP: the control card now spans roughly y=223 to y=588 (~365px) in Form view, versus a normal ~160px for that amount of content.

## Reproduction

1. Log in as admin, open the Uptime Requests page.
2. Click "Form" in the Dashboard/Form segmented control.
3. Observe the "Submitted Requests" card on the right: a large empty gap appears between the status filter dropdown and the first request card (or the empty-state message, if there are no requests).

## Suspected Code Paths

- `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestListFeedStaticComponent.tsx:97` — `controlsBlock`'s wrapper `div` has `h-full` in its className string: `"bg-white dark:bg-[#171717] p-4 rounded-xl border border-slate-300/70 dark:border-zinc-800/80 shadow-xs flex flex-col gap-3 h-full"`. This single JSX variable is reused verbatim by **both** the `'split'` return path (Dashboard view, where `h-full` is required so the control card fills its CSS Grid cell and matches the summary cards' height) and the `'stacked'` return path (Form view, where the parent is a plain `flex flex-col` column with no bounding height, and `h-full` was never present before this session's Dashboard height-matching work).
- `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestListFeedStaticComponent.tsx:164-175` (approx.) — the `if (layout === 'split') { ... } return (<div className="h-full flex flex-col gap-3">{controlsBlock}{listBodyBlock}</div>);` stacked-mode return simply reuses `controlsBlock`/`listBodyBlock` as-is, with no path to drop the `h-full` class for this mode.

## Root Cause Hypothesis

**High confidence.** `controlsBlock` was extracted as one shared JSX expression to support both layouts (added two tool-calls ago, in the "match the 2 cards to the control card's height" work). The `h-full` class was added so that, in `'split'` mode, the control card (a direct CSS Grid child placed at `lg:col-start-2 lg:row-start-1`) fills its grid cell's row-stretched height, matching the Dashboard's summary cards. However, the class was added directly on the shared `controlsBlock` variable rather than conditionally based on `layout`, so it also applies in `'stacked'` mode (Form view), where the immediate parent (`<div className="h-full flex flex-col gap-3">`) is an ordinary flex column with no externally-bounded height. In that context, `h-full` on a flex child requesting an explicit height, combined with the sibling `listBodyBlock` (also unconditionally given `h-full` lower in the same file) fighting over the same unresolved height, inflates the control card far beyond its natural content size - exactly the large blank gap observed.

## Proposed Remediation

**Preferred**: Make `h-full` on `controlsBlock`'s wrapper conditional on `layout === 'split'`, so Form view's control card goes back to being sized by its own content (no `h-full`) while Dashboard view keeps the grid-cell-filling behavior that was explicitly requested and verified. Concretely: build the wrapper's className with a ternary (or template literal) that only appends `h-full` when `layout === 'split'`, e.g. `` `bg-white dark:bg-[#171717] p-4 rounded-xl border border-slate-300/70 dark:border-zinc-800/80 shadow-xs flex flex-col gap-3${layout === 'split' ? ' h-full' : ''}` ``.

**Alternatives**:
- Split `controlsBlock` into two separate JSX expressions (one per layout) - more duplication for a one-class difference, not preferred.
- Wrap `controlsBlock` in an outer conditional div that only applies `h-full` in split mode, leaving the inner div's own className untouched - equivalent outcome, slightly more indirection than a conditional class string.

**Files likely to change**:
- `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestListFeedStaticComponent.tsx`

**Tests to add or update**:
- No test framework exists in this repo (confirmed in prior specs' `tasks.md` prerequisites) - verification will be manual: load Form view and confirm the control card returns to its compact, content-sized height with no blank gap; reload Dashboard view and confirm the control card still matches the summary cards' height exactly (re-run the same live height-match check used when that feature was verified: both cells measuring the same `getBoundingClientRect().height`).

## Risks & Considerations

- Low risk: the fix only changes which layout gets the `h-full` class; it doesn't touch the grid structure, the summary cards, or the downtime list, so Dashboard view's height-matching (the feature this session explicitly built and verified) should be unaffected if the conditional is written correctly.
- Must re-verify Dashboard view's height-match after the fix (not just Form view's fix), since this file's `layout === 'split'` branch also reuses `controlsBlock` - a conditional written backwards (e.g. applying `h-full` only in `'stacked'` mode) would silently break the just-finished Dashboard feature instead.
- `listBodyBlock` (the sibling block) also carries an unconditional `h-full` added in the same prior change, for the same reason (filling its grid cell / matching the downtime card's empty-state height). It was not reported as visibly broken in Form view, but is worth re-checking for the same class-of-bug once the fix for `controlsBlock` is applied, since the underlying root cause (one shared variable, two different intended height behaviors) is identical for both blocks.

## Open Questions

None - the report was specific enough, and live reproduction plus code reading gave a high-confidence root cause without needing further clarification.
