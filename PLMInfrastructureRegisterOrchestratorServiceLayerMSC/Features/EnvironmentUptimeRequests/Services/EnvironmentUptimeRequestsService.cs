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
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Services
{
    public sealed class EnvironmentUptimeRequestsService
    {
        private readonly ApplicationDatabaseContext _dbContext;
        private readonly ILogger<EnvironmentUptimeRequestsService> _logger;
        private readonly JiraService _jiraService;

        public EnvironmentUptimeRequestsService(
            ApplicationDatabaseContext dbContext,
            ILogger<EnvironmentUptimeRequestsService> logger,
            JiraService jiraService)
        {
            _dbContext = dbContext;
            _logger = logger;
            _jiraService = jiraService;
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
                    RequesterEmail = request.RequesterEmail,
                    FromAt = request.FromAt,
                    ToAt = request.ToAt,
                    Message = request.Message,
                    Status = request.Status,
                    AdminMessage = request.AdminMessage,
                    CreatedAt = request.CreatedAt,
                    JiraTicketKey = request.JiraTicketKey,
                    JiraTicketUrl = request.JiraTicketUrl,
                })
                .ToListAsync();
        }

        // Jira ticket creation happens IN BETWEEN two saves, not before the
        // first one - see research.md §4 in specs/002-jira-ticket-creation.
        // The Uptime Request's own generated TicketId (a Postgres IDENTITY +
        // generated-stored-column value) doesn't exist until a row is
        // actually inserted, but the Jira ticket's Description is required
        // to contain that real TicketId - so the row is inserted first,
        // Jira is called with the now-known TicketId, and on failure the
        // row is hard-deleted again before returning an error. Net effect
        // from any OTHER request's point of view: a failed attempt never
        // leaves a visible row behind, exactly as if Jira had been called
        // first - just sequenced to avoid a second Jira call to patch the
        // ticket ID in afterward.
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
                RequesterEmail = request.RequesterEmail.Trim(),
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

            JiraTicketCreationResultModel jiraResult = await _jiraService.CreateUptimeRequestTicketAsynchronous(
                nexus.TicketId,
                nexus.Environment,
                nexus.RequesterName,
                nexus.RequesterEmail,
                nexus.FromAt,
                nexus.ToAt,
                nexus.Message);

            if (!jiraResult.IsSuccess)
            {
                _logger.LogWarning(
                    "Jira ticket creation failed for attempted Uptime Request '{TicketId}': {FailureReason}",
                    nexus.TicketId,
                    jiraResult.FailureReason);

                _dbContext.TicketCreationErrors.Add(new JiraTicketCreationErrorNexus
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow,
                    AttemptedTicketId = nexus.TicketId,
                    Environment = nexus.Environment,
                    RequesterName = nexus.RequesterName,
                    RequesterEmail = nexus.RequesterEmail,
                    FromAt = nexus.FromAt,
                    ToAt = nexus.ToAt,
                    Message = nexus.Message,
                    AttemptedSummary = jiraResult.AttemptedSummary,
                    AttemptedDescription = jiraResult.AttemptedDescription,
                    FailureReason = jiraResult.FailureReason ?? "Unknown failure.",
                    JiraStatusCode = jiraResult.StatusCode,
                    JiraResponseBody = jiraResult.ResponseBody,
                });

                _dbContext.EnvironmentUptimeRequests.Remove(nexus);

                await _dbContext.SaveChangesAsync();

                throw new ExternalServiceException(
                    "Couldn't create the Jira ticket for this request — please try again or contact an admin.");
            }

            nexus.JiraTicketKey = jiraResult.TicketKey;
            nexus.JiraTicketUrl = jiraResult.TicketUrl;

            foreach (JiraEnrichmentFailureModel enrichmentFailure in jiraResult.EnrichmentFailures)
            {
                _logger.LogWarning(
                    "Jira field '{FieldName}' could not be set on ticket '{JiraTicketKey}' for Uptime Request '{TicketId}': {FailureReason}",
                    enrichmentFailure.FieldName,
                    nexus.JiraTicketKey,
                    nexus.TicketId,
                    enrichmentFailure.FailureReason);

                _dbContext.TicketCreationErrors.Add(new JiraTicketCreationErrorNexus
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow,
                    AttemptedTicketId = nexus.TicketId,
                    Environment = nexus.Environment,
                    RequesterName = nexus.RequesterName,
                    RequesterEmail = nexus.RequesterEmail,
                    FromAt = nexus.FromAt,
                    ToAt = nexus.ToAt,
                    Message = nexus.Message,
                    AttemptedSummary = jiraResult.AttemptedSummary,
                    AttemptedDescription = jiraResult.AttemptedDescription,
                    FailureReason = $"[{enrichmentFailure.FieldName}] {enrichmentFailure.FailureReason}",
                    JiraStatusCode = enrichmentFailure.StatusCode,
                    JiraResponseBody = enrichmentFailure.ResponseBody,
                });
            }

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Created new Uptime Request '{TicketId}' for environment '{Environment}' with Jira ticket '{JiraTicketKey}'.",
                nexus.TicketId,
                nexus.Environment,
                nexus.JiraTicketKey);

            return new EnvironmentUptimeRequestDTO
            {
                Id = nexus.Id,
                TicketNumber = nexus.TicketNumber,
                TicketId = nexus.TicketId,
                Environment = nexus.Environment,
                RequesterName = nexus.RequesterName,
                RequesterEmail = nexus.RequesterEmail,
                FromAt = nexus.FromAt,
                ToAt = nexus.ToAt,
                Message = nexus.Message,
                Status = nexus.Status,
                AdminMessage = nexus.AdminMessage,
                CreatedAt = nexus.CreatedAt,
                JiraTicketKey = nexus.JiraTicketKey,
                JiraTicketUrl = nexus.JiraTicketUrl,
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
                RequesterEmail = nexus.RequesterEmail,
                FromAt = nexus.FromAt,
                ToAt = nexus.ToAt,
                Message = nexus.Message,
                Status = nexus.Status,
                AdminMessage = nexus.AdminMessage,
                CreatedAt = nexus.CreatedAt,
                JiraTicketKey = nexus.JiraTicketKey,
                JiraTicketUrl = nexus.JiraTicketUrl,
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
