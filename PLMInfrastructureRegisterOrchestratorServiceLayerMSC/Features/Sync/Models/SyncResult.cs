namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Models
{
    public sealed record SyncResult(int CreatedCount, int UpdatedCount, int DecommissionedCount);
}
