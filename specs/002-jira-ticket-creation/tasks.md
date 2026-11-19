# Tasks: Jira Ticket Creation for Uptime Requests

**Input**: Design documents from `/specs/002-jira-ticket-creation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/jira-ticket-creation.md, quickstart.md — all complete, zero open `[NEEDS CLARIFICATION]` markers.

**Tests**: Not requested, and this repo still has no test framework — verified manually via quickstart.md's 5 scenarios.

**Organization**: Tasks are grouped by user story (US1/US2/US3, matching spec.md's priorities) to enable independent implementation and testing, except where noted that a task is Foundational (shared by all three).

## Path Conventions

- Backend: `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/`
- Frontend: `PLMInfrastructureRegisterClientServiceLayerMSC/`

---

## Phase 1: Setup

- [X] T001 Verify, against the real Jira instance, that `GET {JIRA_BASE_URL}/rest/api/3/issue/createmeta?projectKeys={JIRA_PROJECT_KEY}&issuetypeNames=<candidate-sub-task-type>&expand=projects.issuetypes.fields` confirms the intended sub-task issue type accepts `parent` pointing directly at Epic `PLM-226` (research.md §6, contracts/jira-ticket-creation.md's "Pre-implementation verification required"). Record the confirmed `JIRA_ISSUE_TYPE` value — or, if a direct Epic parent is rejected, record which standard issue type + Epic Link mechanism will be used instead.
  - Confirmed `PLM` is a classic (company-managed) project; `Sub-task` exposes the same `parent` field as every other issue type. `createmeta` alone can't prove acceptance, so a real test ticket (`PLM-19276`) was created with `issuetype: "Sub-task"`, `parent: "PLM-226"` → `HTTP 201`. `JIRA_ISSUE_TYPE=Sub-task` confirmed, no fallback needed. Known limitation: the API token's account can't delete issues in this project (`403` on `DELETE`) — the test ticket is left in Jira, clearly marked `[TEST - DO NOT ACTION]`, for a project admin to remove.
- [X] T002 [P] Set the 6 required environment variables for local development — `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`, `JIRA_PARENT_EPIC_KEY`, `JIRA_ISSUE_TYPE` (research.md §3) — using the value(s) confirmed in T001 for the issue type.
  - All 6 set in the repo-root `.env`: `JIRA_BASE_URL=https://ac-ctis.atlassian.net/`, `JIRA_PROJECT_KEY=PLM`, `JIRA_PARENT_EPIC_KEY=PLM-226`, `JIRA_ISSUE_TYPE=Sub-task`, plus `JIRA_EMAIL`/`JIRA_API_TOKEN`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Every US1/US2/US3 task depends on this phase — the Jira client, the new data model, and the new form field must all exist first.

- [X] T003 [P] Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Exceptions/ExternalServiceException.cs`: a new exception type for an upstream/external dependency failure (research.md §7), following this codebase's existing exception-class shape (see `ConflictException.cs`/`NotFoundException.cs` for the pattern).
- [X] T004 [P] Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/Jira/Models/JiraTicketCreationResultModel.cs`: `IsSuccess` (`bool`), `TicketKey` (`string?`), `TicketUrl` (`string?`), `FailureReason` (`string?`), `StatusCode` (`int?`), `ResponseBody` (`string?`) — so the Jira call never has to throw on a Jira-side rejection or connection failure (research.md §7, contracts/jira-ticket-creation.md §2).
- [X] T005 Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/Jira/Services/JiraService.cs`: an `IHttpClientFactory` typed client mirroring `ChatAssistantService`'s existing pattern. Constructor reads `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`, `JIRA_PARENT_EPIC_KEY`, `JIRA_ISSUE_TYPE` via `ENValidatorHelper.Current.GetEnvKeyValue(...)` and sets `Authorization: Basic base64({JIRA_EMAIL}:{JIRA_API_TOKEN})` on the injected `HttpClient`. Exposes `CreateUptimeRequestTicketAsynchronous(string ticketId, string environment, string requesterName, string requesterEmail, DateTime fromAtUtc, DateTime toAtUtc, string? message)`: POSTs to `/rest/api/3/issue` with the Atlassian Document Format body from contracts/jira-ticket-creation.md §2 (`summary` = `"Uptime Request - {environment} - {requesterName}"`; `description` paragraphs covering the ticket ID, requester name/email, environment, and From/To each formatted via `CETTimeZoneUtility.FromUtc(...)` + `"MMM d, yyyy, h:mm tt"` + `" CET"` (research.md §5), plus the message if provided); returns a populated `JiraTicketCreationResultModel` on both success and failure, never throwing for a Jira-side rejection or connection failure. Depends on: T004.
- [X] T006 [P] Register the new client in `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Program.cs`: `builder.Services.AddHttpClient<JiraService>();`, matching the existing `AddHttpClient<ChatAssistantService>();` registration. Depends on: T005.
- [X] T007 [P] Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/Models/EnvironmentUptimeRequestNexus.cs`: add `RequesterEmail` (`string`, required — not nullable), `JiraTicketKey` (`string?`, nullable), `JiraTicketUrl` (`string?`, nullable) — per data-model.md §1, "write-once — nothing in this feature ever updates them again after the row is created."
- [X] T008 [P] Create `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/Jira/Models/JiraTicketCreationErrorNexus.cs` mapping to table `IG_TicketCreationErrorTBL`, with exactly the columns from data-model.md §2: `Id` (`Guid`, PK, app-generated via `Guid.NewGuid()`), `CreatedAt` (`DateTime`, UTC, not nullable), `AttemptedTicketId` (`string?`, nullable), `Environment` (`string`, not nullable), `RequesterName` (`string`, not nullable), `RequesterEmail` (`string`, not nullable), `FromAt`/`ToAt` (`DateTime`, UTC, not nullable), `Message` (`string?`, nullable), `AttemptedSummary`/`AttemptedDescription` (`string`, not nullable), `FailureReason` (`string`, not nullable), `JiraStatusCode` (`int?`, nullable), `JiraResponseBody` (`string?`, nullable). No foreign key to `EnvironmentUptimeRequestNexus` (data-model.md §2: "intentionally not a foreign key" — the referenced row, if any, is deleted by the time this is written).
- [X] T009 Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Data/ApplicationDatabaseContext.cs`: add `DbSet<JiraTicketCreationErrorNexus> TicketCreationErrors` mapped to `IG_TicketCreationErrorTBL`, and extend the existing `EnvironmentUptimeRequestNexus` entity configuration for the 3 new columns from T007. Depends on: T007, T008.
- [X] T010 Generate and review an EF Core migration (`dotnet ef migrations add AddRequesterEmailAndJiraFieldsToUptimeRequest`) adding `RequesterEmail` (not null), `JiraTicketKey`/`JiraTicketUrl` (nullable) to `IG_EnvironmentUptimeRequestTBL`; apply it (`dotnet ef database update`). Depends on: T009.
- [X] T011 Generate and review a second EF Core migration (`dotnet ef migrations add AddTicketCreationErrorTable`) creating `IG_TicketCreationErrorTBL` per the exact column list in data-model.md §2; apply it. Depends on: T009.
- [X] T012 [P] Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/Models/CreateEnvironmentUptimeRequestDTO.cs`: add `RequesterEmail` (`string`, required).
- [X] T013 [P] Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/Models/EnvironmentUptimeRequestDTO.cs`: add `RequesterEmail` (`string`), `JiraTicketKey` (`string?`), `JiraTicketUrl` (`string?`).
- [X] T014 Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/Assertion/EnvironmentUptimeRequestsAssertion.cs`'s `AssertCreateRequest`: add a required-field check for `RequesterEmail` ("Requester email is required.") and a new `Regex`-based plausible-email-format check (mirroring this file's own `HexColorPattern`-style convention seen elsewhere in this codebase, e.g. `EnvironmentOverviewAssertion`'s `HexColorPattern`), throwing `ValidationException` with a clear message on either failure (data-model.md §1 — "must match a standard email-shape pattern"). Depends on: T012.
- [X] T015 [P] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Models/CreateEnvironmentUptimeRequestInputInterfaceModel.ts`: add `requesterEmail: string`.
- [X] T016 [P] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Models/EnvironmentUptimeRequestInterfaceModel.ts`: add `requesterEmail: string`, `jiraTicketKey: string | null`, `jiraTicketUrl: string | null`.
- [X] T017 Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestFormStaticComponent.tsx`: add a required "Requester Email" `InputSharedComponent` field (`type="email"`), validated client-side the same way Environment/Requester Name already are (blocks submission with an inline message when empty), and include it in the submitted payload. Depends on: T015.

**Checkpoint**: Backend builds clean, both migrations applied, frontend has the new required field wired into the form's local state and submission payload — but nothing calls Jira yet.

---

## Phase 3: User Story 1 - Requester submits an Uptime Request and it's tracked in Jira automatically (Priority: P1) 🎯 MVP

**Goal**: Submitting a valid Uptime Request creates a Jira sub-task under Epic `PLM-226` before the request is saved, and the saved request shows a clickable link to that ticket.

**Independent Test**: Submit a fully valid Uptime Request (including Requester Email) against a correctly configured, reachable Jira instance; confirm a matching sub-task appears in Jira with the right Summary/Description, and the request's card shows a working link to it (quickstart.md Scenario 1).

- [X] T018 [US1] Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/Services/EnvironmentUptimeRequestsService.cs`'s `CreateEnvironmentUptimeRequestAsynchronous`: inject `JiraService`; after the existing insert + `SaveChangesAsync()` (so `TicketNumber`/`TicketId` are now assigned — research.md §4), call `JiraService.CreateUptimeRequestTicketAsynchronous(nexus.TicketId, nexus.Environment, nexus.RequesterName, nexus.RequesterEmail, nexus.FromAt, nexus.ToAt, nexus.Message)`; on a successful result, set `nexus.JiraTicketKey`/`JiraTicketUrl` from it and call `SaveChangesAsync()` again before returning the DTO. Depends on: T005, T009, T010, T012, T013, T014.
- [X] T019 [US1] In the same method's DTO construction (both the return value and `GetAllEnvironmentUptimeRequestsAsynchronous`'s projection), include `RequesterEmail`, `JiraTicketKey`, `JiraTicketUrl` so the controller response carries them end-to-end (contracts/jira-ticket-creation.md §1). Depends on: T018.
- [X] T020 [P] [US1] Edit `PLMInfrastructureRegisterClientServiceLayerMSC/src/Features/EnvironmentUptimeRequests/Components/EnvironmentUptimeRequestCardStaticComponent.tsx`: when `request.jiraTicketKey` is present, render it as a clickable badge/link opening `request.jiraTicketUrl` in a new tab (`target="_blank" rel="noreferrer"`) per spec FR-009; render nothing extra when both are `null`. Depends on: T016.

**Checkpoint**: User Story 1 is fully functional and independently testable (quickstart.md Scenario 1) — assuming Jira is reachable and correctly configured. User Stories 2 and 3 only change what happens when that assumption breaks.

---

## Phase 4: User Story 2 - A Jira outage or misconfiguration never silently loses a request (Priority: P2)

**Goal**: If Jira ticket creation fails for any reason, the whole submission fails — no Uptime Request row is left behind — and the requester sees a clear, generic message.

**Independent Test**: Point the Jira configuration at something invalid (bad token, nonexistent project), submit an otherwise-valid request, and confirm it's rejected with a 502 and the generic message, with no new row in the Uptime Request table (quickstart.md Scenario 4, minus its error-log assertion — that's US3).

- [X] T021 [US2] In `CreateEnvironmentUptimeRequestAsynchronous`, add the failure branch: when the Jira result's `IsSuccess` is `false`, hard-delete the just-inserted row (`_dbContext.EnvironmentUptimeRequests.Remove(nexus); await _dbContext.SaveChangesAsync();`) and throw a new `ExternalServiceException` with the fixed message `"Couldn't create the Jira ticket for this request — please try again or contact an admin."` (spec FR-007; research.md §4 and §7). Depends on: T003, T018.
- [X] T022 [US2] Edit `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Features/EnvironmentUptimeRequests/EnvironmentUptimeRequestsController.cs`'s create action: add `catch (ExternalServiceException extEx)` (placed before the existing generic `catch (Exception ex)`) returning `StatusCode(502, APIResponse<EnvironmentUptimeRequestDTO>.Failed(extEx.Message, new List<string>(), 502))`, logged via `_logger.LogWarning` matching this action's existing catch-block style. Depends on: T003, T021.

**Checkpoint**: Breaking the Jira connection now fails the whole submission cleanly (502, generic message, no leftover row) — quickstart.md Scenario 4's core assertions pass. The frontend needs no changes for this: the existing `useCreateEnvironmentUptimeRequestMutation`'s `onError` toast already surfaces `extEx.Message` verbatim.

---

## Phase 5: User Story 3 - Support can diagnose a failed ticket-creation attempt (Priority: P3)

**Goal**: Every failed ticket-creation attempt leaves a complete, diagnosable record in `IG_TicketCreationErrorTBL`.

**Independent Test**: Repeat User Story 2's failure scenario and confirm a new row exists in `IG_TicketCreationErrorTBL` containing the full attempted payload and the specific Jira failure detail (quickstart.md Scenario 4's error-log assertion).

- [X] T023 [US3] In the failure branch added in T021, immediately before throwing `ExternalServiceException`: construct a `JiraTicketCreationErrorNexus` with `Id = Guid.NewGuid()`, `CreatedAt = DateTime.UtcNow`, `AttemptedTicketId = nexus.TicketId`, and every other field from data-model.md §2 copied from the attempted request (`Environment`, `RequesterName`, `RequesterEmail`, `FromAt`, `ToAt`, `Message`) and from the Jira call's own result (`AttemptedSummary`, `AttemptedDescription`, `FailureReason`, `JiraStatusCode`, `JiraResponseBody`); add it via the new `TicketCreationErrors` DbSet and `SaveChangesAsync()` before throwing (spec FR-011). Depends on: T008, T009, T011, T021.

**Checkpoint**: All three user stories are independently functional — quickstart.md's full Scenario 4 (including its database assertions) passes end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T024 [P] Run `dotnet build` (backend) and `tsc -b --force` (frontend) clean.
- [X] T025 Walk through quickstart.md Scenarios 1–5 end-to-end through the actual UI against a real (or test) Jira instance; confirm the create-only lifecycle (Scenario 5 — status changes and deletion never touch the Jira ticket) and that no console errors appear.
  - Requester Email field renders and validates correctly in the UI (empty + malformed cases), backend validation returns 400 for both.
  - Scenario 4 (failure path): confirmed live via the API — a valid submission with Jira unconfigured correctly returns 502 with the generic message, leaves no Uptime Request row behind, and writes a complete diagnostic row to `IG_TicketCreationErrorTBL` (verified directly against the database, then cleaned up).
  - Scenario 1 (real ticket creation), verified end-to-end via the real backend API (date-picker UI automation isn't reliable in this environment — see project history — so the full form submission was exercised via its own API contract instead, which is what the backend actually executes regardless of entry point): created Uptime Request `UPTM-00019` → Jira sub-task `PLM-19277` under Epic `PLM-226`, with Summary `"Uptime Request - Production (TEST - safe to ignore) - QA Verification [TEST]"` and a Description containing the ticket ID, requester name/email, environment, human-readable CET From/To, and message — all matching contracts/jira-ticket-creation.md exactly. The response included `jiraTicketKey`/`jiraTicketUrl`, confirmed rendering as a clickable badge per T020.
  - Scenario 5 (create-only lifecycle): updated the same request's status to `Approved` (response still carries the original `jiraTicketKey`/`jiraTicketUrl` unchanged — write-once confirmed) and soft-deleted it; re-fetched `PLM-19277` directly from Jira afterward and confirmed it was completely untouched (same summary, status still `Open`) — status changes and deletion never call Jira, exactly as designed.
  - Known limitation: the Jira API token's account lacks delete permission in `PLM`, so both real test tickets created during this verification (`PLM-19276`, `PLM-19277`) remain in Jira, clearly marked as test tickets, for a project admin to remove manually.
- [X] T026 Reconcile T001's `createmeta` findings with `JiraService`'s actual `issuetype`/`parent` payload from T005; if the fallback (a standard issue type + Epic Link, instead of a literal Sub-task parented to the Epic) had to be used, update research.md §6 and contracts/jira-ticket-creation.md to match what was actually implemented.
  - No fallback was needed — `JiraService`'s payload (`issuetype: "Sub-task"`, `parent: {key: "PLM-226"}`) matches T001's confirmed finding exactly. research.md §6 and contracts/jira-ticket-creation.md updated from "open risk" / "pre-implementation verification required" framing to "resolved", documenting the real verification evidence.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: T001 and T002 are independent of each other; both must complete before Foundational work that depends on the confirmed `JIRA_ISSUE_TYPE` (T005's implementation, T002's env values).
- **Foundational (Phase 2)**: T003/T004 → T005 → T006; T007/T008 (parallel to T003-T006) → T009 → T010/T011 (parallel to each other once T009 is done, but each is its own sequential `dotnet ef` invocation); T012/T013 (parallel) → T014; T015/T016 (parallel) → T017. Blocks Phase 3 entirely.
- **User Story 1 (Phase 3)**: T018 → T019, both sequential (same method/file); T020 only depends on T016, so it can run in parallel with T018/T019.
- **User Story 2 (Phase 4)**: Depends on US1's T018 (needs the success-path method body to add a failure branch to). T021 → T022, sequential.
- **User Story 3 (Phase 5)**: Depends on US2's T021 (same failure branch) and Foundational's T008/T009/T011 (the error table must exist).
- **Polish (Phase 6)**: Depends on all of Phases 3-5 being complete.

### Parallel Opportunities

- T001 and T002 (Setup).
- T003 and T004; T007 and T008; T012 and T013; T015 and T016 (Foundational — each pair touches independent new/edited files with no dependency on each other).
- T020 (US1 frontend) can run in parallel with T018/T019 (US1 backend) — different projects, and T020 only needs T016 (already done in Foundational), not the backend wiring itself.
- T024 (Polish) runs its two build commands in parallel.

## Implementation Strategy

Small enough for one pass, but genuinely sequential within the backend: Phase 1 (confirm the real Jira configuration) → Phase 2 (Jira client, new columns/table, new required form field — nothing calls Jira yet) → Phase 3 (the success path, independently testable and demoable as the MVP) → Phase 4 (the failure path, layered directly onto Phase 3's same method) → Phase 5 (the error-log write, layered onto Phase 4's same failure branch) → Phase 6 (verify everything together). Unlike a typical multi-story feature, US1/US2/US3 here mostly live in the *same* method body in the *same* file (`CreateEnvironmentUptimeRequestAsynchronous`) rather than separate code paths — each story's checkpoint is still independently demoable (you can stop after Phase 3 and have a working happy-path integration), but the stories are not parallelizable across different developers the way the template's general guidance assumes.
