namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models.Classes
{
    // A central, generic place to store app-wide constant option-lists (e.g.
    // ENVIRONMENT_TAGS below) - one row per ConfigurationKey, with
    // ConfigurationValue holding a JSON-serialized array of the actual
    // values. Matches AssetSphere's ConfigurationConstantEntityClass
    // (its own WORK_LOCATIONS/EMPLOYEE_DESIGNATIONS keys use this same
    // shape), adapted to this project's own naming/entity conventions.
    public sealed class ConfigurationConstantClass
    {
        public Guid Id { get; set; }

        public string ConfigurationKey { get; set; } = string.Empty;

        public string ConfigurationValue { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
