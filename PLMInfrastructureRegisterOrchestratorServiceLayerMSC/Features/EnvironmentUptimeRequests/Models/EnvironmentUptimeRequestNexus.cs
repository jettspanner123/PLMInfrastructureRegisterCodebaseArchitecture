using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models
{
    public sealed class EnvironmentUptimeRequestNexus
    {
        public Guid Id { get; set; }

        // Native Postgres identity column (GENERATED ALWAYS AS IDENTITY) -
        // atomic, lock-free, assigned by Postgres itself on insert. Never
        // set by application code. See ApplicationDatabaseContext for the
        // UseIdentityAlwaysColumn() fluent configuration and the migration
        // for the CHECK (<= 99999) constraint.
        public int TicketNumber { get; set; }

        // Postgres STORED generated column:
        // GENERATED ALWAYS AS ('UPTM-' || lpad("TicketNumber"::text, 5, '0')) STORED.
        // Computed and persisted by Postgres in the same atomic insert as
        // TicketNumber - never set, and never settable, by application code.
        public string TicketId { get; set; } = string.Empty;

        public string Environment { get; set; } = string.Empty;

        public string RequesterName { get; set; } = string.Empty;

        // Stored as UTC. Entered by the user as fixed CET (UTC+1, never DST-
        // shifted) wall-clock time on a <input type="datetime-local"> field
        // and converted server-side - see CETTimeZoneUtility.
        public DateTime FromAt { get; set; }

        public DateTime ToAt { get; set; }

        public string? Message { get; set; }

        public EnvironmentUptimeRequestStatusEnum Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
