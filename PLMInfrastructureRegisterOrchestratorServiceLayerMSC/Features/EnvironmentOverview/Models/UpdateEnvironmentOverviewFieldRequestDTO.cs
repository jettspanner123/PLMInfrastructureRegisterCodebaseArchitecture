namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // A single generic endpoint for the five plain free-text columns this
    // table made editable (Purpose, Priority1-3, DNSURL), rather than five
    // near-identical dedicated endpoints/DTOs/service methods - unlike
    // Status, none of these fields have their own distinct business rules
    // (a controlled option list, a history log) that would justify the
    // duplication. FieldName is validated server-side against a fixed
    // allow-list (see EnvironmentOverviewAssertion.AssertUpdateFieldRequest)
    // so this never becomes a way to write to an arbitrary column.
    public sealed class UpdateEnvironmentOverviewFieldRequestDTO
    {
        public string? FieldName { get; set; }

        public string? Value { get; set; }
    }
}
