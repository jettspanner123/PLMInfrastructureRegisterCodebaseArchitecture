using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Services
{
    public sealed class FeatureRequestsService
    {
        private readonly ApplicationDatabaseContext _dbContext;
        private readonly ILogger<FeatureRequestsService> _logger;

        public FeatureRequestsService(
            ApplicationDatabaseContext dbContext,
            ILogger<FeatureRequestsService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<List<FeatureRequestDTO>> GetAllFeatureRequestsAsynchronous()
        {
            return await _dbContext.FeatureRequests
                .AsNoTracking()
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new FeatureRequestDTO
                {
                    Id = r.Id,
                    Title = r.Title,
                    Description = r.Description,
                    Category = r.Category,
                    Priority = r.Priority,
                    Status = r.Status,
                    RequesterName = r.RequesterName,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                })
                .ToListAsync();
        }

        public async Task<FeatureRequestDTO> CreateFeatureRequestAsynchronous(CreateFeatureRequestDTO request)
        {
            FeatureRequestsAssertion.Current.AssertCreateRequest(request);

            DateTime now = DateTime.UtcNow;
            FeatureRequestNexus nexus = new FeatureRequestNexus
            {
                Id = Guid.NewGuid(),
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Category = request.Category,
                Priority = request.Priority,
                Status = FeatureRequestStatusEnum.UnderReview,
                RequesterName = request.RequesterName.Trim(),
                CreatedAt = now,
                UpdatedAt = now,
                IsDeleted = false,
                DeletedAt = null,
            };

            await _dbContext.FeatureRequests.AddAsync(nexus);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Created new feature request with ID '{Id}' and title '{Title}'.", nexus.Id, nexus.Title);

            return new FeatureRequestDTO
            {
                Id = nexus.Id,
                Title = nexus.Title,
                Description = nexus.Description,
                Category = nexus.Category,
                Priority = nexus.Priority,
                Status = nexus.Status,
                RequesterName = nexus.RequesterName,
                CreatedAt = nexus.CreatedAt,
                UpdatedAt = nexus.UpdatedAt,
            };
        }

        public async Task<FeatureRequestDTO> UpdateFeatureRequestStatusAsynchronous(Guid id, UpdateFeatureRequestStatusDTO request)
        {
            FeatureRequestsAssertion.Current.AssertValidId(id);
            FeatureRequestsAssertion.Current.AssertUpdateStatusRequest(request);

            FeatureRequestNexus? nexus = await _dbContext.FeatureRequests
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

            if (nexus is null)
            {
                throw new NotFoundException($"Feature request with ID '{id}' was not found.");
            }

            nexus.Status = request.Status;
            nexus.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Updated status of feature request '{Id}' to '{Status}'.", nexus.Id, nexus.Status);

            return new FeatureRequestDTO
            {
                Id = nexus.Id,
                Title = nexus.Title,
                Description = nexus.Description,
                Category = nexus.Category,
                Priority = nexus.Priority,
                Status = nexus.Status,
                RequesterName = nexus.RequesterName,
                CreatedAt = nexus.CreatedAt,
                UpdatedAt = nexus.UpdatedAt,
            };
        }

        public async Task<bool> DeleteFeatureRequestAsynchronous(Guid id)
        {
            FeatureRequestsAssertion.Current.AssertValidId(id);

            FeatureRequestNexus? nexus = await _dbContext.FeatureRequests
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

            if (nexus is null)
            {
                throw new NotFoundException($"Feature request with ID '{id}' was not found.");
            }

            DateTime now = DateTime.UtcNow;
            nexus.IsDeleted = true;
            nexus.DeletedAt = now;
            nexus.UpdatedAt = now;

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Soft-deleted feature request with ID '{Id}'.", nexus.Id);

            return true;
        }
    }
}
