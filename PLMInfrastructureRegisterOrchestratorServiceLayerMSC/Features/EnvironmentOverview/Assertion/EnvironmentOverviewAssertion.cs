using System.Reflection;
using System.Text.RegularExpressions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Assertion
{
    public sealed class EnvironmentOverviewAssertion
    {
        private static readonly EnvironmentOverviewAssertion _current =
            new EnvironmentOverviewAssertion();

        public static EnvironmentOverviewAssertion Current => _current;

        private EnvironmentOverviewAssertion()
        {
        }

        // Same allow-list and validation as ResourcesAssertion's own (see
        // that type's comment) - duplicated rather than shared, matching
        // this codebase's existing pattern of one independent Assertion
        // class per feature.
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

        private static readonly HashSet<string> AllowedTextColorKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "default",
            "white",
            "black",
            "red",
            "yellow",
            "green",
            "orange",
            "violet",
        };

        private static bool IsValidTextColorKey(string textColorKey) =>
            AllowedTextColorKeys.Contains(textColorKey);

        private static readonly HashSet<string> EnvironmentOverviewColumnKeys = new(
            typeof(EnvironmentOverviewNexus).GetProperties(BindingFlags.Public | BindingFlags.Instance).Select(p => p.Name),
            StringComparer.OrdinalIgnoreCase);

        public void AssertUpdateCellFormatRequest(UpdateEnvironmentOverviewCellFormatRequestDTO? request)
        {
            if (request is null || request.Cells is null || request.Cells.Count == 0)
            {
                throw new ValidationException("At least one cell must be provided.");
            }

            foreach (EnvironmentOverviewCellFormatTargetDTO cell in request.Cells)
            {
                if (cell.EnvironmentOverviewId == Guid.Empty)
                {
                    throw new ValidationException("Every cell must have a valid EnvironmentOverviewId.");
                }

                if (string.IsNullOrWhiteSpace(cell.ColumnKey) || !EnvironmentOverviewColumnKeys.Contains(cell.ColumnKey))
                {
                    throw new ValidationException($"'{cell.ColumnKey}' is not a recognized column.");
                }
            }

            if (request.BackgroundColorKey is not null && !IsValidBackgroundColorKey(request.BackgroundColorKey))
            {
                throw new ValidationException($"'{request.BackgroundColorKey}' is not a valid background color.");
            }

            if (request.BackgroundOpacity.HasValue && (request.BackgroundOpacity.Value < 0 || request.BackgroundOpacity.Value > 100))
            {
                throw new ValidationException("Background opacity must be between 0 and 100.");
            }

            if (request.TextColorKey is not null && !IsValidTextColorKey(request.TextColorKey))
            {
                throw new ValidationException($"'{request.TextColorKey}' is not a valid text color.");
            }

            if (request.IsBold is null && request.IsItalic is null && request.IsUnderline is null && request.BackgroundColorKey is null && request.BackgroundOpacity is null && !request.ClearBackgroundColor && request.TextColorKey is null && !request.ClearTextColor)
            {
                throw new ValidationException("At least one formatting change must be provided.");
            }
        }

        public void AssertUpdateStatusRequest(UpdateEnvironmentOverviewStatusRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Status))
            {
                throw new ValidationException("A Status must be provided.");
            }

            if (string.IsNullOrWhiteSpace(request.ChangedByClientId))
            {
                throw new ValidationException("A ChangedByClientId must be provided.");
            }
        }

        public void AssertAddActionItemRequest(AddActionItemRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Note))
            {
                throw new ValidationException("A note must be provided.");
            }
        }

        // The only columns this generic single-field endpoint is allowed to
        // touch - anything else (Environment, Status, ActionItemsUpdates,
        // etc.) has its own dedicated endpoint with its own business rules
        // and must never be reachable through this one.
        private static readonly HashSet<string> AllowedUpdateFieldNames = new(StringComparer.Ordinal)
        {
            "Purpose",
            "Sponsor",
            "Priority1",
            "Priority2",
            "Priority3",
            "DNSURL",
        };

        public void AssertUpdateFieldRequest(UpdateEnvironmentOverviewFieldRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.FieldName))
            {
                throw new ValidationException("A FieldName must be provided.");
            }

            if (!AllowedUpdateFieldNames.Contains(request.FieldName))
            {
                throw new ValidationException($"'{request.FieldName}' is not an editable field.");
            }
        }
    }
}
