namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Models
{
    // Generic body for POST /ConfigurationConstants/{fieldName} - the route's
    // fieldName segment already says which option list this adds to, so the
    // body only needs the new value itself.
    public sealed class AddConfigurationConstantOptionRequestDTO
    {
        public string? Value { get; set; }
    }
}
