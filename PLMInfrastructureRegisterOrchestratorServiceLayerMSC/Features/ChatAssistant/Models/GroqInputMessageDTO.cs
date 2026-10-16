using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One entry in GroqRequestDTO's array-shaped Input - mirrors the
    // Responses API's own {role, content} message shape exactly (role is
    // "user" or "assistant" here; the separate system-level context goes
    // through GroqRequestDTO.Instructions instead, not a "system"-role entry
    // in this array, since Groq's own docs expose both as peers).
    public sealed class GroqInputMessageDTO
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }
}
