namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // One option in a Dropdown-type custom column's own, private option list
    // - unlike Status/Sponsor, this is never routed through
    // ConfigurationConstants (that system is allow-listed by a fixed set of
    // known field names, which a user-created column isn't part of).
    // Append-ordered (CreatedAt) - there's no "insert between two options"
    // requirement, just a growable list.
    public sealed class EnvironmentOverviewCustomColumnOptionNexus
    {
        public Guid Id { get; set; }

        public Guid CustomColumnId { get; set; }

        public string Value { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
