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

        // Required at submission time - the only place Jira ticket content
        // gets a requester email from (see JiraService). Write-once, same
        // as JiraTicketKey/JiraTicketUrl below.
        public string RequesterEmail { get; set; } = string.Empty;

        // Stored as UTC. Entered by the user as fixed CET (UTC+1, never DST-
        // shifted) wall-clock time on a <input type="datetime-local"> field
        // and converted server-side - see CETTimeZoneUtility.
        public DateTime FromAt { get; set; }

        public DateTime ToAt { get; set; }

        public string? Message { get; set; }

        // Set once, immediately after the Jira ticket is created
        // successfully (never null by the time this row is actually
        // visible to any other request - see EnvironmentUptimeRequestsService
        // and research.md §4 in specs/002-jira-ticket-creation). Never
        // updated again afterward - this integration is create-once.
        public string? JiraTicketKey { get; set; }

        public string? JiraTicketUrl { get; set; }

        public EnvironmentUptimeRequestStatusEnum Status { get; set; }

        // Admin-only, free-text, single current note - overwritten (not
        // appended/history-tracked) every time an admin saves a status
        // change. Visible to every viewer of this ticket, editable only by
        // an admin - see AdminController-gated frontend controls.
        public string? AdminMessage { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
