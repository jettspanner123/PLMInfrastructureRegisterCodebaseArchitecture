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

            if (string.IsNullOrWhiteSpace(request.ChangedByClientId))
            {
                throw new ValidationException("A ChangedByClientId must be provided.");
            }
        }

        public void AssertAddStatusOptionRequest(AddEnvironmentOverviewStatusOptionRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Status))
            {
                throw new ValidationException("A Status option name must be provided.");
            }
        }

        public void AssertAddActionItemRequest(AddActionItemRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Note))
            {
                throw new ValidationException("A note must be provided.");
            }
        }

        // The only columns this generic single-field endpoint is allowed to
        // touch - anything else (Environment, Status, ActionItemsUpdates,
        // etc.) has its own dedicated endpoint with its own business rules
        // and must never be reachable through this one.
        private static readonly HashSet<string> AllowedUpdateFieldNames = new(StringComparer.Ordinal)
        {
            "Purpose",
            "Priority1",
            "Priority2",
            "Priority3",
            "DNSURL",
        };

        public void AssertUpdateFieldRequest(UpdateEnvironmentOverviewFieldRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.FieldName))
            {
                throw new ValidationException("A FieldName must be provided.");
            }

            if (!AllowedUpdateFieldNames.Contains(request.FieldName))
            {
                throw new ValidationException($"'{request.FieldName}' is not an editable field.");
            }
        }
    }
}
