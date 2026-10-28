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

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.UpdateActionItem)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> UpdateActionItemAsynchronous(
            [FromRoute] Guid id,
            [FromRoute] int lineIndex,
            [FromBody] UpdateActionItemRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertUpdateActionItemRequest(request);

                EnvironmentOverviewDTO updatedEnvironment =
                    await _environmentOverviewService.UpdateActionItemAsynchronous(id, lineIndex, request!.ReplacementLineText!);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        updatedEnvironment,
                        "Action item updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update action item validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update action item not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating an action item.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while updating the action item.",
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

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.UpdateUptimeSchedule)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> UpdateUptimeScheduleAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateUptimeScheduleRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertUpdateUptimeScheduleRequest(request);

                EnvironmentOverviewDTO updatedEnvironment = await _environmentOverviewService.UpdateUptimeScheduleAsynchronous(
                    id, request!.CurrentUptimeSchedule, request.UptimeScheduleNote);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        updatedEnvironment,
                        "Uptime schedule updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update uptime schedule validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update uptime schedule not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating the uptime schedule.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while updating the uptime schedule.",
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

        [HttpGet(ApplicationRouteFactory.EnvironmentOverviewRoutes.GetCellFormats)]
        public async Task<ActionResult<APIResponse<List<EnvironmentOverviewCellFormatDTO>>>> GetCellFormatsAsynchronous()
        {
            try
            {
                List<EnvironmentOverviewCellFormatDTO> cellFormats = await _environmentOverviewService.GetCellFormatsAsynchronous();

                return Ok(
                    APIResponse<List<EnvironmentOverviewCellFormatDTO>>.Succeeded(
                        cellFormats,
                        "Cell formats retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving cell formats.");

                return StatusCode(
                    500,
                    APIResponse<List<EnvironmentOverviewCellFormatDTO>>.Failed(
                        "An unexpected error occurred while retrieving cell formats.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.UpdateCellFormat)]
        public async Task<ActionResult<APIResponse<List<EnvironmentOverviewCellFormatDTO>>>> UpdateCellFormatAsynchronous(
            [FromBody] UpdateEnvironmentOverviewCellFormatRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertUpdateCellFormatRequest(request);

                List<EnvironmentOverviewCellFormatDTO> cellFormats = await _environmentOverviewService.UpdateCellFormatAsynchronous(request!);

                return Ok(
                    APIResponse<List<EnvironmentOverviewCellFormatDTO>>.Succeeded(
                        cellFormats,
                        "Cell format updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update cell format validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<EnvironmentOverviewCellFormatDTO>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating a cell format.");

                return StatusCode(
                    500,
                    APIResponse<List<EnvironmentOverviewCellFormatDTO>>.Failed(
                        "An unexpected error occurred while updating the cell format.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.EnvironmentOverviewRoutes.InsertRow)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> InsertRowAsynchronous(
            [FromBody] InsertRowRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertInsertRowRequest(request);

                EnvironmentOverviewDTO createdEnvironment = await _environmentOverviewService.InsertRowAsynchronous(request!);

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        createdEnvironment,
                        "Row inserted successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Insert row validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Insert row not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while inserting a row.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while inserting the row.",
                        new List<string>(),
                        500));
            }
        }

        [HttpGet(ApplicationRouteFactory.EnvironmentOverviewRoutes.GetCustomColumns)]
        public async Task<ActionResult<APIResponse<List<EnvironmentOverviewCustomColumnDTO>>>> GetCustomColumnsAsynchronous()
        {
            try
            {
                List<EnvironmentOverviewCustomColumnDTO> customColumns = await _environmentOverviewService.GetCustomColumnsAsynchronous();

                return Ok(
                    APIResponse<List<EnvironmentOverviewCustomColumnDTO>>.Succeeded(
                        customColumns,
                        "Custom columns retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving custom columns.");

                return StatusCode(
                    500,
                    APIResponse<List<EnvironmentOverviewCustomColumnDTO>>.Failed(
                        "An unexpected error occurred while retrieving custom columns.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.EnvironmentOverviewRoutes.CreateCustomColumn)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewCustomColumnDTO>>> CreateCustomColumnAsynchronous(
            [FromBody] CreateCustomColumnRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertCreateCustomColumnRequest(request);

                EnvironmentOverviewCustomColumnDTO createdColumn = await _environmentOverviewService.CreateCustomColumnAsynchronous(request!);

                return Ok(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Succeeded(
                        createdColumn,
                        "Column created successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Create custom column validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Create custom column not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating a custom column.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(
                        "An unexpected error occurred while creating the column.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.UpdateCustomColumnHeader)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewCustomColumnDTO>>> UpdateCustomColumnHeaderAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateCustomColumnHeaderRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertUpdateCustomColumnHeaderRequest(request);

                EnvironmentOverviewCustomColumnDTO updatedColumn =
                    await _environmentOverviewService.UpdateCustomColumnHeaderAsynchronous(id, request!.HeaderName);

                return Ok(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Succeeded(
                        updatedColumn,
                        "Column renamed successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update custom column header validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update custom column header not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while renaming a custom column.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(
                        "An unexpected error occurred while renaming the column.",
                        new List<string>(),
                        500));
            }
        }

        [HttpDelete(ApplicationRouteFactory.EnvironmentOverviewRoutes.DeleteCustomColumn)]
        public async Task<ActionResult<APIResponse<bool>>> DeleteCustomColumnAsynchronous([FromRoute] Guid id)
        {
            try
            {
                await _environmentOverviewService.DeleteCustomColumnAsynchronous(id);

                return Ok(
                    APIResponse<bool>.Succeeded(
                        true,
                        "Column deleted successfully.",
                        200));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Delete custom column not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<bool>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting a custom column.");

                return StatusCode(
                    500,
                    APIResponse<bool>.Failed(
                        "An unexpected error occurred while deleting the column.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.EnvironmentOverviewRoutes.AddCustomColumnOption)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewCustomColumnDTO>>> AddCustomColumnOptionAsynchronous(
            [FromRoute] Guid id,
            [FromBody] AddCustomColumnOptionRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewAssertion.Current.AssertAddCustomColumnOptionRequest(request);

                EnvironmentOverviewCustomColumnDTO updatedColumn =
                    await _environmentOverviewService.AddCustomColumnOptionAsynchronous(id, request!.Value!);

                return Ok(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Succeeded(
                        updatedColumn,
                        "Option added successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Add custom column option validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Add custom column option not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding a custom column option.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewCustomColumnDTO>.Failed(
                        "An unexpected error occurred while adding the option.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.EnvironmentOverviewRoutes.UpdateCustomCellValue)]
        public async Task<ActionResult<APIResponse<EnvironmentOverviewDTO>>> UpdateCustomCellValueAsynchronous(
            [FromRoute] Guid id,
            [FromRoute] Guid customColumnId,
            [FromBody] UpsertCustomCellValueRequestDTO? request)
        {
            try
            {
                EnvironmentOverviewDTO updatedEnvironment =
                    await _environmentOverviewService.UpsertCustomCellValueAsynchronous(id, customColumnId, request ?? new UpsertCustomCellValueRequestDTO());

                return Ok(
                    APIResponse<EnvironmentOverviewDTO>.Succeeded(
                        updatedEnvironment,
                        "Cell updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update custom cell value validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<EnvironmentOverviewDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update custom cell value not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<EnvironmentOverviewDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating a custom cell value.");

                return StatusCode(
                    500,
                    APIResponse<EnvironmentOverviewDTO>.Failed(
                        "An unexpected error occurred while updating the cell.",
                        new List<string>(),
                        500));
            }
        }
    }
}
