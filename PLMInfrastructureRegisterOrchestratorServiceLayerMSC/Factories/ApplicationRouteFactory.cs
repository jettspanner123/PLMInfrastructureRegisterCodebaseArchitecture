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

            // The Infrastructure Register page's own user-manageable legend
            // row - purely a labeled reference list (name + color), not tied
            // to any actual table-column coloring. Same {name + color
            // structured value} reasoning as CellFormats/Colors above, so it
            // gets its own nested routes rather than overloading those.
            public const string GetLegends = "Legends";

            public const string AddLegend = "Legends";

            public const string UpdateLegend = "Legends/{id}";

            public const string DeleteLegend = "Legends/{id}";
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

            // Resolves a pending ask_clarifying_question tool call once the
            // user actually answers (or skips) it - see
            // ChatAssistantService.AnswerQuestionAsynchronous. Deliberately a
            // separate route from AskQuestion rather than overloading it,
            // since the two requests are semantically different (asking
            // something new vs. resolving a specific paused tool call).
            public const string AnswerQuestion = "AnswerQuestion";

            public const string GetConversations = "Conversations";

            public const string GetConversationMessages = "Conversations/{id}/Messages";
        }

        public static class EnvironmentOverviewRoutes
        {
            public const string ControllerURL = "/Api/V1/EnvironmentOverview";

            public const string GetAllEnvironmentOverviews = "";

            public const string CreateEnvironmentOverview = "";

            public const string UpdateStatus = "{id}/Status";

            public const string AddActionItem = "{id}/ActionItems";

            // Same route template as DeleteActionItem (PUT vs DELETE on the
            // same addressed line is a standard REST pairing) - not a typo.
            public const string UpdateActionItem = "{id}/ActionItems/{lineIndex}";

            public const string DeleteActionItem = "{id}/ActionItems/{lineIndex}";

            public const string UpdateField = "{id}/Field";

            // Separate from UpdateField (not folded into its own generic
            // fieldName/value switch) since saving the Current Uptime
            // Schedule bundles two values together (the already-composed
            // schedule string, plus the optional raw note) and can trigger
            // an AI summarization call for a long note - neither of which
            // the generic single-field endpoint supports.
            public const string UpdateUptimeSchedule = "{id}/UptimeSchedule";

            // Soft delete (sets IsDeleted/DeletedAt) - see
            // EnvironmentOverviewNexus.IsDeleted for why this isn't a hard
            // DELETE.
            public const string DeleteEnvironmentOverview = "{id}";

            // Right-click cell formatting (bold/italic/background color) -
            // sparse, keyed by (EnvironmentOverviewId, ColumnKey). Mirrors
            // ResourcesRoutes.GetCellFormats/UpdateCellFormat exactly; the
            // custom-color palette itself is shared with Resources' own
            // CellFormats/Colors routes rather than duplicated here.
            public const string GetCellFormats = "CellFormats";

            public const string UpdateCellFormat = "CellFormats";
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

        public static class FeatureRequestsRoutes
        {
            public const string ControllerURL = "/Api/V1/FeatureRequests";

            public const string GetAllFeatureRequests = "";

            public const string CreateFeatureRequest = "";

            public const string UpdateStatus = "{id}/Status";

            public const string DeleteFeatureRequest = "{id}";
        }

        public static class EnvironmentUptimeRequestsRoutes
        {
            public const string ControllerURL = "/Api/V1/EnvironmentUptimeRequests";

            public const string GetAllEnvironmentUptimeRequests = "";

            public const string CreateEnvironmentUptimeRequest = "";

            // Soft delete (sets IsDeleted/DeletedAt) - same reasoning as
            // EnvironmentOverviewRoutes.DeleteEnvironmentOverview and
            // FeatureRequestsRoutes.DeleteFeatureRequest.
            public const string DeleteEnvironmentUptimeRequest = "{id}";
        }
    }
}
