using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // This app's reply to one GroqFunctionCallItemDTO - carries the tool's
    // result back to Groq as a JSON string in Output, matched to the call
    // by CallId (shape confirmed live against Groq's Responses API).
    public sealed class GroqFunctionCallOutputItemDTO
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "function_call_output";

        [JsonPropertyName("call_id")]
        public string CallId { get; set; } = string.Empty;

        [JsonPropertyName("output")]
        public string Output { get; set; } = string.Empty;
    }
}
