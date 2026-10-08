using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services
{
    public sealed class ResourcesService
    {
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;

        public ResourcesService(ApplicationDatabaseContext applicationDatabaseContext)
        {
            _applicationDatabaseContext = applicationDatabaseContext;
        }

        public async Task<List<ResourceNexus>> GetAllResourcesAsynchronous()
        {
            return await _applicationDatabaseContext.Resources
                .AsNoTracking()
                .OrderBy(resource => resource.Hostname)
                .ToListAsync();
        }

        public async Task<List<ResourceCellFormatDTO>> GetCellFormatsAsynchronous()
        {
            return await _applicationDatabaseContext.ResourceCellFormats
                .AsNoTracking()
                .Select(cellFormat => new ResourceCellFormatDTO
                {
                    ResourceId = cellFormat.ResourceId,
                    ColumnKey = cellFormat.ColumnKey,
                    IsBold = cellFormat.IsBold,
                    IsItalic = cellFormat.IsItalic,
                    BackgroundColorKey = cellFormat.BackgroundColorKey,
                })
                .ToListAsync();
        }

        // A merge per targeted cell, not a replace - only fields actually
        // present on the request change anything (see
        // UpdateResourceCellFormatRequestDTO). A cell that ends up back at
        // fully-default (not bold, not italic, no color) is removed rather
        // than left behind as a no-op row, keeping this table genuinely
        // sparse rather than quietly accumulating empty rows over time.
        public async Task<List<ResourceCellFormatDTO>> UpdateCellFormatAsynchronous(UpdateResourceCellFormatRequestDTO request)
        {
            foreach (ResourceCellFormatTargetDTO target in request.Cells)
            {
                ResourceCellFormatNexus? existing = await _applicationDatabaseContext.ResourceCellFormats
                    .FirstOrDefaultAsync(cellFormat =>
                        cellFormat.ResourceId == target.ResourceId && cellFormat.ColumnKey == target.ColumnKey);

                ResourceCellFormatNexus cellFormatRow = existing ?? new ResourceCellFormatNexus
                {
                    Id = Guid.NewGuid(),
                    ResourceId = target.ResourceId,
                    ColumnKey = target.ColumnKey,
                };

                if (request.IsBold.HasValue) cellFormatRow.IsBold = request.IsBold.Value;
                if (request.IsItalic.HasValue) cellFormatRow.IsItalic = request.IsItalic.Value;
                if (request.ClearBackgroundColor) cellFormatRow.BackgroundColorKey = null;
                else if (request.BackgroundColorKey is not null) cellFormatRow.BackgroundColorKey = request.BackgroundColorKey;

                cellFormatRow.UpdatedAt = DateTime.UtcNow;

                bool isNowDefault = !cellFormatRow.IsBold && !cellFormatRow.IsItalic && cellFormatRow.BackgroundColorKey is null;

                if (existing is null)
                {
                    if (!isNowDefault) _applicationDatabaseContext.ResourceCellFormats.Add(cellFormatRow);
                }
                else if (isNowDefault)
                {
                    _applicationDatabaseContext.ResourceCellFormats.Remove(existing);
                }
            }

            await _applicationDatabaseContext.SaveChangesAsync();

            return await GetCellFormatsAsynchronous();
        }
    }
}
