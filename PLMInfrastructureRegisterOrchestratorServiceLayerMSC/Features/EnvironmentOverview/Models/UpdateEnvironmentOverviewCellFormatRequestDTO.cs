namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class EnvironmentOverviewCellFormatTargetDTO
    {
        public Guid EnvironmentOverviewId { get; set; }

        public string ColumnKey { get; set; } = string.Empty;
    }

    // Mirrors UpdateResourceCellFormatRequestDTO field-for-field - a merge,
    // not a replace. See that type's own comment for why IsBold/IsItalic are
    // tri-state and ClearBackgroundColor is its own explicit flag.
    public sealed class UpdateEnvironmentOverviewCellFormatRequestDTO
    {
        public List<EnvironmentOverviewCellFormatTargetDTO> Cells { get; set; } = new();

        public bool? IsBold { get; set; }

        public bool? IsItalic { get; set; }

        public bool? IsUnderline { get; set; }

        public string? BackgroundColorKey { get; set; }

        public int? BackgroundOpacity { get; set; }

        public bool ClearBackgroundColor { get; set; }

        public string? TextColorKey { get; set; }

        public bool ClearTextColor { get; set; }
    }
}
