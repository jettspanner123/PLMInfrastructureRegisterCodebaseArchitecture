using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models
{
    public sealed class EnvironmentUptimeRequestDTO
    {
        public Guid Id { get; set; }

        public int TicketNumber { get; set; }

        public string TicketId { get; set; } = string.Empty;

        public string Environment { get; set; } = string.Empty;

        public string RequesterName { get; set; } = string.Empty;

        public DateTime FromAt { get; set; }

        public DateTime ToAt { get; set; }

        public string? Message { get; set; }

        public EnvironmentUptimeRequestStatusEnum Status { get; set; }

        public string? AdminMessage { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
