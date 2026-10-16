namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // What the frontend needs to render the interactive question card -
    // returned inside AskQuestionResponseDTO when a turn pauses instead of
    // producing a final text answer (see ChatAssistantService's own doc
    // comment on why a real Groq tool call, not a text convention, drives
    // this).
    public sealed class ClarifyingQuestionDTO
    {
        // The ChatMessageNexus row this question was persisted as - echoed
        // back on AnswerQuestionRequestDTO.MessageId to unambiguously
        // identify which pending question is being resolved.
        public Guid MessageId { get; set; }

        public string Heading { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<string>? Options { get; set; }

        public bool AllowMultiple { get; set; }
    }
}
