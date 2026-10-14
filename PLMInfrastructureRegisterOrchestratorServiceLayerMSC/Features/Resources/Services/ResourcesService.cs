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
                    IsUnderline = cellFormat.IsUnderline,
                    BackgroundColorKey = cellFormat.BackgroundColorKey,
                    BackgroundOpacity = cellFormat.BackgroundOpacity,
                    TextColorKey = cellFormat.TextColorKey,
                })
                .ToListAsync();
        }

        // A merge per targeted cell, not a replace - only fields actually
        // present on the request change anything (see
        // UpdateResourceCellFormatRequestDTO). A cell that ends up back at
        // fully-default (not bold, not italic, not underline, no bg color, no text color) is removed rather
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
                    BackgroundOpacity = 100,
                };

                if (request.IsBold.HasValue) cellFormatRow.IsBold = request.IsBold.Value;
                if (request.IsItalic.HasValue) cellFormatRow.IsItalic = request.IsItalic.Value;
                if (request.IsUnderline.HasValue) cellFormatRow.IsUnderline = request.IsUnderline.Value;
                if (request.ClearBackgroundColor)
                {
                    cellFormatRow.BackgroundColorKey = null;
                    cellFormatRow.BackgroundOpacity = 100;
                }
                else
                {
                    if (request.BackgroundColorKey is not null) cellFormatRow.BackgroundColorKey = request.BackgroundColorKey;
                    if (request.BackgroundOpacity.HasValue) cellFormatRow.BackgroundOpacity = Math.Clamp(request.BackgroundOpacity.Value, 0, 100);
                }

                if (request.ClearTextColor || string.Equals(request.TextColorKey, "default", StringComparison.OrdinalIgnoreCase))
                {
                    cellFormatRow.TextColorKey = null;
                }
                else if (request.TextColorKey is not null)
                {
                    cellFormatRow.TextColorKey = request.TextColorKey.ToLowerInvariant();
                }

                cellFormatRow.UpdatedAt = DateTime.UtcNow;

                bool isNowDefault = !cellFormatRow.IsBold && !cellFormatRow.IsItalic && !cellFormatRow.IsUnderline && cellFormatRow.BackgroundColorKey is null && cellFormatRow.TextColorKey is null;

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
