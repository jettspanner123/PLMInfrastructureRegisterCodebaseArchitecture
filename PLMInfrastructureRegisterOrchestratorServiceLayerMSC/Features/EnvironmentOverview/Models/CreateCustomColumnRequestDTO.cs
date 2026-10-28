namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class CreateCustomColumnRequestDTO
    {
        // Either one of the fixed column keys (e.g. "purpose", "status" -
        // see EnvironmentOverviewFixedColumnAnchor) or an existing custom
        // column's Id (as a string) - whichever column the user right-clicked
        // or opened this header's menu from.
        public string? RelativeToColumnKey { get; set; }

        // "Left" or "Right" - validated against EnvironmentOverviewAssertion's
        // own allow-list, not a compiled enum, matching this request DTO's
        // existing sibling patterns elsewhere in this feature (e.g. Status).
        public string? Direction { get; set; }

        public string? ColumnType { get; set; }
    }
}
