# Render's docker build context is set to this folder itself (matching the
# proven working pattern AssetsphereAppCodebaseArchitecture already uses on
# the same account/monorepo shape), so every COPY path below is relative to
# this backend project, not the repo root.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore ./PLMInfrastructureRegisterOrchestratorServiceLayerMSC.csproj

COPY . .
RUN dotnet publish ./PLMInfrastructureRegisterOrchestratorServiceLayerMSC.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Purely documentation - Render assigns the real port via its own PORT env
# var at container start, which Program.cs reads directly (see
# renderAssignedPort); nothing here needs to match that value.
EXPOSE 8080

ENTRYPOINT ["dotnet", "PLMInfrastructureRegisterOrchestratorServiceLayerMSC.dll"]
