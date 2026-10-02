namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models
{
    public sealed class ConfiguredSubscriptionDTO
    {
        public Guid Id { get; set; }

        public string AzureSubscriptionId { get; set; } = string.Empty;

        public string DisplayName { get; set; } = string.Empty;

        // Count of Resources synced from this subscription that are not
        // already Decommissioned — drives both the list page's badge and the
        // delete-confirmation dialog's disclosed impact count.
        public int ResourceCount { get; set; }
    }
}
