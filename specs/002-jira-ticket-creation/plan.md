# Implementation Plan: Jira Ticket Creation for Uptime Requests

**Branch**: `002-jira-ticket-creation` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-jira-ticket-creation/spec.md`

## Summary

Every Uptime Request submission must create a Jira sub-task (under a fixed parent Epic, `PLM-226`) before the request itself is persisted. If Jira ticket creation fails for any reason, the whole submission is rejected — no Uptime Request is left behind — and full diagnostic detail about the failure is recorded in a new backend-only table, `IG_TicketCreationErrorTBL`. On success, the request is saved with the Jira ticket's key/URL attached and shown back to the requester as a clickable link. This is a create-once integration: nothing about the Uptime Request's later lifecycle (status changes, admin notes, deletion) ever touches Jira again.

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript / React 19 (frontend) — both already in use throughout this repo; no new language introduced.

**Primary Dependencies**: `IHttpClientFactory` typed client (`AddHttpClient<T>()`) for the Jira REST call — the exact same pattern `ChatAssistantService` already uses for calling Groq's API. No Jira SDK package; Jira Cloud's REST API v3 is called directly via `HttpClient` + `System.Net.Http.Json`, same as every other external call in this backend.

**Storage**: PostgreSQL (existing `ApplicationDatabaseContext`) — two new columns on the existing Uptime Request table, plus one new table for the error log.

**Testing**: None — this repo has no test framework (confirmed convention from the Downtime Banner feature); verified manually via `quickstart.md`.

**Target Platform**: Same web app (ASP.NET Core backend + Vite/React frontend) this entire repo already is.

**Project Type**: Web application (existing two-project structure: `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/` backend, `PLMInfrastructureRegisterClientServiceLayerMSC/` frontend).

**Performance Goals**: No specific target beyond "doesn't make submitting an Uptime Request feel noticeably slower than today" — one extra synchronous HTTP call to Jira per submission is the acknowledged cost of the blocking design in spec.md's User Story 2.

**Constraints**: Jira ticket creation is synchronous and blocking (spec FR-003/FR-007) — the Uptime Request submission's response time is now coupled to Jira's own response time. No retry queue, no background job.

**Scale/Scope**: One new backend service, 2 new entity columns + 1 new table + 2 migrations, 1 new exception type, small additions to 2 existing frontend components + 2 existing frontend models. No new pages, no new routes beyond the existing Uptime Request create flow.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No project constitution is defined for this repository (`.specify/memory/constitution.md` still holds only template placeholders, never filled in) — there are no ratified principles to check this plan against. No gates apply; nothing to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-jira-ticket-creation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── jira-ticket-creation.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
PLMInfrastructureRegisterOrchestratorServiceLayerMSC/        # Backend (ASP.NET Core)
├── Features/
│   ├── EnvironmentUptimeRequests/
│   │   ├── Models/
│   │   │   ├── EnvironmentUptimeRequestNexus.cs          # + RequesterEmail, JiraTicketKey, JiraTicketUrl
│   │   │   ├── EnvironmentUptimeRequestDTO.cs             # + same 3 fields
│   │   │   └── CreateEnvironmentUptimeRequestDTO.cs       # + RequesterEmail
│   │   ├── Assertion/
│   │   │   └── EnvironmentUptimeRequestsAssertion.cs      # + RequesterEmail required/format check
│   │   └── Services/
│   │       └── EnvironmentUptimeRequestsService.cs        # + calls JiraService, writes error log on failure
│   └── Jira/                                              # NEW feature folder
│       ├── Models/
│       │   ├── JiraTicketCreationResultModel.cs           # NEW - success/failure result, never throws
│       │   └── JiraTicketCreationErrorNexus.cs            # NEW - maps to IG_TicketCreationErrorTBL
│       └── Services/
│           └── JiraService.cs                             # NEW - IHttpClientFactory typed client
├── Exceptions/
│   └── ExternalServiceException.cs                        # NEW - maps to HTTP 502
├── Data/
│   └── ApplicationDatabaseContext.cs                       # + DbSet<JiraTicketCreationErrorNexus>, table mapping
├── Migrations/
│   ├── <timestamp>_AddRequesterEmailAndJiraFieldsToUptimeRequest.cs   # NEW
│   └── <timestamp>_AddTicketCreationErrorTable.cs                     # NEW
└── Program.cs                                              # + AddHttpClient<JiraService>(), new env var reads

PLMInfrastructureRegisterClientServiceLayerMSC/              # Frontend (React/TypeScript)
├── src/
│   ├── Models/
│   │   ├── EnvironmentUptimeRequestInterfaceModel.ts       # + requesterEmail, jiraTicketKey, jiraTicketUrl
│   │   └── CreateEnvironmentUptimeRequestInputInterfaceModel.ts  # + requesterEmail
│   └── Features/EnvironmentUptimeRequests/Components/
│       ├── EnvironmentUptimeRequestFormStaticComponent.tsx # + "Requester Email" input field
│       └── EnvironmentUptimeRequestCardStaticComponent.tsx # + clickable Jira ticket badge/link
```

**Structure Decision**: Everything lands inside the two projects this repo already has — no new project, no new top-level folder beyond one new backend feature slice (`Features/Jira/`) for the Jira client itself, matching this codebase's existing "one folder per feature, Models/Services/Assertion/Components subfolders" convention (see `CODING-RULES.md` in each project root). The frontend needs no new feature folder at all — it only extends the existing Uptime Request components and models.

## Complexity Tracking

*No constitution gates apply (see Constitution Check above) — nothing to justify here.*
