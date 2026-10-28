namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class InsertRowRequestDTO
    {
        // Null means "at the very end/start" (used by the toolbar's "Add
        // Environment" button, which has no specific row to insert relative
        // to) - otherwise the row to insert directly above/below.
        public Guid? RelativeToId { get; set; }

        // "Above" or "Below". With RelativeToId null, "Below" means append
        // to the very end (the toolbar button's behavior) and "Above" means
        // prepend to the very start.
        public string? Direction { get; set; }
    }
}
