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

                // A custom column's key is its Id (a Guid) rather than a
                // fixed property name - accepted here on shape alone (no
                // live existence check) since ColumnKey has never been a
                // real foreign key for this sidecar table, only ever a
                // plain string identifying which column formatting applies
                // to. A bogus Guid just produces a harmless orphan row.
                bool isRecognizedFixedColumn = !string.IsNullOrWhiteSpace(cell.ColumnKey) && EnvironmentOverviewColumnKeys.Contains(cell.ColumnKey);
                bool isPlausibleCustomColumn = !string.IsNullOrWhiteSpace(cell.ColumnKey) && Guid.TryParse(cell.ColumnKey, out _);

                if (!isRecognizedFixedColumn && !isPlausibleCustomColumn)
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

        public void AssertUpdateActionItemRequest(UpdateActionItemRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.ReplacementLineText))
            {
                throw new ValidationException("A note must be provided.");
            }
        }

        // The only columns this generic single-field endpoint is allowed to
        // touch - anything else (Status, ActionItemsUpdates, etc.) has its
        // own dedicated endpoint with its own business rules and must never
        // be reachable through this one.
        private static readonly HashSet<string> AllowedUpdateFieldNames = new(StringComparer.Ordinal)
        {
            "Environment",
            "Purpose",
            "Sponsor",
            "CurrentUptimeSchedule",
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

            // Environment is the one field on this allow-list that isn't
            // nullable in the database - it's the row's own identifying
            // label throughout the page, so unlike Purpose/Priority/DNSURL
            // (blank is just "not set yet"), a blank Environment would leave
            // the row with no name at all. Same required-field treatment as
            // AssertAddActionItemRequest/AssertUpdateStatusRequest above.
            if (request.FieldName == "Environment" && string.IsNullOrWhiteSpace(request.Value))
            {
                throw new ValidationException("An Environment name must be provided.");
            }
        }

        // Both CurrentUptimeSchedule and UptimeScheduleNote are independently
        // optional - an empty schedule with no note is a legitimate "cleared"
        // state - so this only requires the request itself to be present.
        public void AssertUpdateUptimeScheduleRequest(UpdateUptimeScheduleRequestDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("A request body must be provided.");
            }
        }

        private static readonly HashSet<string> AllowedInsertDirections = new(StringComparer.Ordinal) { "Above", "Below" };

        public void AssertInsertRowRequest(InsertRowRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Direction))
            {
                throw new ValidationException("A Direction must be provided.");
            }

            if (!AllowedInsertDirections.Contains(request.Direction))
            {
                throw new ValidationException("Direction must be 'Above' or 'Below'.");
            }
        }

        private static readonly HashSet<string> AllowedColumnInsertDirections = new(StringComparer.Ordinal) { "Left", "Right" };

        public void AssertCreateCustomColumnRequest(CreateCustomColumnRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.RelativeToColumnKey))
            {
                throw new ValidationException("A RelativeToColumnKey must be provided.");
            }

            if (string.IsNullOrWhiteSpace(request.Direction) || !AllowedColumnInsertDirections.Contains(request.Direction))
            {
                throw new ValidationException("Direction must be 'Left' or 'Right'.");
            }

            if (string.IsNullOrWhiteSpace(request.ColumnType) || !Enum.TryParse<CustomColumnTypeEnum>(request.ColumnType, out _))
            {
                throw new ValidationException("ColumnType must be one of Text, Number, Date, or Dropdown.");
            }
        }

        // A blank HeaderName is allowed through here (not rejected) - the
        // service falls back to a placeholder like "New Column" rather than
        // leaving a column with no label at all, matching how a blank
        // auto-placeholder row name is handled too.
        public void AssertUpdateCustomColumnHeaderRequest(UpdateCustomColumnHeaderRequestDTO? request)
        {
            if (request is null)
            {
                throw new ValidationException("A request body must be provided.");
            }
        }

        public void AssertAddCustomColumnOptionRequest(AddCustomColumnOptionRequestDTO? request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Value))
            {
                throw new ValidationException("A Value must be provided.");
            }
        }

        // columnType is supplied by the caller (looked up from the live
        // column row), not the request itself - the same value is never
        // client-supplied twice, so there's nothing to cross-check it
        // against here beyond using it to validate Value's shape.
        public void AssertUpsertCustomCellValueRequest(UpsertCustomCellValueRequestDTO? request, CustomColumnTypeEnum columnType)
        {
            if (request is null)
            {
                throw new ValidationException("A request body must be provided.");
            }

            if (string.IsNullOrWhiteSpace(request.Value))
            {
                return;
            }

            switch (columnType)
            {
                case CustomColumnTypeEnum.Number:
                    if (!double.TryParse(request.Value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out _))
                    {
                        throw new ValidationException("That value is not a valid number.");
                    }
                    break;
                case CustomColumnTypeEnum.Date:
                    if (!DateOnly.TryParse(request.Value, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out _))
                    {
                        throw new ValidationException("That value is not a valid date.");
                    }
                    break;
            }
        }
    }
}
