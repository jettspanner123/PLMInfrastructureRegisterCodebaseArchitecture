using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services
{
    public sealed class ResourcesService
    {
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;

        public ResourcesService(ApplicationDatabaseContext applicationDatabaseContext)
        {
            _applicationDatabaseContext = applicationDatabaseContext;
        }

        public async Task<List<ResourceNexus>> GetAllResourcesAsynchronous()
        {
            return await _applicationDatabaseContext.Resources
                .AsNoTracking()
                .OrderBy(resource => resource.Hostname)
                .ToListAsync();
        }
    }
}
