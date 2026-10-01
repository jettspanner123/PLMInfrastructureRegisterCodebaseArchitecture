namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models
{
    // Sync only ever scans subscriptions explicitly listed here — not every
    // subscription the app's Azure credentials happen to have access to. See
    // ADD_OR_REMOVE_SUBSCRIPTION_FEATURE_TODO.md: this table is the backing
    // store that deferred add/remove-subscription UI will manage.
    public sealed class ConfiguredSubscription
    {
        public Guid Id { get; set; }

        public string AzureSubscriptionId { get; set; } = string.Empty;

        public string DisplayName { get; set; } = string.Empty;
    }
}
