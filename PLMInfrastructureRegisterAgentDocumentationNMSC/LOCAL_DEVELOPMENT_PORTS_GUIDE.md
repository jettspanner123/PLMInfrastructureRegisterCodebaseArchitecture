# Local Development Ports

InfraGrid's frontend and backend run on non-default local ports:

| Service | Port | Configured in |
| --- | --- | --- |
| Frontend (`npm run dev` / Vite) | **4637** | `PLMInfrastructureRegisterClientServiceLayerMSC/vite.config.ts` (`server.port`) |
| Backend (`dotnet run`) | **8294** | `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Properties/launchSettings.json` (`http` profile's `applicationUrl`) |

## Why these specific, non-default numbers

Vite's own default (5173) and this backend's original default (5114) collided with another, unrelated project on this machine that also happens to default to those same ports. Both services were moved to these fixed ports so the two projects can run side by side without one of them silently landing on a fallback port (Vite's own behavior otherwise, e.g. 5173 → 5174) and causing confusion about which app is actually being tested.

## What had to stay in sync

Changing either port means two other places have to match it, or the app breaks silently (CORS rejection, or the frontend calling the wrong backend):

- **CORS allowed origin** — `PLMInfrastructureRegisterOrchestratorServiceLayerMSC/Program.cs` hardcodes the local frontend origin (`http://localhost:4637`) into `allowedFrontendOrigins`. This must match the frontend's actual port.
- **Frontend's API base URL fallback** — `PLMInfrastructureRegisterClientServiceLayerMSC/src/Constants/ApplicationNetworkAPIConfiguration.ts` hardcodes `http://localhost:8294` as the fallback used when no `VITE_API_BASE_URL` env var is set (no `.env` file exists in this project, so this fallback is the effective value). This must match the backend's actual port.

## `strictPort: true`

`vite.config.ts`'s `server` block sets `strictPort: true`, so Vite fails loudly if 4637 is ever already taken instead of silently falling back to 4638+. This is deliberate — a silent fallback is exactly what caused the original port collision confusion this change exists to prevent.

## This has nothing to do with the deployed (Render) backend port

`Program.cs` reads the `PORT` environment variable, which Render assigns dynamically at container start and which is never set locally. `launchSettings.json`'s `applicationUrl` only governs `dotnet run` on a local machine — it has no effect on the deployed environment. The backend's `https` launch profile (previously `https://localhost:7282`) was removed entirely rather than renumbered, since nothing in this project's Dockerfile, deployment, or everyday `dotnet run` usage used it.
