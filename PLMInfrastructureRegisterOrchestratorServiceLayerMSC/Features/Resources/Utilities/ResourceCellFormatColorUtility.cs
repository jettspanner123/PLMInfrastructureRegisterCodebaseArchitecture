using System.Linq;
using System.Text.RegularExpressions;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Utilities
{
    // Pure color-shape logic for the "ResourceCellFormatColor" growable
    // options list - feature-specific to Resources' own cell-formatting
    // feature, so this lives here rather than a global Helper (see
    // CODING-RULES.md section 5: don't move feature-specific code into
    // global folders merely because it might theoretically be reusable).
    public sealed class ResourceCellFormatColorUtility
    {
        private static readonly ResourceCellFormatColorUtility _current = new ResourceCellFormatColorUtility();

        public static ResourceCellFormatColorUtility Current => _current;

        private ResourceCellFormatColorUtility()
        {
        }

        private static readonly Regex HexPattern = new(@"^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

        private static readonly Regex RgbTriplePattern = new(@"^(\d{1,3}),(\d{1,3}),(\d{1,3})$", RegexOptions.Compiled);

        public bool IsValidFormat(string format) => format is "HEX" or "RGB";

        public bool IsValidColorForFormat(string color, string format) => format switch
        {
            "HEX" => HexPattern.IsMatch(color),
            "RGB" => IsValidRgbTriple(color),
            _ => false,
        };

        private static bool IsValidRgbTriple(string color)
        {
            Match match = RgbTriplePattern.Match(color);
            if (!match.Success) return false;

            return match.Groups
                .Cast<Group>()
                .Skip(1)
                .All(group => int.TryParse(group.Value, out int component) && component is >= 0 and <= 255);
        }

        // Canonical hex equivalent - used only to detect "the same actual
        // color" across different entry formats (e.g. white entered once as
        // HEX, once as RGB). Never written back onto a resource cell itself;
        // a cell's own BackgroundColorKey is always normalized to hex at
        // apply-time on the frontend, regardless of how a color was entered.
        public string NormalizeToHex(string color, string format)
        {
            if (format == "HEX") return color.ToUpperInvariant();

            string[] parts = color.Split(',');
            int r = int.Parse(parts[0]);
            int g = int.Parse(parts[1]);
            int b = int.Parse(parts[2]);
            return $"#{r:X2}{g:X2}{b:X2}";
        }
    }
}
