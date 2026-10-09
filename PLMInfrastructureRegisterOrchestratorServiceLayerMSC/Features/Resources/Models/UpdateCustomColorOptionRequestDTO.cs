namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    // Rename and recolor are the same operation here - the Settings page's
    // "Editing" tab edits a color's name and value together in one form, so
    // there's no reason to split them into two endpoints.
    public sealed class UpdateCustomColorOptionRequestDTO
    {
        public string? ColorName { get; set; }

        public string? Format { get; set; }

        public string? Color { get; set; }
    }
}
