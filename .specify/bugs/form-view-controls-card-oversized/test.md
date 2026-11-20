# Bug Verification: Submitted Requests control card oversized in Form view

- **Slug**: form-view-controls-card-oversized
- **Tested**: 2026-11-20
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original symptom (a large blank gap in the "Submitted Requests" control card when viewing Form view) no longer reproduces. The control card renders at its normal compact height, flush against the first request card. Dashboard view's row-1 height-match (the feature the regression-causing `h-full` was originally added for) was re-measured and remains exactly intact.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) — Form view | Loaded page, clicked "Form", screenshotted full page | pass | Control card ends flush against the first request card; no blank gap. Visually matches pre-regression appearance. |
| Regression check — Dashboard view | Loaded page (lands on Dashboard by default), measured `lg:col-start-1/row-start-1` vs `lg:col-start-2/row-start-1` via `getBoundingClientRect()` | pass | Both measured `154.5738525390625px` — identical, confirming the height-match feature this fix's `h-full` conditional preserves is unaffected. |
| Type-check | `npx tsc -b --force` (frontend project) | pass | Exit code 0, no output. |
| Console errors | `list_console_messages` on both views | pass | Only pre-existing, unrelated accessibility lint notices ("No label associated with a form field", "A form field element should have an id or name attribute") — same ones present throughout this feature's development, not introduced by this fix. |
| New / updated automated tests | n/a | not-run | This repo has no test framework configured (confirmed in this feature's own `tasks.md` prerequisites); no automated test suite exists to run. |

## Output Excerpts

```
npx tsc -b --force
(no output, exit code 0)
```

```json
// Dashboard view, post-fix
{"cardsRowHeight":154.5738525390625,"controlsRowHeight":154.5738525390625}
```

## Residual Risks

- Verification was performed against the live dev server with exactly one real Uptime Request in the system and no active/scheduled Downtime Announcements. The empty-state height-match scenario (both Dashboard's downtime card and the request list empty at once) was separately verified earlier in this session (before this specific regression existed) but not re-confirmed in this verification pass — low risk, since the fix only changes which layout mode gets `h-full`, not the empty-state markup itself.
- No automated regression suite exists in this repo, so this verification relies entirely on live manual/DevTools-driven checks rather than a repeatable test run.

## Recommendation

Close the bug — verified end-to-end. The Form view regression is resolved, the type-check is clean, and the Dashboard height-matching feature this fix was careful not to break was re-measured and confirmed intact.
