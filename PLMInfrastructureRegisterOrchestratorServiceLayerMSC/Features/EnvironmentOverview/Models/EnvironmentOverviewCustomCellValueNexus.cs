namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // One cell's value for one (row, custom column) pair - every type's
    // value is stored as its plain string form (Number/Date included), the
    // same philosophy every FIXED text column on EnvironmentOverviewNexus
    // already follows (Purpose, Priority1-3, etc. are all plain nullable
    // text today too). Composite-keyed on (EnvironmentOverviewId,
    // CustomColumnId) - see ApplicationDatabaseContext.OnModelCreating -
    // since a row only ever has at most one value per custom column.
    public sealed class EnvironmentOverviewCustomCellValueNexus
    {
        public Guid EnvironmentOverviewId { get; set; }

        public Guid CustomColumnId { get; set; }

        public string? Value { get; set; }
    }
}
