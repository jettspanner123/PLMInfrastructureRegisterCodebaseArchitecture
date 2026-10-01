# CLAUDE.md

This repo holds two independently-ruled projects. Before writing or editing any code inside one of them, read its full `CODING-RULES.md` first — the whole file, not a summary — and follow it.

- `PLMInfrastructureRegisterClientServiceLayerMSC/` (frontend, React/TypeScript) → read `PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md`
- `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/` (backend, .NET/C#) → read `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/CODING-RULES.md`

Each file's rules govern only its own folder.

## Conflicts and ambiguity: always ask the user

Whenever a rule in either file conflicts with the other file, with general best practice, or with anything else — or a situation isn't clearly covered by either file — stop and ask the user which way to go. This is the standing resolution mechanism, and it overrides any automatic precedence or assumption-tolerance language written inside either `CODING-RULES.md` itself (including the backend file's own Rule Precedence and Agent Assumption Policy sections). Those sections do not get to resolve anything on their own here; the user decides every time.
