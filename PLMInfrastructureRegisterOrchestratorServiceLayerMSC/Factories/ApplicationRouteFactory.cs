namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories
{
    public static class ApplicationRouteFactory
    {
        public static class ResourcesRoutes
        {
            public const string ControllerURL = "/Api/V1/Resources";

            public const string GetAllResources = "";

            // Right-click cell formatting (bold/italic/background color) -
            // sparse, keyed by (ResourceId, ColumnKey). GetAllResources
            // itself is untouched; the frontend fetches these separately and
            // merges them in by (resourceId, columnKey) when rendering.
            public const string GetCellFormats = "CellFormats";

            public const string UpdateCellFormat = "CellFormats";

            // The named, growable custom-color palette offered by the
            // right-click formatting menu's "Add Color" option - structured
            // (name + format + value), unlike ConfigurationConstants' own
            // generic {fieldName} routes which only ever carry a bare
            // display string (see ConfigurationConstantsRoutes below).
            public const string GetCustomColors = "CellFormats/Colors";

            public const string AddCustomColor = "CellFormats/Colors";

            public const string UpdateCustomColor = "CellFormats/Colors/{id}";

            public const string DeleteCustomColor = "CellFormats/Colors/{id}";
        }

        public static class SyncRoutes
        {
            public const string ControllerURL = "/Api/V1/Sync";

            public const string RunSync = "Run";
        }

        public static class SubscriptionsRoutes
        {
            public const string ControllerURL = "/Api/V1/Subscriptions";

            public const string GetConfiguredSubscriptions = "";

            public const string GetAvailableAzureSubscriptions = "Available";

            public const string AddSubscription = "";

            public const string UpdateDisplayName = "{id}/DisplayName";

            public const string DeleteSubscription = "{id}";
        }

        public static class ChatAssistantRoutes
        {
            public const string ControllerURL = "/Api/V1/ChatAssistant";

            public const string AskQuestion = "AskQuestion";
        }

        public static class EnvironmentOverviewRoutes
        {
            public const string ControllerURL = "/Api/V1/EnvironmentOverview";

            public const string GetAllEnvironmentOverviews = "";

            public const string CreateEnvironmentOverview = "";

            public const string UpdateStatus = "{id}/Status";

            public const string AddActionItem = "{id}/ActionItems";

            public const string DeleteActionItem = "{id}/ActionItems/{lineIndex}";

            public const string UpdateField = "{id}/Field";

            // Soft delete (sets IsDeleted/DeletedAt) - see
            // EnvironmentOverviewNexus.IsDeleted for why this isn't a hard
            // DELETE.
            public const string DeleteEnvironmentOverview = "{id}";
        }

        public static class ConfigurationConstantsRoutes
        {
            public const string ControllerURL = "/Api/V1/ConfigurationConstants";

            // Generic growable-dropdown options mechanism, shared by every
            // field across the whole app that needs one (Status/Sponsor on
            // Environment Overview, the custom color palette on
            // Infrastructure Register, any future one) - one route pair
            // instead of a dedicated pair per field per feature. fieldName
            // is allow-listed server-side (see
            // ConfigurationConstantsAssertion.AssertOptionsFieldName) and
            // mapped internally to its own IG_ConfigurationConstantTBL row.
            public const string GetOptions = "{fieldName}";

            public const string AddOption = "{fieldName}";
        }
    }
}
