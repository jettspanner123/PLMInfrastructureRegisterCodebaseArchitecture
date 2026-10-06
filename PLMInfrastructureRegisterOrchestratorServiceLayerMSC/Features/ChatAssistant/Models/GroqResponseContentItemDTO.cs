using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One entry of a GroqResponseOutputItemDTO's own "content" array. Only
    // entries where Type == "output_text" carry the answer text in Text —
    // confirmed empirically against a real Groq response, since the
    // "output_text" convenience property the Python SDK exposes isn't
    // present on the raw JSON this app deserializes directly.
    public sealed class GroqResponseContentItemDTO
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}
