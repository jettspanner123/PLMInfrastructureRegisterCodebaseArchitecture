namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    public sealed class AddLegendEntryRequestDTO
    {
        public string? Name { get; set; }

        public string? Format { get; set; }

        public string? Color { get; set; }

        public string? CreatedByClientId { get; set; }
    }
}
