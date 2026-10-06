using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // Mirrors the subset of Groq's Responses API JSON this app actually
    // reads. Unrecognized fields on the real payload (id, status, usage,
    // and so on) are simply ignored by System.Text.Json during
    // deserialization rather than modeled here.
    public sealed class GroqResponseDTO
    {
        [JsonPropertyName("output")]
        public List<GroqResponseOutputItemDTO> Output { get; set; } = new List<GroqResponseOutputItemDTO>();
    }
}
