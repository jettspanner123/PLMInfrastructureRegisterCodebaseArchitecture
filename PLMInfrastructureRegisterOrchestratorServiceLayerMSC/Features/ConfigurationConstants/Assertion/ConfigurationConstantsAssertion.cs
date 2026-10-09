using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Assertion
{
    public sealed class ConfigurationConstantsAssertion
    {
        private static readonly ConfigurationConstantsAssertion _current = new ConfigurationConstantsAssertion();

        public static ConfigurationConstantsAssertion Current => _current;

        private ConfigurationConstantsAssertion()
        {
        }

        // Every growable-dropdown field across the whole app (Status and
        // Sponsor on Environment Overview, the custom color palette on
        // Infrastructure Register, any future one) owns exactly one
        // IG_ConfigurationConstantTBL row, keyed by one of these
        // ConfigurationKey constants - this map is what lets
        // GET/PUT /ConfigurationConstants/{fieldName} stay a single generic
        // pair of endpoints shared by every feature, instead of one
        // dedicated pair per field per feature. fieldName itself (not the
        // raw ConfigurationKey) is what the route and every frontend caller
        // speak - a safe public name, not the internal storage detail.
        private static readonly Dictionary<string, string> OptionsFieldNameToConfigurationKey = new(StringComparer.Ordinal)
        {
            ["Status"] = "ENVIRONMENT_OVERVIEW_STATUS_OPTIONS",
            ["Sponsor"] = "ENVIRONMENT_OVERVIEW_SPONSOR_OPTIONS",
            ["ResourceCellFormatColor"] = "RESOURCE_CELL_FORMAT_CUSTOM_COLORS",
        };

        public string AssertOptionsFieldName(string? fieldName)
        {
            if (string.IsNullOrWhiteSpace(fieldName) || !OptionsFieldNameToConfigurationKey.TryGetValue(fieldName, out string? configurationKey))
            {
                throw new ValidationException($"'{fieldName}' does not have a dropdown option list.");
            }

            return configurationKey;
        }

        public void AssertAddOptionRequest(AddConfigurationConstantOptionRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Value))
            {
                throw new ValidationException("A value must be provided.");
            }
        }
    }
}
