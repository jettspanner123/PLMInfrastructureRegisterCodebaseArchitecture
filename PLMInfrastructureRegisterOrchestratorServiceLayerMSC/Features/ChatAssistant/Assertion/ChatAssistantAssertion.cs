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

            if (string.IsNullOrWhiteSpace(request.ClientId))
            {
                throw new ValidationException("A ClientId must be provided.");
            }
        }

        public void AssertGetConversationsRequest(string? clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
            {
                throw new ValidationException("A clientId must be provided.");
            }
        }

        public void AssertAnswerQuestionRequest(AnswerQuestionRequestDTO? request)
        {
            if (request is null || request.ConversationId == Guid.Empty || request.MessageId == Guid.Empty)
            {
                throw new ValidationException("ConversationId and MessageId must be provided.");
            }

            bool hasSelectedOptions = request.SelectedOptions is not null && request.SelectedOptions.Count > 0;
            bool hasFreeText = !string.IsNullOrWhiteSpace(request.FreeTextAnswer);

            if (!request.IsSkipped && !hasSelectedOptions && !hasFreeText)
            {
                throw new ValidationException("An answer (selected options or free text) must be provided, or the question must be skipped.");
            }
        }
    }
}
