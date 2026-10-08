namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // Every field the "Add Environment" draft row can submit. DisplayOrder
    // and Status are deliberately absent - both are derived server-side
    // (max + 1, and always "Live" for a brand-new row) rather than
    // client-supplied.
    public sealed class CreateEnvironmentOverviewRequestDTO
    {
        public string Environment { get; set; } = string.Empty;

        public string? Purpose { get; set; }

        public string? Sponsor { get; set; }

        public string? CurrentUptimeSchedule { get; set; }

        public string? Priority1 { get; set; }

        public string? Priority2 { get; set; }

        public string? Priority3 { get; set; }

        public string? ActionItemsUpdates { get; set; }

        public string? ConfigurationCustomisationVersion { get; set; }

        public string? DNSURL { get; set; }
    }
}
