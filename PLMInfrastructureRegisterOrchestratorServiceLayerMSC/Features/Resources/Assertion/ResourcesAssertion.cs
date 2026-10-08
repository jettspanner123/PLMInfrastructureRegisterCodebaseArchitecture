using System.Reflection;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Assertion
{
    public sealed class ResourcesAssertion
    {
        private static readonly ResourcesAssertion _current = new ResourcesAssertion();

        public static ResourcesAssertion Current => _current;

        private ResourcesAssertion()
        {
        }

        // Fixed, non-growable (unlike Status/Sponsor's own option lists) -
        // the request asked for exactly 4 colors, not a user-extensible set.
        private static readonly HashSet<string> AllowedBackgroundColorKeys = new(StringComparer.Ordinal)
        {
            "Yellow",
            "Green",
            "Blue",
            "Red",
        };

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

            if (request.BackgroundColorKey is not null && !AllowedBackgroundColorKeys.Contains(request.BackgroundColorKey))
            {
                throw new ValidationException($"'{request.BackgroundColorKey}' is not a valid background color.");
            }

            if (request.IsBold is null && request.IsItalic is null && request.BackgroundColorKey is null && !request.ClearBackgroundColor)
            {
                throw new ValidationException("At least one formatting change must be provided.");
            }
        }
    }
}
