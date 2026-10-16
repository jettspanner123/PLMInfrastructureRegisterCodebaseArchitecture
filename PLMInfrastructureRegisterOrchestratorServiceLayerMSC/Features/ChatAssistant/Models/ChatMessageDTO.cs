namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One message within a single conversation's full history - returned by
    // GetConversationMessages when the sidebar's user clicks a past
    // conversation to resume it.
    public sealed class ChatMessageDTO
    {
        public Guid Id { get; set; }

        public string Role { get; set; } = string.Empty;

        public string Text { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
