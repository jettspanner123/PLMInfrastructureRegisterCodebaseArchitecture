using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Models
{
    public sealed class DowntimeAnnouncementNexus
    {
        public Guid Id { get; set; }

        public string Heading { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        // Stored UTC, same convention as EnvironmentUptimeRequestNexus.FromAt/ToAt.
        public DateTime StartAt { get; set; }

        public DateTime EndAt { get; set; }

        public DateTime CreatedAt { get; set; }

        // NULL = not manually ended. "Active" is derived (StartAt <= now <
        // EndAt AND EndedEarlyAt IS NULL) rather than a stored Status column,
        // since both non-active states (expired, ended early) are fully
        // determined by the columns already here - see data-model.md.
        public DateTime? EndedEarlyAt { get; set; }

        // One comma-separated value (e.g. "Dev1,Dev2") - a downtime
        // announcement can affect several environments at once, unlike
        // EnvironmentUptimeRequestNexus.Environment, which is a single name.
        // Kept in this one table rather than a join table - see data-model.md.
        public string Environments { get; set; } = string.Empty;

        // Same soft-delete convention as EnvironmentUptimeRequestNexus -
        // excluded from every normal query via a HasQueryFilter instead of
        // services repeating "!IsDeleted" by hand.
        public bool IsDeleted { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
