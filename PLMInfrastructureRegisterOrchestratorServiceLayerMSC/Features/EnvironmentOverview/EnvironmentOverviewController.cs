using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Assertion;
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

        [HttpPost(ApplicationRouteFactory.EnvironmentOverviewRoutes.CreateEnvironmentOverview)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> CreateEnvironmentOverviewAsynchronous(
            [FromBody] CreateEnvironmentOverviewRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Environment))
            {
                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "Environment is required.",
                        new List<string>(),
                        400));
            }

            try
            {
                EnvironmentOverviewDTO createdEnvironment =
                    await _environmentOverviewService.CreateEnvironmentOverviewAsynchronous(request);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        createdEnvironment,
                        "Environment created successfully.",
                        201));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating an environment overview.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while creating the environment.",
                        new List<string>(),
                        500));
            }
        }

        [HttpGet(ApplicationRouteFactory.EnvironmentOverviewRoutes.GetOptions)]
        public async Task<ActionResult<APIResponse<List<string>>>> GetOptionsAsynchronous([FromRoute] string? fieldName)
        {
            try
            {
                string configurationKey = EnvironmentOverviewAssertion.Current.AssertOptionsFieldName(fieldName);

                List<string> options = await _environmentOverviewService.GetOptionsAsynchronous(configurationKey);

                return Ok(
                    APIResponse<List<string>>.Succeeded(
                        options,
                        "Options retrieved successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Get options validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<string>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving options.");

                return StatusCode(
                    500,
                    APIResponse<List<string>>.Failed(
                        "An unexpected error occurred while retrieving the options.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.EnvironmentOverviewRoutes.AddOption)]
        public async Task<ActionResult<APIResponse<List<string>>>> AddOptionAsynchronous(
            [FromRoute] string? fieldName,
            [FromBody] AddEnvironmentOverviewOptionRequestDTO? request)
        {
            try
            {
                string configurationKey = EnvironmentOverviewAssertion.Current.AssertOptionsFieldName(fieldName);
                EnvironmentOverviewAssertion.Current.AssertAddOptionRequest(request);

                List<string> options = await _environmentOverviewService.AddOptionAsynchronous(configurationKey, request!.Value!);

                return Ok(
                    APIResponse<List<string>>.Succeeded(
                        options,
                        "Option added successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Add option validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<string>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (ConflictException conflictEx)
            {
                _logger.LogWarning("Add option conflict: {Message}", conflictEx.Message);

                return Conflict(
                    APIResponse<List<string>>.Failed(conflictEx.Message, new List<string>(), 409));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Add option not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<List<string>>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding an option.");

                return StatusCode(
                    500,
                    APIResponse<List<string>>.Failed(
                        "An unexpected error occurred while adding the option.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.UpdateStatus)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> UpdateStatusAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateEnvironmentOverviewStatusRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertUpdateStatusRequest(request);

                EnvironmentOverviewDTO updatedEnvironment = await _environmentOverviewService.UpdateStatusAsynchronous(
                    id, request!.Status!, request.ChangedByClientId!);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        updatedEnvironment,
                        "Status updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update status validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update status not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating an environment's status.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while updating the status.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.AddActionItem)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> AddActionItemAsynchronous(
            [FromRoute] Guid id,
            [FromBody] AddActionItemRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertAddActionItemRequest(request);

                EnvironmentOverviewDTO updatedEnvironment =
                    await _environmentOverviewService.AddActionItemAsynchronous(id, request!.Note!);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        updatedEnvironment,
                        "Action item added successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Add action item validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Add action item not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding an action item.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while adding the action item.",
                        new List<string>(),
                        500));
            }
        }

        [HttpDelete(ApplicationRouteFactory.EnvironmentOverviewRoutes.DeleteActionItem)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> DeleteActionItemAsynchronous(
            [FromRoute] Guid id,
            [FromRoute] int lineIndex)
        {
            try
            {
                EnvironmentOverviewDTO updatedEnvironment =
                    await _environmentOverviewService.DeleteActionItemAsynchronous(id, lineIndex);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        updatedEnvironment,
                        "Action item deleted successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Delete action item validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Delete action item not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting an action item.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while deleting the action item.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.UpdateField)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> UpdateFieldAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateEnvironmentOverviewFieldRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertUpdateFieldRequest(request);

                EnvironmentOverviewDTO updatedEnvironment =
                    await _environmentOverviewService.UpdateFieldAsynchronous(id, request!.FieldName!, request.Value);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        updatedEnvironment,
                        "Field updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update field validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update field not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating a field.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while updating the field.",
                        new List<string>(),
                        500));
            }
        }

        [HttpDelete(ApplicationRouteFactory.EnvironmentOverviewRoutes.DeleteEnvironmentOverview)]
        public async Task<ActionResult<APIResponse<bool>>> DeleteEnvironmentOverviewAsynchronous([FromRoute] Guid id)
        {
            try
            {
                await _environmentOverviewService.DeleteEnvironmentOverviewAsynchronous(id);

                return Ok(
                    APIResponse<bool>.Succeeded(
                        true,
                        "Environment deleted successfully.",
                        200));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Delete environment not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<bool>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting an environment.");

                return StatusCode(
                    500,
                    APIResponse<bool>.Failed(
                        "An unexpected error occurred while deleting the environment.",
                        new List<string>(),
                        500));
            }
        }
    }
}
