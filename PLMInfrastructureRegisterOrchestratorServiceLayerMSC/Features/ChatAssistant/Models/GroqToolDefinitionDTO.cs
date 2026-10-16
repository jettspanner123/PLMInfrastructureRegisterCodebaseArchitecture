using System.Text.Json.Serialization;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models
{
    // One entry in GroqRequestDTO's Tools array. Shape confirmed live
    // against Groq's Responses API: flat fields on the tool itself
    // (type/name/description/parameters), NOT nested under a "function" key
    // the way Chat Completions' tools array works - that nested shape is a
    // different, unrelated API this app doesn't use.
    public sealed class GroqToolDefinitionDTO
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "function";

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        // Raw JSON Schema object (type/properties/required) - left as
        // object rather than a typed model since each tool's schema shape
        // differs and none of them are nested or reused elsewhere.
        [JsonPropertyName("parameters")]
        public object Parameters { get; set; } = new { };
    }
}
