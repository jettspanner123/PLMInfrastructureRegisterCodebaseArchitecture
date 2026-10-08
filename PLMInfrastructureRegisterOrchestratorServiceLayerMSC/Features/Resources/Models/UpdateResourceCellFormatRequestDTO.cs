namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    public sealed class ResourceCellFormatTargetDTO
    {
        public Guid ResourceId { get; set; }

        public string ColumnKey { get; set; } = string.Empty;
    }

    // A merge, not a replace - only the fields actually provided get applied
    // to every targeted cell, so (for example) toggling Bold on a cell that
    // already has a background color never touches that color. IsBold/
    // IsItalic are tri-state (null = leave as-is) for exactly this reason.
    // Background color has no natural null-means-leave-as-is reading since
    // "no color" is itself a valid state a user can choose, so clearing it
    // is its own explicit flag rather than overloading BackgroundColorKey.
    public sealed class UpdateResourceCellFormatRequestDTO
    {
        public List<ResourceCellFormatTargetDTO> Cells { get; set; } = new();

        public bool? IsBold { get; set; }

        public bool? IsItalic { get; set; }

        public string? BackgroundColorKey { get; set; }

        public bool ClearBackgroundColor { get; set; }
    }
}
