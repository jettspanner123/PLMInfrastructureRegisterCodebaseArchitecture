namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    // One entry in the "ResourceCellFormatColor" growable options list. Unlike
    // Status/Sponsor's plain display-string entries, a color needs more than
    // one field - so its "value" inside the shared ConfigurationConstants
    // options list (see ConfigurationConstantsService) is this object
    // JSON-serialized, rather than a bare string. ConfigurationConstantsService
    // itself stays unaware of this shape; it only ever sees opaque strings.
    public sealed class CustomColorOptionDTO
    {
        public string? ColorName { get; set; }

        // "HEX" or "RGB" - how the user originally entered this color.
        public string? Format { get; set; }

        // "#RRGGBB" when Format is "HEX", "R,G,B" (0-255 each) when Format is
        // "RGB" - never read back out onto an actual resource cell directly;
        // a cell's own BackgroundColorKey is always normalized to hex at
        // apply-time on the frontend regardless of this entry's Format.
        public string? Color { get; set; }

        // AnonymousClientIdentityUtility's client id - there's no real
        // authentication system in this app yet.
        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
