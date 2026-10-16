namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    // One entry in the "ResourceTableLegend" growable options list - the
    // Infrastructure Register page's own legend row (not tied to any actual
    // table-column coloring; purely a labeled reference list the user
    // manages). Mirrors CustomColorOptionDTO's own shape/storage convention
    // exactly (see ResourceTableLegendService's own comment for why), plus
    // IsSystemLegend for the two seeded entries whose colors are structurally
    // tied to this app's real header-coloring logic elsewhere and so can
    // never be edited or deleted through this feature.
    public sealed class LegendEntryDTO
    {
        public Guid Id { get; set; }

        public string? Name { get; set; }

        // "HEX" or "RGB" - how the color was originally entered, same
        // convention as CustomColorOptionDTO.
        public string? Format { get; set; }

        public string? Color { get; set; }

        public bool IsSystemLegend { get; set; }

        // AnonymousClientIdentityUtility's client id - null for the two
        // system-seeded entries, since there's no real authentication system
        // in this app yet.
        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
