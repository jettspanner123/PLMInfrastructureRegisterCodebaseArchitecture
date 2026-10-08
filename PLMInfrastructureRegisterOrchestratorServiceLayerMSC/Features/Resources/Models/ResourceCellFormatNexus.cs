namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    // One row per (Resource, column) that has ANY non-default formatting
    // applied via the table's right-click context menu - sparse by design,
    // not one row per cell that exists. A cell with no row here is simply
    // unformatted (not bold, not italic, no background color).
    //
    // ColumnKey mirrors ResourceColumnCON.COLUMNS' own keys on the frontend
    // (e.g. "hostname", "status") - not a foreign key to anything, just a
    // string identifying which column this row's formatting applies to.
    //
    // BackgroundColorKey is a named token ("Yellow"/"Green"/"Blue"/"Red"),
    // not a raw hex value - the frontend maps each key to its own light/dark
    // Tailwind class pair, so a persisted color still looks right regardless
    // of which theme the viewer is in. Null means no background color.
    public sealed class ResourceCellFormatNexus
    {
        public Guid Id { get; set; }

        public Guid ResourceId { get; set; }

        public string ColumnKey { get; set; } = string.Empty;

        public bool IsBold { get; set; }

        public bool IsItalic { get; set; }

        public string? BackgroundColorKey { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
