using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview
{
    [ApiController]
    [Route(ApplicationRouteFactory.EnvironmentOverviewRoutes.ControllerURL)]
    public sealed class EnvironmentOverviewController : ControllerBase
    {
        private readonly EnvironmentOverviewService _environmentOverviewService;
        private readonly ILogger<EnvironmentOverviewController> _logger;

        public EnvironmentOverviewController(
            EnvironmentOverviewService environmentOverviewService,
            ILogger<EnvironmentOverviewController> logger)
        {
            _environmentOverviewService = environmentOverviewService;
            _logger = logger;
        }

        [HttpGet(ApplicationRouteFactory.EnvironmentOverviewRoutes.GetAllEnvironmentOverviews)]
        public async Task<ActionResult<APIResponse<List<EnvironmentOverviewDTO>>>> GetAllEnvironmentOverviewsAsynchronous()
        {
            try
            {
                List<EnvironmentOverviewDTO> environments = await _environmentOverviewService.GetEnvironmentOverviewsAsynchronous();

                return Ok(
                    APIResponse<List<EnvironmentOverviewDTO>>.Succeeded(
                        environments,
                        "Environment overviews retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving environment overviews.");

                return StatusCode(
                    500,
                    APIResponse<List<EnvironmentOverviewDTO>>.Failed(
                        "An unexpected error occurred while retrieving environment overviews.",
                        new List<string>(),
                        500));
            }
        }
    }
}
