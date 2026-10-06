using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One entry of GroqResponseDTO's own top-level "output" array. For
    // openai/gpt-oss-20b (a reasoning model) this array can contain a
    // "reasoning" item alongside the actual "message" item — only the
    // "message" item's own Content holds the answer.
    public sealed class GroqResponseOutputItemDTO
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public List<GroqResponseContentItemDTO>? Content { get; set; }
    }
}
