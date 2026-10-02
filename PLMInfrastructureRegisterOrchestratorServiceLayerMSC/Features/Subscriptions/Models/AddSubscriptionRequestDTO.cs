namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models
{
    public sealed class AddSubscriptionRequestDTO
    {
        // The DisplayName is deliberately not accepted from the client — the
        // service re-fetches it from Azure itself, so the stored name always
        // matches the real subscription and a client can't add an arbitrary
        // (non-Azure) subscription ID by calling this endpoint directly.
        public string? AzureSubscriptionId { get; set; }
    }
}
