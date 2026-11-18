# Implementation Plan: Downtime Banner

**Branch**: `001-downtime-banner` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-downtime-banner/spec.md`

## Summary

Admins create a "Downtime Announcement" (heading, description, start/end time, affected environments) from a new action in the profile panel, via a widened two-column form (Heading/Description on the left, Start/End/Environments on the right). The most recently created active announcement is shown as a red/white banner with a warning icon directly below the Uptime Request page's header, to every user. It expires automatically at its end time, or an admin can end it early. Persisted server-side entirely within its own `IG_DowntimeAnnouncementTBL` table — including its environment list as a single comma-separated column, not a separate table — behind its own dedicated controller/service, consistent with every other feature in this codebase. Creating and ending an announcement additionally introduces this backend's first real server-side admin authorization check (see research.md) — the user explicitly chose this over the existing client-side-only convention, since the spec's FR-002/SC-003 require it to actually hold.

**Revision note**: This plan reflects the third iteration. Iteration 1 (implemented) built create/show/end-early with a join-table environment model and a single-column form. Iteration 2 (implemented) collapsed environments into one column and widened the form to two columns. Iteration 3 (this plan) adds a "View Announcements" admin history list — list-all, edit (every field, any status), and soft-delete — plus restructuring the profile panel's single button into a "Downtime Announcement" section header with two 50:50 buttons ("Create Announcement" / "View Announcements"), per spec.md User Story 4.

## Technical Context

**Language/Version**: C# / .NET 10 (backend, `net10.0`); TypeScript 6.0 / React 19.2 (frontend)

**Primary Dependencies**:
- Backend: ASP.NET Core 10 (Minimal hosting model), EF Core 10 (`Microsoft.EntityFrameworkCore.Design` 10.0.12) + `Npgsql.EntityFrameworkCore.PostgreSQL` 10.0.3, `System.IdentityModel.Tokens.Jwt` 8.23.0 (already referenced, used only to *issue* tokens today)
- Frontend: Vite 8, TanStack Query 5 + TanStack Router 1, Tailwind 4, `motion` (Framer Motion) 12, `lucide-react` icons, `sonner` toasts

**Storage**: Neon Postgres (pooled connection via `DATABASE_URL`), accessed through `ApplicationDatabaseContext` (EF Core). One table: `IG_DowntimeAnnouncementTBL` (see data-model.md) — the `IG_DowntimeAnnouncementEnvironmentTBL` join table from the first iteration is dropped by a new migration.

**Testing**: None configured in this repository today (no `*Test*.csproj`, no Vitest/Jest in `package.json`). This feature does not introduce a test framework; verification is manual, per `quickstart.md`.

**Target Platform**: Backend deployed on Render (Linux container); frontend deployed on Vercel. Local dev: backend on `dotnet run`, frontend on Vite dev server (`localhost:4637`).

**Project Type**: Web application — two independent projects in one repo (`PLMInfrastructureRegisterClientServiceLayerMSC` frontend, `PLMInfrastructureRegisterOrchestratorServiceLayerMSC` backend) sharing one Neon database, per the repo's own `CLAUDE.md`.

**Performance Goals**: No specific target beyond this app's existing ordinary web request/response latency; this feature's data volume (a handful of announcements at a time) is trivial relative to existing features (e.g. Resources).

**Constraints**: Must follow this codebase's existing per-feature conventions exactly (`Features/<Name>/{Models,Services,Assertion}` + `<Name>Controller.cs` on the backend; `src/Features/<Name>/{Components,Services,Constants}` on the frontend) — confirmed by reading the closest existing analog, Environment Uptime Requests, end-to-end.

**Scale/Scope**: 6 backend endpoints total (create, get-active, end-early unchanged from earlier iterations; **+3 new**: list-all, edit, soft-delete) + 1 DB table (2 new nullable/boolean columns added: `IsDeleted`, `DeletedAt`); 1 frontend modal form (reused for create *and* edit via an `editingAnnouncement` prop), **+1 new** history-list modal, 1 banner component (unchanged), profile panel's 1 button replaced by a section header with 2 buttons, all 5 admin-only endpoints sharing the JWT-bearer check added in iteration 1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled starter template (`[PROJECT_NAME] Constitution` with bracketed placeholders) — no actual principles are recorded yet for this project. There is nothing to check against. **PASS (no gates defined).**

*Post-Phase 1 re-check*: Unchanged — the constitution still has no recorded principles after Phase 0/1 design (research.md, data-model.md, contracts/, quickstart.md). **PASS.**

## Project Structure

### Documentation (this feature)

```text
specs/001-downtime-banner/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── downtime-announcements-api.md
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

This repo is an existing two-project web application (not a greenfield choice) — the structure below is the real, existing layout this feature slots into, confirmed against the closest analog feature (Environment Uptime Requests) end-to-end.

```text
PLMInfrastructureRegisterOrchestratorServiceLayerMSC/   # backend (.NET 10)
├── Features/
│   └── DowntimeAnnouncements/                          # NEW — mirrors Features/EnvironmentUptimeRequests/
│       ├── Models/
│       │   ├── DowntimeAnnouncementNexus.cs            # + IsDeleted (bool), DeletedAt (DateTime?)
│       │   ├── CreateDowntimeAnnouncementDTO.cs
│       │   ├── UpdateDowntimeAnnouncementDTO.cs         # NEW - identical shape to Create
│       │   └── DowntimeAnnouncementDTO.cs               # + Status (string)
│       ├── Assertion/
│       │   └── DowntimeAnnouncementsAssertion.cs        # + AssertUpdateRequest (reuses AssertCreateRequest's rules)
│       ├── Services/
│       │   └── DowntimeAnnouncementsService.cs          # + GetAllDowntimeAnnouncementsAsynchronous, UpdateDowntimeAnnouncementAsynchronous, DeleteDowntimeAnnouncementAsynchronous; MapToDTO computes Status
│       └── DowntimeAnnouncementsController.cs           # + GET (list), PUT {id} (edit), DELETE {id} (soft-delete), all [Authorize(Policy = "RequireAdmin")]
├── Data/ApplicationDatabaseContext.cs                  # add HasQueryFilter(a => !a.IsDeleted) to the existing entity config
├── Factories/ApplicationRouteFactory.cs                # + GetAllDowntimeAnnouncement ("", GET), UpdateDowntimeAnnouncement ("{id}", PUT), DeleteDowntimeAnnouncement ("{id}", DELETE)
├── Migrations/                                         # new EF Core migration: add IsDeleted, DeletedAt columns
└── Program.cs                                          # unchanged (JWT-bearer auth + RequireAdmin policy already added in iteration 1)

PLMInfrastructureRegisterClientServiceLayerMSC/          # frontend (React/TS)
├── src/Features/DowntimeAnnouncements/                 # existing feature folder
│   ├── Components/
│   │   ├── DowntimeAnnouncementFormModalController.tsx # + optional `editingAnnouncement` prop: pre-fills fields, title becomes "Edit Downtime Announcement", submits to the update mutation instead of create (research.md §10)
│   │   ├── DowntimeAnnouncementBannerSharedComponent.tsx  # unchanged
│   │   └── DowntimeAnnouncementHistoryModalController.tsx  # NEW - lists every announcement (GetAll), shows Status, Edit (opens the form above pre-filled) and Delete (confirmation + soft-delete mutation) per row
│   └── Services/DowntimeAnnouncementsService.ts        # + getAllDowntimeAnnouncements, updateDowntimeAnnouncement, deleteDowntimeAnnouncement (all 3 send the admin Authorization header)
├── src/Models/
│   ├── DowntimeAnnouncementInterfaceModel.ts            # + status: string
│   ├── CreateDowntimeAnnouncementInputInterfaceModel.ts
│   └── UpdateDowntimeAnnouncementInputInterfaceModel.ts  # NEW - identical shape to Create
├── src/Services/TanstackQueryClientService.ts           # + useAllDowntimeAnnouncementsQuery, useUpdateDowntimeAnnouncementMutation, useDeleteDowntimeAnnouncementMutation
├── src/Shared/Components/ProfileSettingsSharedComponent.tsx  # single "Create Downtime Announcement" button replaced by a "Downtime Announcement" section header + 2 buttons (50:50 width): "Create Announcement" / "View Announcements"
└── src/Features/EnvironmentUptimeRequests/EnvironmentUptimeRequestsScreenController.tsx  # unchanged (banner mount from iteration 1)
```

**Structure Decision**: New `DowntimeAnnouncements` feature folder on both sides, following the existing per-feature convention exactly (confirmed against `EnvironmentUptimeRequests` as the closest analog) — no new architectural pattern introduced except the JWT authorization check below, which is additive (configured once in `Program.cs`, applied only to this feature's two admin-only endpoints) and does not change how any existing endpoint behaves.

## Complexity Tracking

> Required because `Program.cs` currently has no authentication/authorization middleware at all (confirmed: no `AddAuthentication`, `AddJwtBearer`, or `[Authorize]` anywhere in the backend) — this feature adds the first one.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Adding JWT-bearer authentication middleware + an authorization policy, where none exists today | The spec's FR-002/SC-003 require that non-admins truly cannot create or end an announcement — not just that the button is hidden. The JWT this app already issues on admin login carries exactly the claim needed (`role: "Admin"`); it's just never been checked. | Reusing the existing client-side-only convention (hide the button, trust the caller) was the simpler option and was explicitly offered to, and rejected by, the user — it would leave the create/end endpoints callable by anyone who can reach the API directly, contradicting the spec's own stated requirement. |
