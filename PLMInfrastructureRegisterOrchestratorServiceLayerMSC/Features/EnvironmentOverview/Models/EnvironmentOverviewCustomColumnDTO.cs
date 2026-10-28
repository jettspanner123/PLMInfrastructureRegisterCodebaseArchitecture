namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class EnvironmentOverviewCustomColumnDTO
    {
        public Guid Id { get; set; }

        public string HeaderName { get; set; } = string.Empty;

        public string ColumnType { get; set; } = string.Empty;

        public double Position { get; set; }

        // Populated only for Dropdown-type columns (empty list otherwise) -
        // each option's own id isn't needed client-side, only its text.
        public List<string> Options { get; set; } = new();
    }
}
