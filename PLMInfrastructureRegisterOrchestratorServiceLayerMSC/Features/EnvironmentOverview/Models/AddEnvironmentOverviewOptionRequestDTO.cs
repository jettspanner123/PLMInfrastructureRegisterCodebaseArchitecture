namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // Generic body for POST /EnvironmentOverview/Options/{fieldName} - the
    // route's fieldName segment already says which option list this adds
    // to, so the body only needs the new value itself.
    public sealed class AddEnvironmentOverviewOptionRequestDTO
    {
        public string? Value { get; set; }
    }
}
