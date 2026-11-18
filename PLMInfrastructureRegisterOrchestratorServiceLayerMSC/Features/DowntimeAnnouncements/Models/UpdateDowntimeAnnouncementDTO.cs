using System.Collections.Generic;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Models
{
    // Identical shape to CreateDowntimeAnnouncementDTO - every field is
    // editable (FR-018), regardless of the announcement's current status.
    public sealed class UpdateDowntimeAnnouncementDTO
    {
        public string Heading { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string StartAt { get; set; } = string.Empty;

        public string EndAt { get; set; } = string.Empty;

        public List<string> Environments { get; set; } = new List<string>();
    }
}
