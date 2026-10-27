using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests
{
    [ApiController]
    [Route(ApplicationRouteFactory.FeatureRequestsRoutes.ControllerURL)]
    public sealed class FeatureRequestsController : ControllerBase
    {
        private readonly FeatureRequestsService _featureRequestsService;
        private readonly ILogger<FeatureRequestsController> _logger;

        public FeatureRequestsController(
            FeatureRequestsService featureRequestsService,
            ILogger<FeatureRequestsController> logger)
        {
            _featureRequestsService = featureRequestsService;
            _logger = logger;
        }

        [HttpGet(ApplicationRouteFactory.FeatureRequestsRoutes.GetAllFeatureRequests)]
        public async Task<ActionResult<APIResponse<List<FeatureRequestDTO>>>> GetAllFeatureRequestsAsynchronous()
        {
            try
            {
                List<FeatureRequestDTO> requests = await _featureRequestsService.GetAllFeatureRequestsAsynchronous();

                return Ok(
                    APIResponse<List<FeatureRequestDTO>>.Succeeded(
                        requests,
                        "Feature requests retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving feature requests.");

                return StatusCode(
                    500,
                    APIResponse<List<FeatureRequestDTO>>.Failed(
                        "An unexpected error occurred while retrieving feature requests.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.FeatureRequestsRoutes.CreateFeatureRequest)]
        public async Task<ActionResult<APIResponse<FeatureRequestDTO>>> CreateFeatureRequestAsynchronous(
            [FromBody] CreateFeatureRequestDTO request)
        {
            try
            {
                FeatureRequestDTO created = await _featureRequestsService.CreateFeatureRequestAsynchronous(request);

                return Ok(
                    APIResponse<FeatureRequestDTO>.Succeeded(
                        created,
                        "Feature request created successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Feature request validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<FeatureRequestDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating a feature request.");

                return StatusCode(
                    500,
                    APIResponse<FeatureRequestDTO>.Failed(
                        "An unexpected error occurred while creating the feature request.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.FeatureRequestsRoutes.UpdateStatus)]
        public async Task<ActionResult<APIResponse<FeatureRequestDTO>>> UpdateStatusAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateFeatureRequestStatusDTO request)
        {
            try
            {
                FeatureRequestDTO updated = await _featureRequestsService.UpdateFeatureRequestStatusAsynchronous(id, request);

                return Ok(
                    APIResponse<FeatureRequestDTO>.Succeeded(
                        updated,
                        "Feature request status updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Feature request status validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<FeatureRequestDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Feature request not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<FeatureRequestDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating feature request status.");

                return StatusCode(
                    500,
                    APIResponse<FeatureRequestDTO>.Failed(
                        "An unexpected error occurred while updating feature request status.",
                        new List<string>(),
                        500));
            }
        }

        [HttpDelete(ApplicationRouteFactory.FeatureRequestsRoutes.DeleteFeatureRequest)]
        public async Task<ActionResult<APIResponse<bool>>> DeleteFeatureRequestAsynchronous([FromRoute] Guid id)
        {
            try
            {
                bool deleted = await _featureRequestsService.DeleteFeatureRequestAsynchronous(id);

                return Ok(
                    APIResponse<bool>.Succeeded(
                        deleted,
                        "Feature request deleted successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Feature request delete validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<bool>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Feature request not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<bool>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting feature request.");

                return StatusCode(
                    500,
                    APIResponse<bool>.Failed(
                        "An unexpected error occurred while deleting the feature request.",
                        new List<string>(),
                        500));
            }
        }
    }
}
