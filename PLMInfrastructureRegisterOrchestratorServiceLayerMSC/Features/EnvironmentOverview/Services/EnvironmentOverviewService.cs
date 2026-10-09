using System.Globalization;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services
{
    public sealed class EnvironmentOverviewService
    {
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;

        public EnvironmentOverviewService(ApplicationDatabaseContext applicationDatabaseContext)
        {
            _applicationDatabaseContext = applicationDatabaseContext;
        }

        public async Task<List<EnvironmentOverviewDTO>> GetEnvironmentOverviewsAsynchronous()
        {
            List<EnvironmentOverviewNexus> environments = await _applicationDatabaseContext
                .EnvironmentOverviews
                .AsNoTracking()
                .OrderBy(environment => environment.DisplayOrder)
                .ToListAsync();

            return environments
                .Select(environment => new EnvironmentOverviewDTO
                {
                    Id = environment.Id,
                    Environment = environment.Environment,
                    Purpose = environment.Purpose,
                    Sponsor = environment.Sponsor,
                    CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                    Priority1 = environment.Priority1,
                    Priority2 = environment.Priority2,
                    Priority3 = environment.Priority3,
                    ActionItemsUpdates = environment.ActionItemsUpdates,
                    ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                    DNSURL = environment.DNSURL,
                    Status = environment.Status,
                })
                .ToList();
        }

        public async Task<EnvironmentOverviewDTO> CreateEnvironmentOverviewAsynchronous(CreateEnvironmentOverviewRequestDTO request)
        {
            bool hasExistingRows = await _applicationDatabaseContext.EnvironmentOverviews.AnyAsync();
            int nextDisplayOrder = hasExistingRows
                ? await _applicationDatabaseContext.EnvironmentOverviews.MaxAsync(environment => environment.DisplayOrder) + 1
                : 1;

            EnvironmentOverviewNexus newEnvironment = new()
            {
                Id = Guid.NewGuid(),
                DisplayOrder = nextDisplayOrder,
                Environment = request.Environment,
                Purpose = request.Purpose,
                Sponsor = request.Sponsor,
                CurrentUptimeSchedule = request.CurrentUptimeSchedule,
                Priority1 = request.Priority1,
                Priority2 = request.Priority2,
                Priority3 = request.Priority3,
                ActionItemsUpdates = request.ActionItemsUpdates,
                ConfigurationCustomisationVersion = request.ConfigurationCustomisationVersion,
                DNSURL = request.DNSURL,
                Status = "Live",
            };

            _applicationDatabaseContext.EnvironmentOverviews.Add(newEnvironment);
            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = newEnvironment.Id,
                Environment = newEnvironment.Environment,
                Purpose = newEnvironment.Purpose,
                Sponsor = newEnvironment.Sponsor,
                CurrentUptimeSchedule = newEnvironment.CurrentUptimeSchedule,
                Priority1 = newEnvironment.Priority1,
                Priority2 = newEnvironment.Priority2,
                Priority3 = newEnvironment.Priority3,
                ActionItemsUpdates = newEnvironment.ActionItemsUpdates,
                ConfigurationCustomisationVersion = newEnvironment.ConfigurationCustomisationVersion,
                DNSURL = newEnvironment.DNSURL,
                Status = newEnvironment.Status,
            };
        }

        // configurationKey is already resolved from the public fieldName via
        // EnvironmentOverviewAssertion.AssertOptionsFieldName before either
        // of these run - shared by Status and Sponsor (and any future
        // growable-dropdown field) rather than one GetXOptions/AddXOption
        // pair per field.
        public async Task<EnvironmentOverviewDTO> UpdateStatusAsynchronous(Guid id, string status, string changedByClientId)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            string previousStatus = environment.Status;
            environment.Status = status;

            _applicationDatabaseContext.EnvironmentOverviewStatusHistories.Add(new EnvironmentOverviewStatusHistoryNexus
            {
                Id = Guid.NewGuid(),
                EnvironmentOverviewId = environment.Id,
                PreviousStatus = previousStatus,
                NewStatus = status,
                ChangedByClientId = changedByClientId,
                ChangedAt = DateTime.UtcNow,
            });

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // New entries are prepended, not appended - matches the source
        // data's own existing newest-first convention (every real entry in
        // this column reads top-to-bottom as newest-to-oldest). The date
        // prefix format ("dd-MMM-yyyy") matches ActionItemsLineParserUtility's
        // own normalized display format on the frontend exactly, so this
        // new entry parses and renders identically to every pre-existing one.
        public async Task<EnvironmentOverviewDTO> AddActionItemAsynchronous(Guid id, string note)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            string formattedDate = DateTime.UtcNow.ToString("dd-MMM-yyyy", CultureInfo.InvariantCulture);
            string newLine = $"{formattedDate}: {note.Trim()}";

            environment.ActionItemsUpdates = string.IsNullOrEmpty(environment.ActionItemsUpdates)
                ? newLine
                : $"{newLine}\n{environment.ActionItemsUpdates}";

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // lineIndex is the entry's position in the current line-split list,
        // exactly as the frontend is already displaying it (every "visible"
        // line is always a genuine prefix of the full list - see
        // EnvironmentOverviewScreenController.getVisibleActionItemsLines -
        // so a line's position within the collapsed view is already its true
        // position in the full list, no separate index translation needed).
        // No per-entry identity exists in this single free-text column, so
        // this is a straightforward hard delete of that line - there's no
        // equivalent of IsDecommissioned's soft-delete pattern for one line
        // within a text blob the way there is for a whole row.
        public async Task<EnvironmentOverviewDTO> DeleteActionItemAsynchronous(Guid id, int lineIndex)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            List<string> lines = (environment.ActionItemsUpdates ?? string.Empty)
                .Split('\n')
                .ToList();

            if (lineIndex < 0 || lineIndex >= lines.Count)
            {
                throw new ValidationException("That entry no longer exists - it may have already been changed or removed.");
            }

            lines.RemoveAt(lineIndex);
            environment.ActionItemsUpdates = lines.Count > 0 ? string.Join("\n", lines) : null;

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // FieldName is already validated against the allow-list in
        // EnvironmentOverviewAssertion.AssertUpdateFieldRequest before this
        // runs - the switch below is exhaustive over that same allow-list,
        // so the default branch is unreachable in practice, not a silent
        // fallback for an unvalidated value.
        public async Task<EnvironmentOverviewDTO> UpdateFieldAsynchronous(Guid id, string fieldName, string? value)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            string? normalisedValue = string.IsNullOrWhiteSpace(value) ? null : value.Trim();

            switch (fieldName)
            {
                case "Purpose":
                    environment.Purpose = normalisedValue;
                    break;
                case "Sponsor":
                    environment.Sponsor = normalisedValue;
                    break;
                case "Priority1":
                    environment.Priority1 = normalisedValue;
                    break;
                case "Priority2":
                    environment.Priority2 = normalisedValue;
                    break;
                case "Priority3":
                    environment.Priority3 = normalisedValue;
                    break;
                case "DNSURL":
                    environment.DNSURL = normalisedValue;
                    break;
                default:
                    throw new ValidationException($"'{fieldName}' is not an editable field.");
            }

            await _applicationDatabaseContext.SaveChangesAsync();

            return new EnvironmentOverviewDTO
            {
                Id = environment.Id,
                Environment = environment.Environment,
                Purpose = environment.Purpose,
                Sponsor = environment.Sponsor,
                CurrentUptimeSchedule = environment.CurrentUptimeSchedule,
                Priority1 = environment.Priority1,
                Priority2 = environment.Priority2,
                Priority3 = environment.Priority3,
                ActionItemsUpdates = environment.ActionItemsUpdates,
                ConfigurationCustomisationVersion = environment.ConfigurationCustomisationVersion,
                DNSURL = environment.DNSURL,
                Status = environment.Status,
            };
        }

        // Soft delete - sets IsDeleted/DeletedAt rather than removing the
        // row (see EnvironmentOverviewNexus.IsDeleted). The global query
        // filter on this entity means every other query already behaves as
        // if the row is gone, without this method needing to touch
        // anything else (Status History rows, column widths, etc. are left
        // exactly as they were).
        public async Task DeleteEnvironmentOverviewAsynchronous(Guid id)
        {
            EnvironmentOverviewNexus? environment = await _applicationDatabaseContext.EnvironmentOverviews
                .FirstOrDefaultAsync(existingEnvironment => existingEnvironment.Id == id);

            if (environment is null)
            {
                throw new NotFoundException("That environment could not be found.");
            }

            environment.IsDeleted = true;
            environment.DeletedAt = DateTime.UtcNow;

            await _applicationDatabaseContext.SaveChangesAsync();
        }
    }
}
