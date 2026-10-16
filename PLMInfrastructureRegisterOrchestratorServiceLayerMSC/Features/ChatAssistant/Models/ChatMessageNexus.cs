namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One row per turn (both the user's question and the assistant's answer
    // each get their own row) - this, ordered by CreatedAt, is exactly the
    // history replayed back to Groq as the `input` array on the next
    // question in the same conversation (see ChatAssistantService).
    public sealed class ChatMessageNexus
    {
        public Guid Id { get; set; }

        public Guid ConversationId { get; set; }

        // "user" or "assistant" - matches the frontend's own ChatMessage.sender
        // values exactly (the "error" sender there is a client-only transient
        // state for a failed request, never persisted).
        public string Role { get; set; } = string.Empty;

        public string Text { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
