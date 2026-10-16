namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    public sealed class AnswerQuestionRequestDTO
    {
        public Guid ConversationId { get; set; }

        public Guid MessageId { get; set; }

        // Mutually exclusive with FreeTextAnswer - options picked from the
        // question's own Options list (single-select sends exactly one
        // entry; multi-select may send several).
        public List<string>? SelectedOptions { get; set; }

        // Mutually exclusive with SelectedOptions - the user typed their own
        // answer instead of picking from the offered options (or the
        // question had no options to begin with).
        public string? FreeTextAnswer { get; set; }

        // Distinct from an empty answer - the user explicitly declined to
        // answer this question at all.
        public bool IsSkipped { get; set; }
    }
}
