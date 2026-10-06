using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Assertion
{
    public sealed class ChatAssistantAssertion
    {
        private static readonly ChatAssistantAssertion _current =
            new ChatAssistantAssertion();

        public static ChatAssistantAssertion Current => _current;

        private ChatAssistantAssertion()
        {
        }

        public void AssertAskQuestionRequest(AskQuestionRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Question))
            {
                throw new ValidationException("A question must be provided.");
            }
        }
    }
}
