namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One row in the sidebar's own conversation list - deliberately doesn't
    // include the messages themselves (see ChatMessageDTO for that, fetched
    // separately only once a specific conversation is actually opened).
    public sealed class ChatConversationSummaryDTO
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }
    }
}
