using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Services
{
    public sealed class CalendarActivitiesService
    {
        private readonly ApplicationDatabaseContext _dbContext;
        private readonly ILogger<CalendarActivitiesService> _logger;

        public CalendarActivitiesService(
            ApplicationDatabaseContext dbContext,
            ILogger<CalendarActivitiesService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<CalendarActivityDTO> CreateCalendarActivityAsynchronous(CreateCalendarActivityDTO request)
        {
            CalendarActivitiesAssertion.Current.AssertCreateRequest(request);

            DateTime parsedStartAt = DateTime.Parse(request.StartAt, CultureInfo.InvariantCulture, DateTimeStyles.None);
            DateTime parsedEndAt = DateTime.Parse(request.EndAt, CultureInfo.InvariantCulture, DateTimeStyles.None);

            CalendarActivityNexus nexus = new CalendarActivityNexus
            {
                Id = Guid.NewGuid(),
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Environment = request.Environment.Trim(),
                ResponsiblePerson = request.ResponsiblePerson.Trim(),
                ContactEmail = request.ContactEmail.Trim(),
                StartAt = CETTimeZoneUtility.ToUtc(parsedStartAt),
                EndAt = CETTimeZoneUtility.ToUtc(parsedEndAt),
                CreatedAt = DateTime.UtcNow,
            };

            await _dbContext.CalendarActivities.AddAsync(nexus);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Created Calendar Activity '{Id}' ('{Title}').", nexus.Id, nexus.Title);

            return MapToDTO(nexus);
        }

        // Public - every activity, unfiltered (no date-range filtering/pagination
        // in this pass, per plan.md Constraints and contracts/list-calendar-
        // activities.md). The client sorts by CreatedAt to derive display color.
        public async Task<List<CalendarActivityDTO>> GetAllCalendarActivitiesAsynchronous()
        {
            List<CalendarActivityNexus> activities = await _dbContext.CalendarActivities
                .AsNoTracking()
                .ToListAsync();

            return activities.Select(MapToDTO).ToList();
        }

        private static CalendarActivityDTO MapToDTO(CalendarActivityNexus nexus)
        {
            return new CalendarActivityDTO
            {
                Id = nexus.Id,
                Title = nexus.Title,
                Description = nexus.Description,
                Environment = nexus.Environment,
                ResponsiblePerson = nexus.ResponsiblePerson,
                ContactEmail = nexus.ContactEmail,
                StartAt = nexus.StartAt,
                EndAt = nexus.EndAt,
                CreatedAt = nexus.CreatedAt,
            };
        }
    }
}
