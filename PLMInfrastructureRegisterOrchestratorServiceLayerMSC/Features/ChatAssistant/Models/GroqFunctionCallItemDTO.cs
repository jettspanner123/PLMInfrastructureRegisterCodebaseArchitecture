using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // Mirrors the "function_call" item Groq's Responses API puts in a
    // response's own Output array when the model decides to call a tool
    // (shape confirmed live). This app reads one of these off the response,
    // then echoes the same item back into the NEXT request's Input array
    // (Groq doesn't support previous_response_id - confirmed live - so the
    // whole exchange has to be resent) immediately followed by a matching
    // GroqFunctionCallOutputItemDTO.
    public sealed class GroqFunctionCallItemDTO
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "function_call";

        [JsonPropertyName("call_id")]
        public string CallId { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("arguments")]
        public string Arguments { get; set; } = string.Empty;
    }
}
