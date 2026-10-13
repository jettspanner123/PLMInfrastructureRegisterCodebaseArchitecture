namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class EnvironmentOverviewCellFormatDTO
    {
        public Guid EnvironmentOverviewId { get; set; }

        public string ColumnKey { get; set; } = string.Empty;

        public bool IsBold { get; set; }

        public bool IsItalic { get; set; }

        public string? BackgroundColorKey { get; set; }
        public int BackgroundOpacity { get; set; }
        public string? TextColorKey { get; set; }
    }
}
