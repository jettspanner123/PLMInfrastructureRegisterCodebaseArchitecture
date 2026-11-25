using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Services
{
    public sealed class DowntimeAnnouncementsService
    {
        private readonly ApplicationDatabaseContext _dbContext;
        private readonly ILogger<DowntimeAnnouncementsService> _logger;

        public DowntimeAnnouncementsService(
            ApplicationDatabaseContext dbContext,
            ILogger<DowntimeAnnouncementsService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<DowntimeAnnouncementDTO> CreateDowntimeAnnouncementAsynchronous(
            CreateDowntimeAnnouncementDTO request)
        {
            DowntimeAnnouncementsAssertion.Current.AssertCreateRequest(request);

            DateTime parsedStartAt = DateTime.Parse(request.StartAt, CultureInfo.InvariantCulture, DateTimeStyles.None);
            DateTime parsedEndAt = DateTime.Parse(request.EndAt, CultureInfo.InvariantCulture, DateTimeStyles.None);

            DowntimeAnnouncementNexus nexus = new DowntimeAnnouncementNexus
            {
                Id = Guid.NewGuid(),
                Heading = request.Heading.Trim(),
                Description = request.Description.Trim(),
                StartAt = CETTimeZoneUtility.ToUtc(parsedStartAt),
                EndAt = CETTimeZoneUtility.ToUtc(parsedEndAt),
                CreatedAt = DateTime.UtcNow,
                EndedEarlyAt = null,
            };

            await _dbContext.DowntimeAnnouncements.AddAsync(nexus);

            List<string> distinctEnvironments = request.Environments
                .Where(environment => !string.IsNullOrWhiteSpace(environment))
                .Select(environment => environment.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            nexus.Environments = string.Join(",", distinctEnvironments);

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Created Downtime Announcement '{Id}' ('{Heading}') affecting {Count} environment(s).",
                nexus.Id,
                nexus.Heading,
                distinctEnvironments.Count);

            return MapToDTO(nexus, DateTime.UtcNow);
        }

        // "Active" = StartAt <= now < EndAt AND EndedEarlyAt IS NULL - see
        // research.md. Only the single most recently created active
        // announcement is ever returned (FR-009); the rest stay in the
        // database and simply aren't surfaced until they become the most
        // recently created active one.
        public async Task<DowntimeAnnouncementDTO?> GetActiveDowntimeAnnouncementAsynchronous()
        {
            DateTime now = DateTime.UtcNow;

            DowntimeAnnouncementNexus? nexus = await _dbContext.DowntimeAnnouncements
                .AsNoTracking()
                .Where(announcement =>
                    announcement.StartAt <= now &&
                    now < announcement.EndAt &&
                    announcement.EndedEarlyAt == null)
                .OrderByDescending(announcement => announcement.CreatedAt)
                .FirstOrDefaultAsync();

            if (nexus is null)
            {
                return null;
            }

            return MapToDTO(nexus, now);
        }

        // Every announcement (any environment) whose [StartAt, EndAt] overlaps [fromAt, toAt] -
        // past, active, and future-scheduled alike (specs/009-calendar-backend-integration/
        // research.md §2). Not filtered by environment server-side - the frontend does that, since
        // Environments is a single comma-joined column here, not a relational join.
        public async Task<List<DowntimeAnnouncementDTO>> GetDowntimeAnnouncementsInRangeAsynchronous(DateTime fromAt, DateTime toAt)
        {
            DateTime now = DateTime.UtcNow;

            List<DowntimeAnnouncementNexus> announcements = await _dbContext.DowntimeAnnouncements
                .AsNoTracking()
                .Where(announcement => announcement.StartAt <= toAt && announcement.EndAt >= fromAt)
                .OrderByDescending(announcement => announcement.CreatedAt)
                .ToListAsync();

            return announcements.Select(announcement => MapToDTO(announcement, now)).ToList();
        }

        public async Task<DowntimeAnnouncementDTO> EndDowntimeAnnouncementEarlyAsynchronous(Guid id)
        {
            DowntimeAnnouncementsAssertion.Current.AssertValidId(id);

            DowntimeAnnouncementNexus? nexus = await _dbContext.DowntimeAnnouncements
                .FirstOrDefaultAsync(announcement => announcement.Id == id);

            if (nexus is null)
            {
                throw new NotFoundException($"Downtime Announcement with ID '{id}' was not found.");
            }

            DateTime now = DateTime.UtcNow;

            // Ending an already-inactive announcement (expired on its own, or
            // already ended early) is a no-op, not an error - see spec.md's
            // edge case for this.
            bool isAlreadyInactive = nexus.EndedEarlyAt is not null || now >= nexus.EndAt;
            if (!isAlreadyInactive)
            {
                nexus.EndedEarlyAt = now;
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Ended Downtime Announcement '{Id}' ('{Heading}') early.", nexus.Id, nexus.Heading);
            }

            return MapToDTO(nexus, now);
        }

        // Every announcement, active and historical, most recently created
        // first (FR-013). The IsDeleted query filter excludes soft-deleted
        // rows automatically - no need to repeat it here.
        public async Task<List<DowntimeAnnouncementDTO>> GetAllDowntimeAnnouncementsAsynchronous()
        {
            DateTime now = DateTime.UtcNow;

            List<DowntimeAnnouncementNexus> announcements = await _dbContext.DowntimeAnnouncements
                .AsNoTracking()
                .OrderByDescending(announcement => announcement.CreatedAt)
                .ToListAsync();

            return announcements.Select(announcement => MapToDTO(announcement, now)).ToList();
        }

        // All fields editable (FR-016/FR-018), regardless of the
        // announcement's current status - no restriction based on whether
        // it's active, ended early, or expired.
        public async Task<DowntimeAnnouncementDTO> UpdateDowntimeAnnouncementAsynchronous(
            Guid id,
            UpdateDowntimeAnnouncementDTO request)
        {
            DowntimeAnnouncementsAssertion.Current.AssertValidId(id);
            DowntimeAnnouncementsAssertion.Current.AssertUpdateRequest(request);

            DowntimeAnnouncementNexus? nexus = await _dbContext.DowntimeAnnouncements
                .FirstOrDefaultAsync(announcement => announcement.Id == id);

            if (nexus is null)
            {
                throw new NotFoundException($"Downtime Announcement with ID '{id}' was not found.");
            }

            DateTime parsedStartAt = DateTime.Parse(request.StartAt, CultureInfo.InvariantCulture, DateTimeStyles.None);
            DateTime parsedEndAt = DateTime.Parse(request.EndAt, CultureInfo.InvariantCulture, DateTimeStyles.None);

            List<string> distinctEnvironments = request.Environments
                .Where(environment => !string.IsNullOrWhiteSpace(environment))
                .Select(environment => environment.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            nexus.Heading = request.Heading.Trim();
            nexus.Description = request.Description.Trim();
            nexus.StartAt = CETTimeZoneUtility.ToUtc(parsedStartAt);
            nexus.EndAt = CETTimeZoneUtility.ToUtc(parsedEndAt);
            nexus.Environments = string.Join(",", distinctEnvironments);

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Updated Downtime Announcement '{Id}' ('{Heading}').", nexus.Id, nexus.Heading);

            return MapToDTO(nexus, DateTime.UtcNow);
        }

        // Soft delete (FR-017) - same convention as
        // EnvironmentUptimeRequestsService.DeleteEnvironmentUptimeRequestAsynchronous.
        // A nonexistent or already-deleted id 404s (the query filter makes an
        // already-deleted row invisible to the lookup above).
        public async Task<bool> DeleteDowntimeAnnouncementAsynchronous(Guid id)
        {
            DowntimeAnnouncementsAssertion.Current.AssertValidId(id);

            DowntimeAnnouncementNexus? nexus = await _dbContext.DowntimeAnnouncements
                .FirstOrDefaultAsync(announcement => announcement.Id == id);

            if (nexus is null)
            {
                throw new NotFoundException($"Downtime Announcement with ID '{id}' was not found.");
            }

            nexus.IsDeleted = true;
            nexus.DeletedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Soft-deleted Downtime Announcement '{Id}' ('{Heading}').", nexus.Id, nexus.Heading);

            return true;
        }

        private static DowntimeAnnouncementDTO MapToDTO(DowntimeAnnouncementNexus nexus, DateTime now)
        {
            bool isActive = nexus.StartAt <= now && now < nexus.EndAt && nexus.EndedEarlyAt == null;

            string status = nexus.EndedEarlyAt is not null
                ? "EndedEarly"
                : now >= nexus.EndAt
                    ? "Expired"
                    : nexus.StartAt <= now
                        ? "Active"
                        : "Scheduled";

            return new DowntimeAnnouncementDTO
            {
                Id = nexus.Id,
                Heading = nexus.Heading,
                Description = nexus.Description,
                StartAt = nexus.StartAt,
                EndAt = nexus.EndAt,
                CreatedAt = nexus.CreatedAt,
                EndedEarlyAt = nexus.EndedEarlyAt,
                Environments = nexus.Environments
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .ToList(),
                IsActive = isActive,
                Status = status,
            };
        }
    }
}
