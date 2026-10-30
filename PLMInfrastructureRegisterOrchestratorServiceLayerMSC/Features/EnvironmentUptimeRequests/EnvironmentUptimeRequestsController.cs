using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests
{
    [ApiController]
    [Route(ApplicationRouteFactory.EnvironmentUptimeRequestsRoutes.ControllerURL)]
    public sealed class EnvironmentUptimeRequestsController : ControllerBase
    {
        private readonly EnvironmentUptimeRequestsService _environmentUptimeRequestsService;
        private readonly ILogger<EnvironmentUptimeRequestsController> _logger;

        public EnvironmentUptimeRequestsController(
            EnvironmentUptimeRequestsService environmentUptimeRequestsService,
            ILogger<EnvironmentUptimeRequestsController> logger)
        {
            _environmentUptimeRequestsService = environmentUptimeRequestsService;
            _logger = logger;
        }

        [HttpGet(ApplicationRouteFactory.EnvironmentUptimeRequestsRoutes.GetAllEnvironmentUptimeRequests)]
        public async Task<ActionResult<APIResponse<List<EnvironmentUptimeRequestDTO>>>> GetAllEnvironmentUptimeRequestsAsynchronous()
        {
            try
            {
                List<EnvironmentUptimeRequestDTO> requests =
                    await _environmentUptimeRequestsService.GetAllEnvironmentUptimeRequestsAsynchronous();

                return Ok(APIResponse<List<EnvironmentUptimeRequestDTO>>.Succeeded(
                    requests, "Uptime requests retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving uptime requests.");
                return StatusCode(500, APIResponse<List<EnvironmentUptimeRequestDTO>>.Failed(
                    "An unexpected error occurred while retrieving uptime requests.", new List<string>(), 500));
            }
        }

        [HttpPost(ApplicationRouteFactory.EnvironmentUptimeRequestsRoutes.CreateEnvironmentUptimeRequest)]
        public async Task<ActionResult<APIResponse<EnvironmentUptimeRequestDTO>>> CreateEnvironmentUptimeRequestAsynchronous(
            [FromBody] CreateEnvironmentUptimeRequestDTO? request)
        {
            try
            {
                EnvironmentUptimeRequestDTO created =
                    await _environmentUptimeRequestsService.CreateEnvironmentUptimeRequestAsynchronous(request!);

                return Ok(APIResponse<EnvironmentUptimeRequestDTO>.Succeeded(
                    created, "Uptime request submitted successfully.", 201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Uptime request validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<EnvironmentUptimeRequestDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (ConflictException conflictEx)
            {
                _logger.LogWarning("Uptime request conflict: {Message}", conflictEx.Message);
                return Conflict(APIResponse<EnvironmentUptimeRequestDTO>.Failed(conflictEx.Message, new List<string>(), 409));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating uptime request.");
                return StatusCode(500, APIResponse<EnvironmentUptimeRequestDTO>.Failed(
                    "An unexpected error occurred while creating the uptime request.", new List<string>(), 500));
            }
        }

        [HttpPut(ApplicationRouteFactory.EnvironmentUptimeRequestsRoutes.UpdateStatus)]
        public async Task<ActionResult<APIResponse<EnvironmentUptimeRequestDTO>>> UpdateStatusAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateEnvironmentUptimeRequestStatusDTO? request)
        {
            try
            {
                EnvironmentUptimeRequestDTO updated =
                    await _environmentUptimeRequestsService.UpdateStatusAsynchronous(id, request);

                return Ok(APIResponse<EnvironmentUptimeRequestDTO>.Succeeded(
                    updated, "Uptime request updated successfully.", 200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Uptime request status update validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<EnvironmentUptimeRequestDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Uptime request not found: {Message}", notFoundEx.Message);
                return NotFound(APIResponse<EnvironmentUptimeRequestDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating uptime request status.");
                return StatusCode(500, APIResponse<EnvironmentUptimeRequestDTO>.Failed(
                    "An unexpected error occurred while updating the uptime request.", new List<string>(), 500));
            }
        }

        [HttpDelete(ApplicationRouteFactory.EnvironmentUptimeRequestsRoutes.DeleteEnvironmentUptimeRequest)]
        public async Task<ActionResult<APIResponse<bool>>> DeleteEnvironmentUptimeRequestAsynchronous([FromRoute] Guid id)
        {
            try
            {
                bool deleted = await _environmentUptimeRequestsService.DeleteEnvironmentUptimeRequestAsynchronous(id);
                return Ok(APIResponse<bool>.Succeeded(deleted, "Uptime request deleted successfully.", 200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Uptime request delete validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<bool>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Uptime request not found: {Message}", notFoundEx.Message);
                return NotFound(APIResponse<bool>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting uptime request.");
                return StatusCode(500, APIResponse<bool>.Failed(
                    "An unexpected error occurred while deleting the uptime request.", new List<string>(), 500));
            }
        }
    }
}
