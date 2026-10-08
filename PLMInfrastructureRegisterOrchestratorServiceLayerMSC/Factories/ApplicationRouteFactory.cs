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

            // Generic growable-dropdown options mechanism, shared by every
            // field that needs one (Status, Sponsor, any future one) - one
            // route pair instead of a dedicated StatusOptions/SponsorOptions
            // pair per field. fieldName is allow-listed server-side (see
            // EnvironmentOverviewAssertion.AssertOptionsFieldName) and mapped
            // internally to its own IG_ConfigurationConstantTBL row.
            public const string GetOptions = "Options/{fieldName}";

            public const string AddOption = "Options/{fieldName}";

            public const string UpdateStatus = "{id}/Status";

            public const string AddActionItem = "{id}/ActionItems";

            public const string DeleteActionItem = "{id}/ActionItems/{lineIndex}";

            public const string UpdateField = "{id}/Field";

            // Soft delete (sets IsDeleted/DeletedAt) - see
            // EnvironmentOverviewNexus.IsDeleted for why this isn't a hard
            // DELETE.
            public const string DeleteEnvironmentOverview = "{id}";
        }
    }
}
