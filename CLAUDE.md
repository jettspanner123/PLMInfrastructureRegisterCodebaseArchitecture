# CLAUDE.md

This repo holds two independently-ruled projects. Before writing or editing any code inside one of them, read its full `CODING-RULES.md` first — the whole file, not a summary — and follow it.

- `PLMInfrastructureRegisterClientServiceLayerMSC/` (frontend, React/TypeScript) → read `PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md`
- `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/` (backend, .NET/C#) → read `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/CODING-RULES.md`

Each file's rules govern only its own folder.

## Conflicts and ambiguity: always ask the user

Whenever a rule in either file conflicts with the other file, with general best practice, or with anything else — or a situation isn't clearly covered by either file — stop and ask the user which way to go. This is the standing resolution mechanism, and it overrides any automatic precedence or assumption-tolerance language written inside either `CODING-RULES.md` itself (including the backend file's own Rule Precedence and Agent Assumption Policy sections). Those sections do not get to resolve anything on their own here; the user decides every time.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **PLMInfrastructureRegisterCodebaseArchitecture** (1160 symbols, 1892 relationships, 51 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/PLMInfrastructureRegisterCodebaseArchitecture/context` | Codebase overview, check index freshness |
| `gitnexus://repo/PLMInfrastructureRegisterCodebaseArchitecture/clusters` | All functional areas |
| `gitnexus://repo/PLMInfrastructureRegisterCodebaseArchitecture/processes` | All execution flows |
| `gitnexus://repo/PLMInfrastructureRegisterCodebaseArchitecture/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
