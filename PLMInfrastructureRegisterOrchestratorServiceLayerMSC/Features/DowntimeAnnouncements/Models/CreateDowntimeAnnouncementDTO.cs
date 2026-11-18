using System.Collections.Generic;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Models
{
    public sealed class CreateDowntimeAnnouncementDTO
    {
        public string Heading { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        // Naive "YYYY-MM-DDTHH:mm" from a <input type="datetime-local"> field,
        // same shape as CreateEnvironmentUptimeRequestDTO.FromAt/ToAt.
        public string StartAt { get; set; } = string.Empty;

        public string EndAt { get; set; } = string.Empty;

        public List<string> Environments { get; set; } = new List<string>();
    }
}
