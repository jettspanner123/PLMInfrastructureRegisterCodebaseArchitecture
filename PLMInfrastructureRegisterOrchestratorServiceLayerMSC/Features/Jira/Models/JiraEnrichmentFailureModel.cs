namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Models
{
    // One non-fatal failure to set a secondary field (Assignee, Story
    // Points) on an already-successfully-created ticket. Unlike
    // JiraTicketCreationResultModel's own FailureReason/StatusCode/
    // ResponseBody, this never blocks the Uptime Request - the ticket
    // already exists, so the caller just logs it (research.md §9).
    public sealed class JiraEnrichmentFailureModel
    {
        public string FieldName { get; set; } = string.Empty;

        public string FailureReason { get; set; } = string.Empty;

        public int? StatusCode { get; set; }

        public string? ResponseBody { get; set; }
    }
}
