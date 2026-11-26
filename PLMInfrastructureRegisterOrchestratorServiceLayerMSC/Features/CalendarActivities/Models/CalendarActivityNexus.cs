using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Models
{
    public sealed class CalendarActivityNexus
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Environment { get; set; } = string.Empty;

        public string ResponsiblePerson { get; set; } = string.Empty;

        public string ContactEmail { get; set; } = string.Empty;

        public DateTime StartAt { get; set; }

        public DateTime EndAt { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
