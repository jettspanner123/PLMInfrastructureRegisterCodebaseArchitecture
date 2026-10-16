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

        // "Text" (default) or "ClarifyingQuestion" - a ClarifyingQuestion row
        // is a real paused Groq tool call (ask_clarifying_question), not
        // just a plain assistant message; see ChatAssistantService's own
        // top comment for why this needed real tool-calling rather than a
        // text-parsing convention.
        public string MessageKind { get; set; } = "Text";

        // Only set on a ClarifyingQuestion row - Groq's own call_id for the
        // paused function_call, needed to re-emit the exact same call/output
        // pair when resuming (see AnswerQuestionAsynchronous).
        public string? ToolCallId { get; set; }

        // Only set on a ClarifyingQuestion row - the raw Arguments JSON Groq
        // sent (the question payload: QuestionText/Options/AllowMultiple),
        // re-parsed both to render the card and to resume the paused call.
        public string? ToolCallArguments { get; set; }

        // Only set on a ClarifyingQuestion row. Null while the question is
        // still pending an answer - this is how "is there an unresolved
        // question" is derived (no separate conversation-level status
        // column exists). Set once answered/skipped to whatever was sent
        // back to Groq as the function_call_output, so the card can
        // reconstruct its frozen, already-answered state on reload.
        public string? ToolCallOutput { get; set; }

        // Only meaningful on a ClarifyingQuestion row that has ToolCallOutput
        // set - distinguishes "the user explicitly skipped this" from "the
        // user answered with something".
        public bool IsSkipped { get; set; }

        // Only set on a ClarifyingQuestion row, and only until it's
        // answered - the entire Groq Input array exactly as it stood right
        // before this tool call, serialized. Needed because any OTHER tool
        // calls the model made earlier in the SAME turn (e.g. query_resources)
        // are never persisted anywhere else - only the final user question
        // and final assistant answer are, see this class's own earlier
        // comment - so reconstructing a resumable state purely from chat
        // history would silently lose them. Not needed once answered (the
        // resumed loop has already moved past this point), but left as-is
        // rather than cleared, since nothing reads it again afterward.
        public string? PendingInputStateJson { get; set; }
    }
}
