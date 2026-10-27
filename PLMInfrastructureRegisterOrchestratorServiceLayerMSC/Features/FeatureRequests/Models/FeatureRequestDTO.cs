using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Models
{
    public sealed class FeatureRequestDTO
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public FeatureRequestCategoryEnum Category { get; set; }

        public FeatureRequestPriorityEnum Priority { get; set; }

        public FeatureRequestStatusEnum Status { get; set; }

        public string RequesterName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
