using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models.Classes;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services
{
    public sealed class EnvironmentOverviewService
    {
        // Owns the valid Status option list for this table - seeded with
        // "Live"/"Decommissioned", growable at runtime via AddStatusOptionAsynchronous.
        private const string StatusOptionsConfigurationKey = "ENVIRONMENT_OVERVIEW_STATUS_OPTIONS";

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

        public async Task<List<string>> GetStatusOptionsAsynchronous()
        {
            ConfigurationConstantClass? configurationConstant = await _applicationDatabaseContext.ConfigurationConstants
                .AsNoTracking()
                .FirstOrDefaultAsync(constant => constant.ConfigurationKey == StatusOptionsConfigurationKey);

            if (configurationConstant is null) return new List<string>();

            return JsonSerializer.Deserialize<List<string>>(configurationConstant.ConfigurationValue) ?? new List<string>();
        }

        public async Task<List<string>> AddStatusOptionAsynchronous(string status)
        {
            ConfigurationConstantClass? configurationConstant = await _applicationDatabaseContext.ConfigurationConstants
                .FirstOrDefaultAsync(constant => constant.ConfigurationKey == StatusOptionsConfigurationKey);

            if (configurationConstant is null)
            {
                throw new NotFoundException($"Configuration key '{StatusOptionsConfigurationKey}' was not found.");
            }

            List<string> options = JsonSerializer.Deserialize<List<string>>(configurationConstant.ConfigurationValue) ?? new List<string>();

            if (options.Any(existingOption => string.Equals(existingOption, status, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException($"Status option '{status}' already exists.");
            }

            options.Add(status);
            configurationConstant.ConfigurationValue = JsonSerializer.Serialize(options);
            configurationConstant.UpdatedAt = DateTime.UtcNow;
            await _applicationDatabaseContext.SaveChangesAsync();

            return options;
        }

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
    }
}
