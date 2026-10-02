namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models
{
    // A real Azure subscription visible to the app's Azure credentials that
    // has not already been added to the configured list — the picker's
    // source list. Read-only: fetched live from Azure, never written to.
    public sealed class AvailableAzureSubscriptionDTO
    {
        public string AzureSubscriptionId { get; set; } = string.Empty;

        public string DisplayName { get; set; } = string.Empty;
    }
}
