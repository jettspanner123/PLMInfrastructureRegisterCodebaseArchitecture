using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services
{
    // Read-only for now - this table is meant to become user-editable later,
    // but only fetch/display is in scope today.
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
    }
}
