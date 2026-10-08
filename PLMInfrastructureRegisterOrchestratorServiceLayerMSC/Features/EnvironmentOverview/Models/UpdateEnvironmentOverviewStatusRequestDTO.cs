namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class UpdateEnvironmentOverviewStatusRequestDTO
    {
        public string? Status { get; set; }

        // A per-browser random id, not a real user identity - see
        // EnvironmentOverviewStatusHistoryNexus.ChangedByClientId for why.
        public string? ChangedByClientId { get; set; }
    }
}
