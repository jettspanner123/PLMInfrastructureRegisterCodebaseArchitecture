using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync
{
    [ApiController]
    [Route(ApplicationRouteFactory.SyncRoutes.ControllerURL)]
    public sealed class SyncController : ControllerBase
    {
        private readonly SyncService _syncService;
        private readonly ILogger<SyncController> _logger;

        public SyncController(SyncService syncService, ILogger<SyncController> logger)
        {
            _syncService = syncService;
            _logger = logger;
        }

        [HttpPost(ApplicationRouteFactory.SyncRoutes.RunSync)]
        public async Task<ActionResult<APIResponse<SyncResult>>> RunSyncAsynchronous()
        {
            try
            {
                SyncResult result = await _syncService.RunAsynchronous();

                return Ok(
                    APIResponse<SyncResult>.Succeeded(
                        result,
                        "Sync completed successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while running Sync.");

                return StatusCode(
                    500,
                    APIResponse<SyncResult>.Failed(
                        "An unexpected error occurred while running Sync.",
                        new List<string>(),
                        500));
            }
        }
    }
}
