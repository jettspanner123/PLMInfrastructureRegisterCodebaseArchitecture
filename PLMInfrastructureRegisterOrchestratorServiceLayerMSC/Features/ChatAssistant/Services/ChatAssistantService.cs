using System.Net.Http.Headers;
using System.Net.Http.Json;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Services
{
    // Basic Q&A over Groq's OpenAI-compatible "Responses API". Registered as
    // an IHttpClientFactory typed client (see Program.cs's
    // AddHttpClient<ChatAssistantService>()) so HttpClient is DI-managed
    // rather than constructed directly, avoiding socket exhaustion.
    public sealed class ChatAssistantService
    {
        private const string GroqResponsesEndpointURL = "https://api.groq.com/openai/v1/responses";
        private const string GroqModel = "openai/gpt-oss-20b";

        private readonly HttpClient _httpClient;

        public ChatAssistantService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> AskQuestionAsynchronous(string question)
        {
            string groqApiKey = ENValidatorHelper.Current.GetEnvKeyValue("GROQ_API_KEY");

            var groqRequest = new GroqRequestDTO
            {
                Model = GroqModel,
                Input = question,
            };

            using var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, GroqResponsesEndpointURL)
            {
                Content = JsonContent.Create(groqRequest),
            };
            httpRequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", groqApiKey);

            using HttpResponseMessage httpResponseMessage = await _httpClient.SendAsync(httpRequestMessage);

            if (!httpResponseMessage.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"The assistant service responded with an unexpected status code ({(int)httpResponseMessage.StatusCode}).");
            }

            GroqResponseDTO? groqResponse = await httpResponseMessage.Content.ReadFromJsonAsync<GroqResponseDTO>();

            string? answer = groqResponse?.Output
                .Where(outputItem => outputItem.Type == "message")
                .SelectMany(outputItem => outputItem.Content ?? new List<GroqResponseContentItemDTO>())
                .Where(contentItem => contentItem.Type == "output_text")
                .Select(contentItem => contentItem.Text)
                .FirstOrDefault(text => !string.IsNullOrWhiteSpace(text));

            return answer ?? "I wasn't able to come up with an answer to that.";
        }
    }
}
