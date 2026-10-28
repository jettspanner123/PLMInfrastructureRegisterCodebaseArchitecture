namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class EnvironmentOverviewDTO
    {
        public Guid Id { get; set; }

        public string Environment { get; set; } = string.Empty;

        public string? Purpose { get; set; }

        public string? Sponsor { get; set; }

        public string? CurrentUptimeSchedule { get; set; }

        public string? Priority1 { get; set; }

        public string? Priority2 { get; set; }

        public string? Priority3 { get; set; }

        public string? ActionItemsUpdates { get; set; }

        public string? UptimeScheduleNote { get; set; }

        public string? UptimeScheduleNoteSummary { get; set; }

        public string? ConfigurationCustomisationVersion { get; set; }

        public string? DNSURL { get; set; }

        public string Status { get; set; } = string.Empty;

        // Keyed by CustomColumnId (as a string, matching how the cell-format
        // system already keys everything by a plain string ColumnKey) -
        // only the columns that actually have a non-null value for this row
        // are present; a missing key means "blank" client-side.
        public Dictionary<string, string?> CustomCellValues { get; set; } = new();
    }
}
