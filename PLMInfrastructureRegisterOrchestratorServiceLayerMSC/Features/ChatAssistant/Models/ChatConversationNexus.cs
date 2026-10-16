namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One row per conversation thread - scoped by AnonymousClientId rather
    // than a real user id, since this app has no authentication system yet
    // (same per-browser identity AnonymousClientIdentityUtility already
    // establishes on the frontend for Status change attribution). Created
    // implicitly on a client's first AskQuestion call with no conversationId
    // yet, not through a dedicated "create conversation" endpoint - see
    // ChatAssistantService.AskQuestionAsynchronous.
    public sealed class ChatConversationNexus
    {
        public Guid Id { get; set; }

        public string AnonymousClientId { get; set; } = string.Empty;

        // Set once, from the first question in the conversation (truncated) -
        // never updated afterward, matching how a chat app's own auto-title
        // usually behaves.
        public string Title { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        // Bumped every time a new message is added - this is what the
        // sidebar's conversation list sorts by (most recently active first).
        public DateTime UpdatedAt { get; set; }
    }
}
