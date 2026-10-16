namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    public sealed class AskQuestionResponseDTO
    {
        public string Answer { get; set; } = string.Empty;

        // The conversation this turn was saved into - always present, even
        // when the request's own ConversationId was null (a new conversation
        // gets created implicitly in that case, see
        // ChatAssistantService.AskQuestionAsynchronous). The frontend
        // remembers this and sends it back on every subsequent question in
        // the same chat session.
        public Guid ConversationId { get; set; }
    }
}
