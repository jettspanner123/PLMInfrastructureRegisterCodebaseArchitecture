using System.Text.Json;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services
{
    // Sits on top of the generic ConfigurationConstantsService exactly like
    // ResourceCellFormatColorService does for custom colors (see that file's
    // own comment) - a legend entry needs a name attached to a color, which
    // the generic service's own opaque-string list has no concept of, so the
    // structured value lives entirely here: each raw string in the shared
    // list is, for this field only, a JSON-encoded LegendEntryDTO.
    //
    // The two system legends (Azure-sourced data / Custom tags) are seeded
    // as real rows in this same list via migration, flagged
    // IsSystemLegend = true - their colors are structurally tied to this
    // app's actual header-coloring logic elsewhere
    // (TableHeaderCellSharedComponent's own bg-[#0C2086], and the
    // !bg-[#C41E3A] override for StartStop_ columns in
    // ResourcesScreenController.tsx), so Update/Delete refuse to touch them.
    public sealed class ResourceTableLegendService
    {
        private const string ConfigurationKey = "RESOURCE_TABLE_LEGEND_ENTRIES";

        private readonly ConfigurationConstantsService _configurationConstantsService;

        public ResourceTableLegendService(ConfigurationConstantsService configurationConstantsService)
        {
            _configurationConstantsService = configurationConstantsService;
        }

        public async Task<List<LegendEntryDTO>> GetLegendsAsynchronous()
        {
            List<string> rawOptions = await _configurationConstantsService.GetOptionsAsynchronous(ConfigurationKey);

            return rawOptions
                .Select(raw => JsonSerializer.Deserialize<LegendEntryDTO>(raw))
                .Where(legend => legend is not null)
                .Select(legend => legend!)
                .ToList();
        }

        public async Task<List<LegendEntryDTO>> AddLegendAsynchronous(AddLegendEntryRequestDTO request)
        {
            List<LegendEntryDTO> existingLegends = await GetLegendsAsynchronous();

            string canonicalHex = ResourceCellFormatColorUtility.Current.NormalizeToHex(request.Color!, request.Format!);

            if (existingLegends.Any(legend => string.Equals(legend.Name, request.Name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException($"A legend named '{request.Name}' already exists.");
            }

            if (existingLegends.Any(legend =>
                string.Equals(
                    ResourceCellFormatColorUtility.Current.NormalizeToHex(legend.Color!, legend.Format!),
                    canonicalHex,
                    StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException("That color is already used by another legend.");
            }

            LegendEntryDTO newLegend = new()
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Format = request.Format,
                Color = request.Color,
                IsSystemLegend = false,
                CreatedBy = request.CreatedByClientId,
                CreatedAt = DateTime.UtcNow,
            };

            await _configurationConstantsService.AddOptionAsynchronous(ConfigurationKey, JsonSerializer.Serialize(newLegend));

            existingLegends.Add(newLegend);
            return existingLegends;
        }

        public async Task<List<LegendEntryDTO>> UpdateLegendAsynchronous(Guid id, UpdateLegendEntryRequestDTO request)
        {
            List<LegendEntryDTO> existingLegends = await GetLegendsAsynchronous();

            LegendEntryDTO? target = existingLegends.FirstOrDefault(legend => legend.Id == id);
            if (target is null)
            {
                throw new NotFoundException($"No legend with id '{id}' was found.");
            }

            if (target.IsSystemLegend)
            {
                throw new ValidationException("System legends can't be edited.");
            }

            string canonicalHex = ResourceCellFormatColorUtility.Current.NormalizeToHex(request.Color!, request.Format!);

            if (existingLegends.Any(legend =>
                legend.Id != id && string.Equals(legend.Name, request.Name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException($"A legend named '{request.Name}' already exists.");
            }

            if (existingLegends.Any(legend =>
                legend.Id != id &&
                string.Equals(
                    ResourceCellFormatColorUtility.Current.NormalizeToHex(legend.Color!, legend.Format!),
                    canonicalHex,
                    StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException("That color is already used by another legend.");
            }

            target.Name = request.Name;
            target.Format = request.Format;
            target.Color = request.Color;

            await _configurationConstantsService.ReplaceOptionsAsynchronous(
                ConfigurationKey,
                existingLegends.Select(legend => JsonSerializer.Serialize(legend)).ToList());

            return existingLegends;
        }

        public async Task<List<LegendEntryDTO>> DeleteLegendAsynchronous(Guid id)
        {
            List<LegendEntryDTO> existingLegends = await GetLegendsAsynchronous();

            LegendEntryDTO? target = existingLegends.FirstOrDefault(legend => legend.Id == id);
            if (target is null)
            {
                throw new NotFoundException($"No legend with id '{id}' was found.");
            }

            if (target.IsSystemLegend)
            {
                throw new ValidationException("System legends can't be deleted.");
            }

            existingLegends.Remove(target);

            await _configurationConstantsService.ReplaceOptionsAsynchronous(
                ConfigurationKey,
                existingLegends.Select(legend => JsonSerializer.Serialize(legend)).ToList());

            return existingLegends;
        }
    }
}
