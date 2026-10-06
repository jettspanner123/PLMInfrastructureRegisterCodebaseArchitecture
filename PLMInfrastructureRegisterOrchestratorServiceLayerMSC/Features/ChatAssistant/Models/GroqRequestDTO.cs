using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // Mirrors Groq's OpenAI-compatible "Responses API" request body
    // (POST https://api.groq.com/openai/v1/responses). Property names are
    // pinned with JsonPropertyName rather than relying on this app's own
    // (PascalCase) JSON configuration, since Groq expects exact lowercase
    // keys regardless of how this app serializes its own API contracts.
    public sealed class GroqRequestDTO
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("input")]
        public string Input { get; set; } = string.Empty;
    }
}
