using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Assertion
{
    public sealed class EnvironmentOverviewAssertion
    {
        private static readonly EnvironmentOverviewAssertion _current =
            new EnvironmentOverviewAssertion();

        public static EnvironmentOverviewAssertion Current => _current;

        private EnvironmentOverviewAssertion()
        {
        }

        public void AssertUpdateStatusRequest(UpdateEnvironmentOverviewStatusRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Status))
            {
                throw new ValidationException("A Status must be provided.");
            }
        }

        public void AssertAddStatusOptionRequest(AddEnvironmentOverviewStatusOptionRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Status))
            {
                throw new ValidationException("A Status option name must be provided.");
            }
        }
    }
}
