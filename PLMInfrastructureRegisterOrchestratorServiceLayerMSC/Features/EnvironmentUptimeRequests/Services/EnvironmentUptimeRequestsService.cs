using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Services
{
    public sealed class EnvironmentUptimeRequestsService
    {
        private readonly ApplicationDatabaseContext _dbContext;
        private readonly ILogger<EnvironmentUptimeRequestsService> _logger;

        public EnvironmentUptimeRequestsService(
            ApplicationDatabaseContext dbContext,
            ILogger<EnvironmentUptimeRequestsService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        // IMPORTANT: this projects directly inside .Select() (not via a
        // helper method) - EF Core can only translate expressions it can
        // itself read into SQL, not an opaque C# method call, so a mapping
        // helper here would fail at runtime ("could not be translated").
        public async Task<List<EnvironmentUptimeRequestDTO>> GetAllEnvironmentUptimeRequestsAsynchronous()
        {
            return await _dbContext.EnvironmentUptimeRequests
                .AsNoTracking()
                .OrderByDescending(request => request.CreatedAt)
                .Select(request => new EnvironmentUptimeRequestDTO
                {
                    Id = request.Id,
                    TicketNumber = request.TicketNumber,
                    TicketId = request.TicketId,
                    Environment = request.Environment,
                    RequesterName = request.RequesterName,
                    FromAt = request.FromAt,
                    ToAt = request.ToAt,
                    Message = request.Message,
                    Status = request.Status,
                    AdminMessage = request.AdminMessage,
                    CreatedAt = request.CreatedAt,
                })
                .ToListAsync();
        }

        public async Task<EnvironmentUptimeRequestDTO> CreateEnvironmentUptimeRequestAsynchronous(
            CreateEnvironmentUptimeRequestDTO request)
        {
            EnvironmentUptimeRequestsAssertion.Current.AssertCreateRequest(request);

            DateTime parsedFromAt = DateTime.Parse(request.FromAt, CultureInfo.InvariantCulture, DateTimeStyles.None);
            DateTime parsedToAt = DateTime.Parse(request.ToAt, CultureInfo.InvariantCulture, DateTimeStyles.None);

            EnvironmentUptimeRequestNexus nexus = new EnvironmentUptimeRequestNexus
            {
                Id = Guid.NewGuid(),
                Environment = request.Environment.Trim(),
                RequesterName = request.RequesterName.Trim(),
                FromAt = CETTimeZoneUtility.ToUtc(parsedFromAt),
                ToAt = CETTimeZoneUtility.ToUtc(parsedToAt),
                Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim(),
                Status = EnvironmentUptimeRequestStatusEnum.Pending,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
                DeletedAt = null,
            };

            await _dbContext.EnvironmentUptimeRequests.AddAsync(nexus);

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (
                ex.InnerException is PostgresException pgEx &&
                pgEx.SqlState == PostgresErrorCodes.CheckViolation)
            {
                _logger.LogError(ex, "Uptime Request ticket numbering cap (99999) reached.");
                throw new ConflictException(
                    "Uptime Request ticket numbering has reached its maximum (UPTM-99999). Contact an administrator.");
            }

            _logger.LogInformation(
                "Created new Uptime Request '{TicketId}' for environment '{Environment}'.",
                nexus.TicketId,
                nexus.Environment);

            return new EnvironmentUptimeRequestDTO
            {
                Id = nexus.Id,
                TicketNumber = nexus.TicketNumber,
                TicketId = nexus.TicketId,
                Environment = nexus.Environment,
                RequesterName = nexus.RequesterName,
                FromAt = nexus.FromAt,
                ToAt = nexus.ToAt,
                Message = nexus.Message,
                Status = nexus.Status,
                AdminMessage = nexus.AdminMessage,
                CreatedAt = nexus.CreatedAt,
            };
        }

        public async Task<EnvironmentUptimeRequestDTO> UpdateStatusAsynchronous(Guid id, UpdateEnvironmentUptimeRequestStatusDTO? request)
        {
            EnvironmentUptimeRequestsAssertion.Current.AssertValidId(id);
            EnvironmentUptimeRequestsAssertion.Current.AssertUpdateStatusRequest(request);

            EnvironmentUptimeRequestNexus? nexus = await _dbContext.EnvironmentUptimeRequests
                .FirstOrDefaultAsync(r => r.Id == id);

            if (nexus is null)
            {
                throw new NotFoundException($"Uptime Request with ID '{id}' was not found.");
            }

            nexus.Status = request!.Status;
            nexus.AdminMessage = string.IsNullOrWhiteSpace(request.AdminMessage) ? null : request.AdminMessage.Trim();

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Updated status of Uptime Request '{TicketId}' to {Status}.", nexus.TicketId, nexus.Status);

            return new EnvironmentUptimeRequestDTO
            {
                Id = nexus.Id,
                TicketNumber = nexus.TicketNumber,
                TicketId = nexus.TicketId,
                Environment = nexus.Environment,
                RequesterName = nexus.RequesterName,
                FromAt = nexus.FromAt,
                ToAt = nexus.ToAt,
                Message = nexus.Message,
                Status = nexus.Status,
                AdminMessage = nexus.AdminMessage,
                CreatedAt = nexus.CreatedAt,
            };
        }

        public async Task<bool> DeleteEnvironmentUptimeRequestAsynchronous(Guid id)
        {
            EnvironmentUptimeRequestsAssertion.Current.AssertValidId(id);

            EnvironmentUptimeRequestNexus? nexus = await _dbContext.EnvironmentUptimeRequests
                .FirstOrDefaultAsync(request => request.Id == id);

            if (nexus is null)
            {
                throw new NotFoundException($"Uptime Request with ID '{id}' was not found.");
            }

            DateTime now = DateTime.UtcNow;
            nexus.IsDeleted = true;
            nexus.DeletedAt = now;

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Soft-deleted Uptime Request '{TicketId}'.", nexus.TicketId);

            return true;
        }
    }
}
