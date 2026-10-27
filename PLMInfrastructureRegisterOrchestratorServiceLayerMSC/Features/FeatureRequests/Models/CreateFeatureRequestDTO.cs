namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Models
{
    public sealed class CreateFeatureRequestDTO
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public FeatureRequestCategoryEnum Category { get; set; }

        public FeatureRequestPriorityEnum Priority { get; set; }

        public string RequesterName { get; set; } = string.Empty;
    }
}
