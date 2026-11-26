using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Models
{
    public sealed class CalendarActivityDTO
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Environment { get; set; } = string.Empty;

        public string ResponsiblePerson { get; set; } = string.Empty;

        public string ContactEmail { get; set; } = string.Empty;

        public DateTime StartAt { get; set; }

        public DateTime EndAt { get; set; }

        // Used only by the client to derive display color/ordering
        // (data-model.md's "derived, non-persisted display state") - never
        // rendered as a field to the user.
        public DateTime CreatedAt { get; set; }
    }
}
