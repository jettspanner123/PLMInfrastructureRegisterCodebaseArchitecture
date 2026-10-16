namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // Deserialization target for the ask_clarifying_question tool's own
    // Arguments JSON (Groq's shape, parsed case-insensitively like every
    // other tool's own ArgsDTO - see ChatAssistantService.ArgsParsingOptions).
    public sealed class AskClarifyingQuestionArgsDTO
    {
        // A short title for the question card, e.g. "Which environment?".
        public string Heading { get; set; } = string.Empty;

        // A longer, plain-language explanation of what's being asked and
        // why - rendered muted beneath Heading so the user has enough
        // context to answer without the heading alone having to carry it.
        public string Description { get; set; } = string.Empty;

        // Optional - a question can be free-text-only (omit this entirely).
        // No hard cap enforced here; AssistantInstructions guides the model
        // toward ~5-6 generalized options instead of a code-enforced limit.
        public List<string>? Options { get; set; }

        // Ignored when Options is null/empty.
        public bool AllowMultiple { get; set; }
    }
}
