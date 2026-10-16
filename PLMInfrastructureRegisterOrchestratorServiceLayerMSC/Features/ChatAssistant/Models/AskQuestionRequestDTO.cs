namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    public sealed class AskQuestionRequestDTO
    {
        public string? Question { get; set; }

        // Null means "start a new conversation" - ChatAssistantService
        // creates one implicitly rather than this needing a separate
        // create-conversation call first. Present (non-null) means "append
        // to this existing conversation", used for every question after the
        // first one in a session, and when resuming a past conversation
        // from the sidebar.
        public Guid? ConversationId { get; set; }

        // AnonymousClientIdentityUtility's per-browser id - scopes which
        // conversations this client can see/resume, the same placeholder-
        // for-real-auth identity already used for Status change attribution.
        public string? ClientId { get; set; }
    }
}
