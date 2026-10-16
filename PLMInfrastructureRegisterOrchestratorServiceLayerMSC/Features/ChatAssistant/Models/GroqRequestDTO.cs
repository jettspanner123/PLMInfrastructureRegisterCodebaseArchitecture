using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // Mirrors Groq's OpenAI-compatible "Responses API" request body
    // (POST https://api.groq.com/openai/v1/responses). Property names are
    // pinned with JsonPropertyName rather than relying on this app's own
    // (PascalCase) JSON configuration, since Groq expects exact lowercase
    // keys regardless of how this app serializes its own API contracts.
    //
    // Input is the conversation history (prior user/assistant turns) plus
    // the new question, oldest first - NOT a bare string the way this used
    // to work, since that gave the model zero memory of earlier turns in
    // the same conversation. Instructions carries the (now static, data-free)
    // system-level context - the model gets real app data through Tools
    // instead (see ChatAssistantService), not a data dump in Instructions,
    // since that dump alone exceeded this account's 8000-tokens/minute Groq
    // rate limit (confirmed against the live API).
    //
    // Input holds a mix of item shapes once tool-calling is in play - a
    // plain {role, content} turn (GroqInputMessageDTO), the model's own prior
    // {type:"function_call", call_id, name, arguments} item echoed back
    // (GroqFunctionCallItemDTO), and this app's matching
    // {type:"function_call_output", call_id, output} reply
    // (GroqFunctionCallOutputItemDTO) - all three shapes confirmed live
    // against Groq's API. System.Text.Json serializes each List<object>
    // element by its own runtime type, so no custom converter is needed for
    // this to serialize correctly.
    public sealed class GroqRequestDTO
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("instructions")]
        public string? Instructions { get; set; }

        [JsonPropertyName("input")]
        public List<object> Input { get; set; } = new List<object>();

        [JsonPropertyName("tools")]
        public List<GroqToolDefinitionDTO>? Tools { get; set; }
    }
}
