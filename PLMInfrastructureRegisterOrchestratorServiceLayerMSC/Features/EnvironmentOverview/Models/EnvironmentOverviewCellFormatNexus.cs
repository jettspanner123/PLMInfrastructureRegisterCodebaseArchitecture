namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // Mirrors ResourceCellFormatNexus field-for-field, keyed by
    // EnvironmentOverviewId instead of ResourceId - one row per
    // (EnvironmentOverview, column) that has ANY non-default formatting
    // applied via the table's right-click context menu, sparse by design.
    //
    // ColumnKey mirrors EnvironmentOverviewCON.COLUMNS' own keys on the
    // frontend (e.g. "purpose", "status") - not a foreign key to anything,
    // just a string identifying which column this row's formatting applies to.
    public sealed class EnvironmentOverviewCellFormatNexus
    {
        public Guid Id { get; set; }

        public Guid EnvironmentOverviewId { get; set; }

        public string ColumnKey { get; set; } = string.Empty;

        public bool IsBold { get; set; }

        public bool IsItalic { get; set; }

        public bool IsUnderline { get; set; }

        public string? BackgroundColorKey { get; set; }

        public int BackgroundOpacity { get; set; } = 100;

        public string? TextColorKey { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
