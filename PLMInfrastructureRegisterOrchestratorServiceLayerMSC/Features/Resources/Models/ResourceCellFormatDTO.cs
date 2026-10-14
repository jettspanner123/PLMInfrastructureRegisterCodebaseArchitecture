namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    public sealed class ResourceCellFormatDTO
    {
        public Guid ResourceId { get; set; }

        public string ColumnKey { get; set; } = string.Empty;

        public bool IsBold { get; set; }

        public bool IsItalic { get; set; }

        public bool IsUnderline { get; set; }

        public string? BackgroundColorKey { get; set; }
        public int BackgroundOpacity { get; set; }
        public string? TextColorKey { get; set; }
    }
}
