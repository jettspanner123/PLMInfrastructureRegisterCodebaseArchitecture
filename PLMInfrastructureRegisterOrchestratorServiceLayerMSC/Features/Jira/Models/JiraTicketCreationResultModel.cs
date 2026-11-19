namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Models
{
    // JiraService's own return shape - never thrown, so a Jira-side
    // rejection or a connection-level failure both come back as ordinary
    // data the caller decides how to log/propagate (see research.md §7 for
    // the Uptime Requests feature this was built for).
    public sealed class JiraTicketCreationResultModel
    {
        public bool IsSuccess { get; set; }

        // Always populated, success or failure - the caller needs these for
        // the error log on failure (data-model.md §2's AttemptedSummary/
        // AttemptedDescription) without having to reconstruct them itself.
        public string AttemptedSummary { get; set; } = string.Empty;

        public string AttemptedDescription { get; set; } = string.Empty;

        public string? TicketKey { get; set; }

        public string? TicketUrl { get; set; }

        // Human-readable explanation of what went wrong - always set when
        // IsSuccess is false, always null when it's true.
        public string? FailureReason { get; set; }

        // The HTTP status Jira itself returned, when the failure was a
        // rejected request. Null for a connection-level failure (Jira
        // unreachable, timeout, DNS failure), since there was no response.
        public int? StatusCode { get; set; }

        // The raw response body Jira returned, when available. Null for a
        // connection-level failure.
        public string? ResponseBody { get; set; }

        // Non-fatal: Assignee/Story Points failing to set never flips
        // IsSuccess or blocks the Uptime Request - the ticket already
        // exists. Always empty when IsSuccess is false (nothing to enrich).
        public List<JiraEnrichmentFailureModel> EnrichmentFailures { get; set; } = new();
    }
}
