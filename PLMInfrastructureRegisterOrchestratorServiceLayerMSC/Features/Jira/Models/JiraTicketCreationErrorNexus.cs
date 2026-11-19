using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Models
{
    // Maps to IG_TicketCreationErrorTBL - one row per failed Jira ticket-
    // creation attempt (spec FR-011 in specs/002-jira-ticket-creation).
    // Insert-only: nothing in this app ever reads these back at runtime: no
    // UI in this revision (spec FR-013), queried directly against the
    // database if a failure needs investigating. Deliberately NOT a foreign
    // key to EnvironmentUptimeRequestNexus - see data-model.md §2: the row
    // this refers to (if one briefly existed) is already deleted by the
    // time this is written, so everything needed to understand the failure
    // is copied inline instead.
    public sealed class JiraTicketCreationErrorNexus
    {
        public Guid Id { get; set; }

        public DateTime CreatedAt { get; set; }

        // The Uptime Request's own generated TicketId (e.g. "UPTM-00042"),
        // when a row had already been inserted before Jira was called (see
        // research.md §4) - null only if an error occurred before that
        // insert happened at all.
        public string? AttemptedTicketId { get; set; }

        public string Environment { get; set; } = string.Empty;

        public string RequesterName { get; set; } = string.Empty;

        public string RequesterEmail { get; set; } = string.Empty;

        public DateTime FromAt { get; set; }

        public DateTime ToAt { get; set; }

        public string? Message { get; set; }

        public string AttemptedSummary { get; set; } = string.Empty;

        public string AttemptedDescription { get; set; } = string.Empty;

        public string FailureReason { get; set; } = string.Empty;

        // The HTTP status Jira itself returned, when the failure was a
        // rejected request. Null for a connection-level failure.
        public int? JiraStatusCode { get; set; }

        // The raw response body Jira returned, when available. Null for a
        // connection-level failure.
        public string? JiraResponseBody { get; set; }
    }
}
