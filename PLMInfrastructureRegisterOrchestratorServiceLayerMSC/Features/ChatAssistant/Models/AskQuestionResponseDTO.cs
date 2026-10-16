namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    public sealed class AskQuestionResponseDTO
    {
        // Null when the turn paused on a clarifying question instead of
        // producing a final answer - exactly one of Answer/PendingQuestion
        // is populated. Also returned (reused) by AnswerQuestionAsynchronous,
        // since resuming a paused turn can itself immediately pause again on
        // another clarifying question.
        public string? Answer { get; set; }

        // The conversation this turn was saved into - always present, even
        // when the request's own ConversationId was null (a new conversation
        // gets created implicitly in that case, see
        // ChatAssistantService.AskQuestionAsynchronous). The frontend
        // remembers this and sends it back on every subsequent question in
        // the same chat session.
        public Guid ConversationId { get; set; }

        // Non-null when the assistant needs the user to answer something
        // before it can continue - see ClarifyingQuestionDTO.
        public ClarifyingQuestionDTO? PendingQuestion { get; set; }
    }
}
