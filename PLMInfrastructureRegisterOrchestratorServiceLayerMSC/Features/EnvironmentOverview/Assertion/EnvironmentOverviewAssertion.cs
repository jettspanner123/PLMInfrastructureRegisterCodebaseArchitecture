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

        // Every field with a growable dropdown (Status, Sponsor, any future
        // one) owns exactly one IG_ConfigurationConstantTBL row, keyed by
        // one of these ConfigurationKey constants - this map is what lets
        // GET/POST /EnvironmentOverview/Options/{fieldName} stay a single
        // generic pair of endpoints instead of one dedicated pair per field.
        // fieldName itself (not the raw ConfigurationKey) is what the route
        // and the frontend speak, matching AllowedUpdateFieldNames' own
        // "safe public name -> internal storage detail" shape below.
        private static readonly Dictionary<string, string> OptionsFieldNameToConfigurationKey = new(StringComparer.Ordinal)
        {
            ["Status"] = "ENVIRONMENT_OVERVIEW_STATUS_OPTIONS",
            ["Sponsor"] = "ENVIRONMENT_OVERVIEW_SPONSOR_OPTIONS",
        };

        public string AssertOptionsFieldName(string? fieldName)
        {
            if (string.IsNullOrWhiteSpace(fieldName) || !OptionsFieldNameToConfigurationKey.TryGetValue(fieldName, out string? configurationKey))
            {
                throw new ValidationException($"'{fieldName}' does not have a dropdown option list.");
            }

            return configurationKey;
        }

        public void AssertAddOptionRequest(AddEnvironmentOverviewOptionRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Value))
            {
                throw new ValidationException("A value must be provided.");
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
            "Sponsor",
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
