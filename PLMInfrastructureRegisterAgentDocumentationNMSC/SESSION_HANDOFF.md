# Session Handoff — InfraGrid / PLM Infrastructure Register

**Written:** 2026-11-05
**Repo root:** `C:\Users\UddeshyaSingh\Development\PLMInfrastructureRegisterCodebaseArchitecture`
**Last commit pushed this session:** `7f76606` (origin/main, up to date)

## Why this handoff exists — read this first

The user told me in this session: **they are about to make a copy of this entire application and turn it into a customized version for their own company** — custom frontend/branding and likely other changes, built on top of this codebase as the starting point. This is the reason they just reorganized root-level docs into a dedicated folder (see below) — they're tidying the repo in preparation for that fork/copy. **Do not assume this customization work has started yet** — as of this handoff, nothing in this repo reflects company-specific branding or a fork; this is purely advance notice so a future session isn't caught off guard when the user says "ok let's start customizing this for my company" or similar. When that happens, don't assume scope — ask what "customized" means concretely (new name? new color scheme/logo? stripped-down feature set? new deployment target? a literal new git remote/repo?).

## What happened this session

1. Two small UI fixes on the Environment Overview page (user's own request, explicitly flagged as "a hotfix"):
   - Add Environment button now renders at `size="md"` so its height (`h-9`) matches its sibling toolbar controls (search box, Mode toggle), which were previously taller than it.
   - The Action Items / Updates column's scrollable cell area changed from one fixed `max-h-40` (160px) for both states to `max-h-56` (224px) collapsed / `max-h-[28rem]` (448px, exactly double) expanded — so the "See All" button is visible without scrolling in the common case, and the cell visibly grows on expand.
   - Both in `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentOverview/EnvironmentOverviewScreenController.tsx`. Typecheck clean, GitNexus `detect_changes` clean (no HIGH/CRITICAL/UNKNOWN risk).
2. The user had manually moved `CONTEXT.md` and `HANDOUT.md` out of the repo root into the existing `PLMInfrastructureRegisterAgentDocumentationNMSC/` folder (which already held `KNOWLEDGE_BASE/`, `PRD/`, `TODO/`, CSVs, and a couple of guide docs). I verified the moved files were byte-identical to their prior root versions, then staged/committed them as a git rename.
3. Committed as **3 separate commits** (user explicitly asked for many small commits, and explicitly asked me NOT to add myself as a co-author — so none of these commits carry a `Co-Authored-By` trailer, unlike every earlier commit in this repo's history):
   - `2de11e1` — Moved: CONTEXT.md and HANDOUT.md from repo root into PLMInfrastructureRegisterAgentDocumentationNMSC
   - `6fa3138` — Fixed: Action Items column now sized to show See All without scrolling, doubles on expand
   - `7f76606` — Fixed: Add Environment button height to match sibling toolbar controls
4. Pushed to `origin/main`. GitNexus re-index (`node .gitnexus/run.cjs analyze --index-only`) was kicked off in the background after the push — if a new session starts and the index still shows stale, re-run it before trusting `impact`/`detect_changes` results.

**Important note for commit style going forward:** this session's "no Co-Authored-By" instruction was for *this session's* commits specifically. Don't assume it's a permanent repo-wide policy unless the user repeats it — ask if unsure before your first commit in a new session.

## Stale context you may see re-injected — ignore unless the user raises it

A plan file exists at `~/.claude/plans/gentle-singing-newt.md` titled "Environment Overview: Optional Notes on Current Uptime Schedule." **This plan is already fully implemented** — confirmed via grep: `UptimeScheduleNote`/`UptimeScheduleNoteSummary` exist end-to-end (migration `20261017165127_AddEnvironmentOverviewUptimeScheduleNote`, DTOs, `EnvironmentOverviewService.UpdateUptimeScheduleAsynchronous` with its own Groq-based summarization, frontend modal + cell rendering). If this plan file gets surfaced again by the harness in a future session, treat it as **done/stale**, not as pending work — don't re-implement it or ask the user about it unprompted.

## Standing conventions already documented in the repo — don't duplicate, just follow

- `CLAUDE.md` (repo root) — points to each project's own `CODING-RULES.md` (frontend vs backend), and establishes GitNexus as mandatory for impact analysis and pre-commit change detection. Read it, and the two `CODING-RULES.md` files, before editing either project.
- `PLMInfrastructureRegisterAgentDocumentationNMSC/CONTEXT.md` — the domain glossary (Resource, Sync, Resource Status, Dynamic/Manual Field). Keep using this vocabulary; don't invent synonyms.
- `PLMInfrastructureRegisterAgentDocumentationNMSC/TODO/` — five standing TODOs (admin-gated row deletion/edit mode, add/remove subscription, manual physical machine entry, resource identity matching key, storage account sync support). Worth a quick look if the user's customization plans touch any of these areas.
- `PLMInfrastructureRegisterAgentDocumentationNMSC/PRD/` — PRDs for features already built this project cycle (admin login, environment overview dynamic rows/columns, environment uptime requests) plus a generic `PRD_EXAMPLE.md` template.
- `PLMInfrastructureRegisterAgentDocumentationNMSC/LOCAL_DEVELOPMENT_PORTS_GUIDE.md` — frontend 4637, backend 8294 (also already known from this conversation's running context).

## Patterns established across this whole multi-session conversation (not written down anywhere in the repo — carry these forward)

- **Never commit or push without the user explicitly asking**, even after finishing verified work — report done and wait.
- Always run `tsc -b --force` (frontend) and/or `dotnet build` (backend) before committing.
- Always run GitNexus `detect_changes` (staged or all) before committing; treat HIGH/CRITICAL/UNKNOWN risk as a stop-and-investigate signal, not noise.
- When asked for "as many commits as possible," split by logical concern even within a single file/session (this session split one file's two unrelated fixes into two commits by temporarily reverting one hunk, committing, then restoring it — there's no interactive `git add -p` available, so this revert-commit-restore pattern is the reliable way to split hunks within one file).
- Never stage the untracked `.agents/` directory.
- Ponytail mode (full) has been active and requested to stay active across sessions: smallest complete diff, reuse existing patterns/components, no speculative abstraction, end replies noting what was skipped and any risk.

## Suggested skills for the next session

- **`domain-modeling`** — load this proactively once the "customize for my company" work actually starts; forking/rebranding is exactly when glossary terms tend to drift (e.g. if the user renames "Resource" to something company-specific) and `CONTEXT.md` should be updated inline as that happens.
- **`grilling`** (or `/grill-me`) — when the user's customization request is still vague ("make the frontend ours"), use this to interview them down to concrete decisions (branding assets, color tokens, whether this becomes a literal separate git remote/repo vs. a branch, which features to strip) rather than guessing.
- **`gitnexus-refactoring`** (project skill, `.claude/skills/gitnexus-refactoring/SKILL.md`) — if the fork involves renaming symbols/branding strings broadly (e.g. "PLM Infrastructure Register" → company name across the codebase), use GitNexus's `rename` rather than find-and-replace, per this repo's own `CLAUDE.md` mandate.
- **`neon-postgres`** (project skill) — relevant the moment the fork needs its own database (separate Neon project/branch) rather than sharing the current one (`jolly-dream-38233882`).
