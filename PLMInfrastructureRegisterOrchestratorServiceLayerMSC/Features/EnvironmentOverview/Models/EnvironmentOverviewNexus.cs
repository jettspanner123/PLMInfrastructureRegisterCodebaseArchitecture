namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // One row per environment from the infrastructure register's own
    // "Environment Overview" sheet - entirely manual data (no Azure/Sync
    // involvement), seeded once from the CSV and meant to be user-editable
    // later. Every column mirrors the CSV verbatim; IsDecommissioned and
    // DisplayOrder are the only two derived values, both added during the
    // seed migration rather than present in the source file itself.
    public sealed class EnvironmentOverviewNexus
    {
        public Guid Id { get; set; }

        // Preserves the CSV's own row order - Postgres doesn't guarantee
        // retrieval order without an explicit ORDER BY, and the source order
        // reflects a deliberate grouping (live environments, then
        // decommissioned ones) worth keeping.
        public int DisplayOrder { get; set; }

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

        // True for every row that appeared below the CSV's own
        // "DECOMISSIONED ENVIRONMENTS" section-divider label - that divider
        // row itself was never a real environment and isn't stored.
        public bool IsDecommissioned { get; set; }
    }
}
