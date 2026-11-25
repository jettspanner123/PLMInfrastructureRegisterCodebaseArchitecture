using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements
{
    [ApiController]
    [Route(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.ControllerURL)]
    public sealed class DowntimeAnnouncementsController : ControllerBase
    {
        private readonly DowntimeAnnouncementsService _downtimeAnnouncementsService;
        private readonly ILogger<DowntimeAnnouncementsController> _logger;

        public DowntimeAnnouncementsController(
            DowntimeAnnouncementsService downtimeAnnouncementsService,
            ILogger<DowntimeAnnouncementsController> logger)
        {
            _downtimeAnnouncementsService = downtimeAnnouncementsService;
            _logger = logger;
        }

        [Authorize(Policy = "RequireAdmin")]
        [HttpPost(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.CreateDowntimeAnnouncement)]
        public async Task<ActionResult<APIResponse<DowntimeAnnouncementDTO>>> CreateDowntimeAnnouncementAsynchronous(
            [FromBody] CreateDowntimeAnnouncementDTO? request)
        {
            try
            {
                DowntimeAnnouncementDTO created =
                    await _downtimeAnnouncementsService.CreateDowntimeAnnouncementAsynchronous(request!);

                return StatusCode(201, APIResponse<DowntimeAnnouncementDTO>.Succeeded(
                    created, "Downtime announcement created successfully.", 201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Downtime announcement validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<DowntimeAnnouncementDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating downtime announcement.");
                return StatusCode(500, APIResponse<DowntimeAnnouncementDTO>.Failed(
                    "An unexpected error occurred while creating the downtime announcement.", new(), 500));
            }
        }

        [HttpGet(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.GetActiveDowntimeAnnouncement)]
        public async Task<ActionResult<APIResponse<DowntimeAnnouncementDTO?>>> GetActiveDowntimeAnnouncementAsynchronous()
        {
            try
            {
                DowntimeAnnouncementDTO? active =
                    await _downtimeAnnouncementsService.GetActiveDowntimeAnnouncementAsynchronous();

                return Ok(APIResponse<DowntimeAnnouncementDTO?>.Succeeded(
                    active, "Active downtime announcement retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving the active downtime announcement.");
                return StatusCode(500, APIResponse<DowntimeAnnouncementDTO?>.Failed(
                    "An unexpected error occurred while retrieving the active downtime announcement.", new(), 500));
            }
        }

        // Public (no [Authorize]) - the calendar that calls this is never authenticated at all in
        // this app (specs/009-calendar-backend-integration/research.md §2). Returns every downtime
        // announcement overlapping the given range, across all environments - not just the single
        // one active right now.
        [HttpGet(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.GetDowntimeAnnouncementsInRange)]
        public async Task<ActionResult<APIResponse<List<DowntimeAnnouncementDTO>>>> GetDowntimeAnnouncementsInRangeAsynchronous(
            [FromQuery] DateTime fromAt,
            [FromQuery] DateTime toAt)
        {
            try
            {
                DowntimeAnnouncementsAssertion.Current.AssertDateRangeQuery(fromAt, toAt);

                List<DowntimeAnnouncementDTO> announcements =
                    await _downtimeAnnouncementsService.GetDowntimeAnnouncementsInRangeAsynchronous(fromAt, toAt);

                return Ok(APIResponse<List<DowntimeAnnouncementDTO>>.Succeeded(
                    announcements, "Downtime announcements retrieved successfully.", 200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Downtime announcements range query validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<List<DowntimeAnnouncementDTO>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving downtime announcements in range.");
                return StatusCode(500, APIResponse<List<DowntimeAnnouncementDTO>>.Failed(
                    "An unexpected error occurred while retrieving downtime announcements.", new(), 500));
            }
        }

        [Authorize(Policy = "RequireAdmin")]
        [HttpPut(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.EndDowntimeAnnouncementEarly)]
        public async Task<ActionResult<APIResponse<DowntimeAnnouncementDTO>>> EndDowntimeAnnouncementEarlyAsynchronous(
            [FromRoute] Guid id)
        {
            try
            {
                DowntimeAnnouncementDTO ended =
                    await _downtimeAnnouncementsService.EndDowntimeAnnouncementEarlyAsynchronous(id);

                return Ok(APIResponse<DowntimeAnnouncementDTO>.Succeeded(
                    ended, "Downtime announcement ended successfully.", 200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Downtime announcement end-early validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<DowntimeAnnouncementDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Downtime announcement not found: {Message}", notFoundEx.Message);
                return NotFound(APIResponse<DowntimeAnnouncementDTO>.Failed(notFoundEx.Message, new(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while ending downtime announcement early.");
                return StatusCode(500, APIResponse<DowntimeAnnouncementDTO>.Failed(
                    "An unexpected error occurred while ending the downtime announcement.", new(), 500));
            }
        }

        [Authorize(Policy = "RequireAdmin")]
        [HttpGet(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.GetAllDowntimeAnnouncement)]
        public async Task<ActionResult<APIResponse<List<DowntimeAnnouncementDTO>>>> GetAllDowntimeAnnouncementsAsynchronous()
        {
            try
            {
                List<DowntimeAnnouncementDTO> announcements =
                    await _downtimeAnnouncementsService.GetAllDowntimeAnnouncementsAsynchronous();

                return Ok(APIResponse<List<DowntimeAnnouncementDTO>>.Succeeded(
                    announcements, "Downtime announcements retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving downtime announcements.");
                return StatusCode(500, APIResponse<List<DowntimeAnnouncementDTO>>.Failed(
                    "An unexpected error occurred while retrieving downtime announcements.", new(), 500));
            }
        }

        [Authorize(Policy = "RequireAdmin")]
        [HttpPut(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.UpdateDowntimeAnnouncement)]
        public async Task<ActionResult<APIResponse<DowntimeAnnouncementDTO>>> UpdateDowntimeAnnouncementAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateDowntimeAnnouncementDTO? request)
        {
            try
            {
                DowntimeAnnouncementDTO updated =
                    await _downtimeAnnouncementsService.UpdateDowntimeAnnouncementAsynchronous(id, request!);

                return Ok(APIResponse<DowntimeAnnouncementDTO>.Succeeded(
                    updated, "Downtime announcement updated successfully.", 200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Downtime announcement update validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<DowntimeAnnouncementDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Downtime announcement not found: {Message}", notFoundEx.Message);
                return NotFound(APIResponse<DowntimeAnnouncementDTO>.Failed(notFoundEx.Message, new(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating downtime announcement.");
                return StatusCode(500, APIResponse<DowntimeAnnouncementDTO>.Failed(
                    "An unexpected error occurred while updating the downtime announcement.", new(), 500));
            }
        }

        [Authorize(Policy = "RequireAdmin")]
        [HttpDelete(ApplicationRouteFactory.DowntimeAnnouncementsRoutes.DeleteDowntimeAnnouncement)]
        public async Task<ActionResult<APIResponse<bool>>> DeleteDowntimeAnnouncementAsynchronous([FromRoute] Guid id)
        {
            try
            {
                bool deleted = await _downtimeAnnouncementsService.DeleteDowntimeAnnouncementAsynchronous(id);
                return Ok(APIResponse<bool>.Succeeded(deleted, "Downtime announcement deleted successfully.", 200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Downtime announcement delete validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<bool>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Downtime announcement not found: {Message}", notFoundEx.Message);
                return NotFound(APIResponse<bool>.Failed(notFoundEx.Message, new(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting downtime announcement.");
                return StatusCode(500, APIResponse<bool>.Failed(
                    "An unexpected error occurred while deleting the downtime announcement.", new(), 500));
            }
        }
    }
}
