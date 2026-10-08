namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // The new entry's note text only - the date prefix is computed and
    // prepended server-side (DateTime.UtcNow), never trusted from the
    // client, same reasoning as ChangedAt on EnvironmentOverviewStatusHistoryNexus.
    public sealed class AddActionItemRequestDTO
    {
        public string? Note { get; set; }
    }
}
