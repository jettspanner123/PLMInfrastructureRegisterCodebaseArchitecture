using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources
{
    [ApiController]
    [Route(ApplicationRouteFactory.ResourcesRoutes.ControllerURL)]
    public sealed class ResourcesController : ControllerBase
    {
        private readonly ResourcesService _resourcesService;
        private readonly ILogger<ResourcesController> _logger;

        public ResourcesController(ResourcesService resourcesService, ILogger<ResourcesController> logger)
        {
            _resourcesService = resourcesService;
            _logger = logger;
        }

        [HttpGet(ApplicationRouteFactory.ResourcesRoutes.GetAllResources)]
        public async Task<ActionResult<APIResponse<List<ResourceNexus>>>> GetAllResourcesAsynchronous()
        {
            try
            {
                List<ResourceNexus> resources = await _resourcesService.GetAllResourcesAsynchronous();

                return Ok(
                    APIResponse<List<ResourceNexus>>.Succeeded(
                        resources,
                        "Resources retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving Resources.");

                return StatusCode(
                    500,
                    APIResponse<List<ResourceNexus>>.Failed(
                        "An unexpected error occurred while retrieving Resources.",
                        new List<string>(),
                        500));
            }
        }
    }
}
