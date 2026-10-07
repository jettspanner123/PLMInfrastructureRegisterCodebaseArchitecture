using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
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
                    IsDecommissioned = environment.IsDecommissioned,
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
                IsDecommissioned = false,
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
                IsDecommissioned = newEnvironment.IsDecommissioned,
            };
        }
    }
}
