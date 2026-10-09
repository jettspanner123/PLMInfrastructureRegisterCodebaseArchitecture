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
        private readonly ResourceCellFormatColorService _resourceCellFormatColorService;
        private readonly ILogger<ResourcesController> _logger;

        public ResourcesController(
            ResourcesService resourcesService,
            ResourceCellFormatColorService resourceCellFormatColorService,
            ILogger<ResourcesController> logger)
        {
            _resourcesService = resourcesService;
            _resourceCellFormatColorService = resourceCellFormatColorService;
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

        [HttpGet(ApplicationRouteFactory.ResourcesRoutes.GetCustomColors)]
        public async Task<ActionResult<APIResponse<List<CustomColorOptionDTO>>>> GetCustomColorsAsynchronous()
        {
            try
            {
                List<CustomColorOptionDTO> colors = await _resourceCellFormatColorService.GetCustomColorsAsynchronous();

                return Ok(
                    APIResponse<List<CustomColorOptionDTO>>.Succeeded(
                        colors,
                        "Custom colors retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving custom colors.");

                return StatusCode(
                    500,
                    APIResponse<List<CustomColorOptionDTO>>.Failed(
                        "An unexpected error occurred while retrieving the custom colors.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.ResourcesRoutes.AddCustomColor)]
        public async Task<ActionResult<APIResponse<List<CustomColorOptionDTO>>>> AddCustomColorAsynchronous(
            [FromBody] AddCustomColorOptionRequestDTO? request)
        {
            try
            {
                ResourcesAssertion.Current.AssertAddCustomColorOptionRequest(request);

                List<CustomColorOptionDTO> colors = await _resourceCellFormatColorService.AddCustomColorAsynchronous(request!);

                return Ok(
                    APIResponse<List<CustomColorOptionDTO>>.Succeeded(
                        colors,
                        "Custom color added successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Add custom color validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<CustomColorOptionDTO>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (ConflictException conflictEx)
            {
                _logger.LogWarning("Add custom color conflict: {Message}", conflictEx.Message);

                return Conflict(
                    APIResponse<List<CustomColorOptionDTO>>.Failed(conflictEx.Message, new List<string>(), 409));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding a custom color.");

                return StatusCode(
                    500,
                    APIResponse<List<CustomColorOptionDTO>>.Failed(
                        "An unexpected error occurred while adding the custom color.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.ResourcesRoutes.UpdateCustomColor)]
        public async Task<ActionResult<APIResponse<List<CustomColorOptionDTO>>>> UpdateCustomColorAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateCustomColorOptionRequestDTO? request)
        {
            try
            {
                ResourcesAssertion.Current.AssertUpdateCustomColorOptionRequest(request);

                List<CustomColorOptionDTO> colors = await _resourceCellFormatColorService.UpdateCustomColorAsynchronous(id, request!);

                return Ok(
                    APIResponse<List<CustomColorOptionDTO>>.Succeeded(
                        colors,
                        "Custom color updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update custom color validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<CustomColorOptionDTO>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (ConflictException conflictEx)
            {
                _logger.LogWarning("Update custom color conflict: {Message}", conflictEx.Message);

                return Conflict(
                    APIResponse<List<CustomColorOptionDTO>>.Failed(conflictEx.Message, new List<string>(), 409));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update custom color not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<List<CustomColorOptionDTO>>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating a custom color.");

                return StatusCode(
                    500,
                    APIResponse<List<CustomColorOptionDTO>>.Failed(
                        "An unexpected error occurred while updating the custom color.",
                        new List<string>(),
                        500));
            }
        }

        [HttpDelete(ApplicationRouteFactory.ResourcesRoutes.DeleteCustomColor)]
        public async Task<ActionResult<APIResponse<List<CustomColorOptionDTO>>>> DeleteCustomColorAsynchronous([FromRoute] Guid id)
        {
            try
            {
                List<CustomColorOptionDTO> colors = await _resourceCellFormatColorService.DeleteCustomColorAsynchronous(id);

                return Ok(
                    APIResponse<List<CustomColorOptionDTO>>.Succeeded(
                        colors,
                        "Custom color deleted successfully.",
                        200));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Delete custom color not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<List<CustomColorOptionDTO>>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting a custom color.");

                return StatusCode(
                    500,
                    APIResponse<List<CustomColorOptionDTO>>.Failed(
                        "An unexpected error occurred while deleting the custom color.",
                        new List<string>(),
                        500));
            }
        }
    }
}
