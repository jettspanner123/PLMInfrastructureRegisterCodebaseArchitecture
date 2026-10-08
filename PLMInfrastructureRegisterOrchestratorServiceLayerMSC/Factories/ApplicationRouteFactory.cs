namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories
{
    public static class ApplicationRouteFactory
    {
        public static class ResourcesRoutes
        {
            public const string ControllerURL = "/Api/V1/Resources";

            public const string GetAllResources = "";
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

            public const string GetStatusOptions = "StatusOptions";

            public const string AddStatusOption = "StatusOptions";

            public const string UpdateStatus = "{id}/Status";
        }
    }
}
