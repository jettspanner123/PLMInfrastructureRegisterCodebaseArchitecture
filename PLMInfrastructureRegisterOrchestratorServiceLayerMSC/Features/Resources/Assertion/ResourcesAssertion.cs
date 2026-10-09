using System.Reflection;
using System.Text.RegularExpressions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Assertion
{
    public sealed class ResourcesAssertion
    {
        private static readonly ResourcesAssertion _current = new ResourcesAssertion();

        public static ResourcesAssertion Current => _current;

        private ResourcesAssertion()
        {
        }

        // The 4 original fixed colors, plus any growable custom color a user
        // has added via the "Add Color" modal (see
        // ConfigurationConstantsAssertion's "ResourceCellFormatColor" field -
        // stored the same growable-options way as Status/Sponsor). A custom
        // color is a raw "#RRGGBB" hex string rather than a name, so it's
        // recognized by SHAPE here instead of requiring a database lookup to
        // confirm it was actually added through that modal first - there's
        // no safety reason to restrict this to only previously-registered
        // hex values, since persisting an arbitrary valid hex color carries
        // no risk beyond what persisting any other free-text value already
        // does elsewhere in this app.
        private static readonly HashSet<string> AllowedNamedBackgroundColorKeys = new(StringComparer.Ordinal)
        {
            "Yellow",
            "Green",
            "Blue",
            "Red",
        };

        private static readonly Regex HexColorPattern = new(@"^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

        private static bool IsValidBackgroundColorKey(string colorKey) =>
            AllowedNamedBackgroundColorKeys.Contains(colorKey) || HexColorPattern.IsMatch(colorKey);

        // Reflection against ResourceNexus's own property names rather than a
        // hand-maintained string list - this entity has ~60 properties and a
        // second, separately-maintained allow-list would inevitably drift out
        // of sync as columns are added. ColumnKey arrives camelCase (matching
        // ResourceColumnCON's own keys on the frontend) while the C# property
        // is PascalCase, so the comparison is case-insensitive.
        private static readonly HashSet<string> ResourceColumnKeys = new(
            typeof(ResourceNexus).GetProperties(BindingFlags.Public | BindingFlags.Instance).Select(p => p.Name),
            StringComparer.OrdinalIgnoreCase);

        public void AssertUpdateCellFormatRequest(UpdateResourceCellFormatRequestDTO? request)
        {
            if (request is null || request.Cells is null || request.Cells.Count == 0)
            {
                throw new ValidationException("At least one cell must be provided.");
            }

            foreach (ResourceCellFormatTargetDTO cell in request.Cells)
            {
                if (cell.ResourceId == Guid.Empty)
                {
                    throw new ValidationException("Every cell must have a valid ResourceId.");
                }

                if (string.IsNullOrWhiteSpace(cell.ColumnKey) || !ResourceColumnKeys.Contains(cell.ColumnKey))
                {
                    throw new ValidationException($"'{cell.ColumnKey}' is not a recognized column.");
                }
            }

            if (request.BackgroundColorKey is not null && !IsValidBackgroundColorKey(request.BackgroundColorKey))
            {
                throw new ValidationException($"'{request.BackgroundColorKey}' is not a valid background color.");
            }

            if (request.IsBold is null && request.IsItalic is null && request.BackgroundColorKey is null && !request.ClearBackgroundColor)
            {
                throw new ValidationException("At least one formatting change must be provided.");
            }
        }

        public void AssertAddCustomColorOptionRequest(AddCustomColorOptionRequestDTO? request)
        {
            if (request is null
                || string.IsNullOrWhiteSpace(request.ColorName)
                || string.IsNullOrWhiteSpace(request.Format)
                || string.IsNullOrWhiteSpace(request.Color)
                || string.IsNullOrWhiteSpace(request.CreatedByClientId))
            {
                throw new ValidationException("ColorName, Format, Color, and CreatedByClientId are all required.");
            }

            if (!ResourceCellFormatColorUtility.Current.IsValidFormat(request.Format))
            {
                throw new ValidationException($"'{request.Format}' is not a valid color format.");
            }

            if (!ResourceCellFormatColorUtility.Current.IsValidColorForFormat(request.Color, request.Format))
            {
                throw new ValidationException($"'{request.Color}' is not a valid {request.Format} color.");
            }
        }
    }
}
