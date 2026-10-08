using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Assertion;
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

        [HttpGet(ApplicationRouteFactory.ResourcesRoutes.GetCellFormats)]
        public async Task<ActionResult<APIResponse<List<ResourceCellFormatDTO>>>> GetCellFormatsAsynchronous()
        {
            try
            {
                List<ResourceCellFormatDTO> cellFormats = await _resourcesService.GetCellFormatsAsynchronous();

                return Ok(
                    APIResponse<List<ResourceCellFormatDTO>>.Succeeded(
                        cellFormats,
                        "Cell formats retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving cell formats.");

                return StatusCode(
                    500,
                    APIResponse<List<ResourceCellFormatDTO>>.Failed(
                        "An unexpected error occurred while retrieving cell formats.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.ResourcesRoutes.UpdateCellFormat)]
        public async Task<ActionResult<APIResponse<List<ResourceCellFormatDTO>>>> UpdateCellFormatAsynchronous(
            [FromBody] UpdateResourceCellFormatRequestDTO? request)
        {
            try
            {
                ResourcesAssertion.Current.AssertUpdateCellFormatRequest(request);

                List<ResourceCellFormatDTO> cellFormats = await _resourcesService.UpdateCellFormatAsynchronous(request!);

                return Ok(
                    APIResponse<List<ResourceCellFormatDTO>>.Succeeded(
                        cellFormats,
                        "Cell format updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update cell format validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<ResourceCellFormatDTO>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating a cell format.");

                return StatusCode(
                    500,
                    APIResponse<List<ResourceCellFormatDTO>>.Failed(
                        "An unexpected error occurred while updating the cell format.",
                        new List<string>(),
                        500));
            }
        }
    }
}
