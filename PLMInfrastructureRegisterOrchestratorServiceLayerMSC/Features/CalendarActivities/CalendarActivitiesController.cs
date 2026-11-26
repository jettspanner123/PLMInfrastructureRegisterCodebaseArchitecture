using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities
{
    [ApiController]
    [Route(ApplicationRouteFactory.CalendarActivitiesRoutes.ControllerURL)]
    public sealed class CalendarActivitiesController : ControllerBase
    {
        private readonly CalendarActivitiesService _calendarActivitiesService;
        private readonly ILogger<CalendarActivitiesController> _logger;

        public CalendarActivitiesController(
            CalendarActivitiesService calendarActivitiesService,
            ILogger<CalendarActivitiesController> logger)
        {
            _calendarActivitiesService = calendarActivitiesService;
            _logger = logger;
        }

        [Authorize(Policy = "RequireAdmin")]
        [HttpPost(ApplicationRouteFactory.CalendarActivitiesRoutes.CreateCalendarActivity)]
        public async Task<ActionResult<APIResponse<CalendarActivityDTO>>> CreateCalendarActivityAsynchronous(
            [FromBody] CreateCalendarActivityDTO? request)
        {
            try
            {
                CalendarActivityDTO created = await _calendarActivitiesService.CreateCalendarActivityAsynchronous(request!);

                return StatusCode(201, APIResponse<CalendarActivityDTO>.Succeeded(
                    created, "Calendar activity created successfully.", 201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Calendar activity validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<CalendarActivityDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating calendar activity.");
                return StatusCode(500, APIResponse<CalendarActivityDTO>.Failed(
                    "An unexpected error occurred while creating the calendar activity.", new(), 500));
            }
        }

        // Public (no [Authorize]) - any visitor can view activities, per spec
        // User Stories 2/3 (research.md §2, deliberate divergence from
        // DowntimeAnnouncementsController's own admin-only GetAll).
        [HttpGet(ApplicationRouteFactory.CalendarActivitiesRoutes.GetAllCalendarActivities)]
        public async Task<ActionResult<APIResponse<List<CalendarActivityDTO>>>> GetAllCalendarActivitiesAsynchronous()
        {
            try
            {
                List<CalendarActivityDTO> activities = await _calendarActivitiesService.GetAllCalendarActivitiesAsynchronous();

                return Ok(APIResponse<List<CalendarActivityDTO>>.Succeeded(
                    activities, "Calendar activities retrieved successfully.", 200));
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving calendar activities.");
                return StatusCode(500, APIResponse<List<CalendarActivityDTO>>.Failed(
                    "An unexpected error occurred while retrieving calendar activities.", new(), 500));
            }
        }
    }
}
