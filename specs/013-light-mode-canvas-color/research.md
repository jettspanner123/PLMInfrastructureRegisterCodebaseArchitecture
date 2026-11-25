# Research: Adopt ObservaCore's Light Mode Canvas Color

No `[NEEDS CLARIFICATION]` markers remain — the spec's own Research Findings section already resolved every open question by reading ObservaCore's (the Monitoring Dashboard repository's) actual commit history. This phase records how that conclusion was reached and confirms there is nothing left to decide.

## 1. What ObservaCore actually kept: one variable, not a full repaint

**Decision**: Change only `--color-canvas` in this application's `index.css` `:root` block, from `#ffffff` to `#f2f2f2`. No other variable changes.

**Rationale**: `git log` on `MonitoringDashboardCodebaseArchitecture`'s `MonitoringDashboardClientServiceLayerMSC/src/index.css` shows this exact progression (oldest → newest):

1. `937bd13` — Canvas → `#F5F5F5`, card background → `#EAEAEA`, plus the nav header and four other components hardcoded to match.
2. `08bcc8e` — "3-Tier Elevation": canvas → `#e0e0e0`, card stays `#eaeaea`, a third "inner surface" tier added at `#f5f5f5` across 11 component files.
3. `4c590a5` — **Reverted**: "Both light-mode color experiments... looked worse in practice - back to the original white canvas and white cards." All 13 touched files (including `index.css`) reverted to their pre-experiment state.
4. `9aa05f6` → `2197318` → `939e2ad` — A third, much smaller attempt: **only** `index.css`'s `--color-canvas` changes, through `#f0f0f0` → `#f5f5f5` → `#f2f2f2`, the last commit message explicitly marked "(final)". No component files touched in any of these three commits.

A direct read of ObservaCore's current `index.css` confirms state (4) is what shipped: `--color-canvas: #f2f2f2`, with `--color-surface-card`, `--color-surface-elevated`, `--color-surface-deep`, and every text/border tone exactly matching this application's own existing values. A full-source grep for `#eaeaea`, `#e0e0e0`, and `#f5f5f5` across ObservaCore's frontend returns zero matches, confirming the two reverted experiments left no trace.

**Alternatives considered**:
- *Reproducing the "3-tier elevation" experiment* (`08bcc8e`) — rejected: ObservaCore's own authors explicitly reverted this, calling it worse in practice; adopting a discarded experiment would contradict the user's own stated goal of adopting what ObservaCore's light mode "already is" today.
- *Also changing card/surface colors to some new value* — rejected: there is no such change in ObservaCore's final state to adopt; every surface color already matches between the two applications.

## 2. Confirming parity of every other light-mode variable before changing anything

**Decision**: No change needed to `--color-surface-card`, `--color-surface-elevated`, `--color-surface-deep`, `--color-hairline`, `--color-hairline-strong`, `--color-ink`, `--color-body`, `--color-charcoal`, `--color-mute`, `--color-ash`, or `--color-stone`.

**Rationale**: A direct side-by-side read of both applications' `index.css` `:root` blocks shows every one of these values is already identical, character-for-character, between this application and ObservaCore. The only difference anywhere in the `:root`/`.dark` blocks is the single `--color-canvas` line. This is expected — both applications share the same original design foundation — and confirms the feature's entire scope really is one value.

**Alternatives considered**: None — there was nothing to decide once the direct comparison confirmed parity.

## 3. Dark mode is out of scope

**Decision**: The `.dark` block is not touched.

**Rationale**: Every one of ObservaCore's light-mode color commits (including the two reverted experiments) explicitly left dark mode untouched, per their own commit messages ("dark mode untouched in both" / "dark mode's existing `#171717` card color... untouched"). This application's spec (FR-003) states the same constraint directly from the user's own request, which only ever mentioned light mode.

**Alternatives considered**: None — out of scope by the user's own request and by ObservaCore's own precedent.
