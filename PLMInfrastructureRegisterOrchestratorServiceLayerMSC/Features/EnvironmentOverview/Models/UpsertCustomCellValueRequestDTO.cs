namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class UpsertCustomCellValueRequestDTO
    {
        // Null/blank clears the cell. Validated against the column's own
        // ColumnType server-side (e.g. must parse as a number for a Number
        // column) before being stored as plain text either way.
        public string? Value { get; set; }
    }
}
