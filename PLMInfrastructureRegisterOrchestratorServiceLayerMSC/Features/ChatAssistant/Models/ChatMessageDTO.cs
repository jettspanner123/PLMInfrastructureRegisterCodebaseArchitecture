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

        // "Text" (default) or "ClarifyingQuestion" - discriminates how the
        // frontend should render this row (see ChatMessageNexus.MessageKind).
        public string MessageKind { get; set; } = "Text";

        // Only set when MessageKind is "ClarifyingQuestion" - the raw
        // question payload, re-parsed by the frontend to reconstruct the
        // card (its options/allowMultiple/text) on reload.
        public string? ToolCallArguments { get; set; }

        // Null while the question is still pending an answer; set once
        // answered/skipped - lets the frontend reconstruct the card's
        // frozen, already-answered state on reload.
        public string? ToolCallOutput { get; set; }

        public bool IsSkipped { get; set; }
    }
}
