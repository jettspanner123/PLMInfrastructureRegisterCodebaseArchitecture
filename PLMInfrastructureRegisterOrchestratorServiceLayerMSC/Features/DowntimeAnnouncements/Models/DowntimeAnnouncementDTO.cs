using System;
using System.Collections.Generic;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Models
{
    public sealed class DowntimeAnnouncementDTO
    {
        public Guid Id { get; set; }

        public string Heading { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime StartAt { get; set; }

        public DateTime EndAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? EndedEarlyAt { get; set; }

        public List<string> Environments { get; set; } = new List<string>();

        // Computed server-side at query time (see DowntimeAnnouncementsService),
        // not stored - saves the frontend from re-deriving the same active/
        // expired logic.
        public bool IsActive { get; set; }

        // "Active" | "EndedEarly" | "Expired" | "Scheduled" (not yet started) -
        // same computation as IsActive, just more granular for the
        // View Announcements history list. See data-model.md.
        public string Status { get; set; } = string.Empty;
    }
}
