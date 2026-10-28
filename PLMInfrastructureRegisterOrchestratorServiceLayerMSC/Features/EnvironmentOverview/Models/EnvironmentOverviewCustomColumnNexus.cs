namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // A user-added column on the Environment Overview table - sits alongside
    // (never replaces) the fixed, compile-time-typed columns on
    // EnvironmentOverviewNexus. Position is a fractional ordering value in
    // the SAME unified scheme the fixed columns' own anchor constants live
    // in on the frontend (see EnvironmentOverviewCON.FIXED_COLUMN_ANCHORS) -
    // merging both by Position is what produces one single column order.
    public sealed class EnvironmentOverviewCustomColumnNexus
    {
        public Guid Id { get; set; }

        public string HeaderName { get; set; } = string.Empty;

        // Permanent after creation - no type-change UI exists for this
        // column, so cell values never need to be migrated between types.
        public CustomColumnTypeEnum ColumnType { get; set; }

        public double Position { get; set; }

        public DateTime CreatedAt { get; set; }

        // Soft delete, same convention as every other entity in this app -
        // a deleted column's cell values are never touched, just hidden
        // behind the global query filter (see
        // ApplicationDatabaseContext.OnModelCreating).
        public bool IsDeleted { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
