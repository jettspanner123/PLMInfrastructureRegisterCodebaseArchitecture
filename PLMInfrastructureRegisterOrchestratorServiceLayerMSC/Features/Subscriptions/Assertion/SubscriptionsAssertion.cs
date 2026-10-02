using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Assertion
{
    public sealed class SubscriptionsAssertion
    {
        private static readonly SubscriptionsAssertion _current =
            new SubscriptionsAssertion();

        public static SubscriptionsAssertion Current => _current;

        private SubscriptionsAssertion()
        {
        }

        public void AssertAddSubscriptionRequest(AddSubscriptionRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.AzureSubscriptionId))
            {
                throw new ValidationException("An Azure Subscription ID must be provided.");
            }
        }

        public void AssertUpdateDisplayNameRequest(UpdateSubscriptionDisplayNameRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.DisplayName))
            {
                throw new ValidationException("A Display Name must be provided.");
            }
        }
    }
}
