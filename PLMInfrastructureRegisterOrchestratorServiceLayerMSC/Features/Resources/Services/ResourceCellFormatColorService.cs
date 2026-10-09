using System.Text.Json;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Utilities;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services
{
    // Sits on top of the generic ConfigurationConstantsService rather than
    // extending it - that service only ever handles a flat list of opaque
    // display strings (what Status/Sponsor need), and stays exactly that
    // generic. A color needs a name attached to it, which Status/Sponsor
    // never will, so the structured value lives entirely in this
    // Resources-specific layer: each raw string in the shared list is, for
    // this field only, a JSON-encoded CustomColorOptionDTO.
    public sealed class ResourceCellFormatColorService
    {
        private const string ConfigurationKey = "RESOURCE_CELL_FORMAT_CUSTOM_COLORS";

        private readonly ConfigurationConstantsService _configurationConstantsService;

        public ResourceCellFormatColorService(ConfigurationConstantsService configurationConstantsService)
        {
            _configurationConstantsService = configurationConstantsService;
        }

        public async Task<List<CustomColorOptionDTO>> GetCustomColorsAsynchronous()
        {
            List<string> rawOptions = await _configurationConstantsService.GetOptionsAsynchronous(ConfigurationKey);

            return rawOptions
                .Select(raw => JsonSerializer.Deserialize<CustomColorOptionDTO>(raw))
                .Where(color => color is not null)
                .Select(color => color!)
                .ToList();
        }

        public async Task<List<CustomColorOptionDTO>> AddCustomColorAsynchronous(AddCustomColorOptionRequestDTO request)
        {
            List<CustomColorOptionDTO> existingColors = await GetCustomColorsAsynchronous();

            string canonicalHex = ResourceCellFormatColorUtility.Current.NormalizeToHex(request.Color!, request.Format!);

            if (existingColors.Any(color => string.Equals(color.ColorName, request.ColorName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException($"A color named '{request.ColorName}' already exists.");
            }

            if (existingColors.Any(color =>
                string.Equals(
                    ResourceCellFormatColorUtility.Current.NormalizeToHex(color.Color!, color.Format!),
                    canonicalHex,
                    StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException("That color already exists under a different name.");
            }

            CustomColorOptionDTO newColor = new()
            {
                Id = Guid.NewGuid(),
                ColorName = request.ColorName,
                Format = request.Format,
                Color = request.Color,
                CreatedBy = request.CreatedByClientId,
                CreatedAt = DateTime.UtcNow,
            };

            await _configurationConstantsService.AddOptionAsynchronous(ConfigurationKey, JsonSerializer.Serialize(newColor));

            existingColors.Add(newColor);
            return existingColors;
        }

        public async Task<List<CustomColorOptionDTO>> UpdateCustomColorAsynchronous(Guid id, UpdateCustomColorOptionRequestDTO request)
        {
            List<CustomColorOptionDTO> existingColors = await GetCustomColorsAsynchronous();

            CustomColorOptionDTO? target = existingColors.FirstOrDefault(color => color.Id == id);
            if (target is null)
            {
                throw new NotFoundException($"No color with id '{id}' was found.");
            }

            string canonicalHex = ResourceCellFormatColorUtility.Current.NormalizeToHex(request.Color!, request.Format!);

            if (existingColors.Any(color =>
                color.Id != id && string.Equals(color.ColorName, request.ColorName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException($"A color named '{request.ColorName}' already exists.");
            }

            if (existingColors.Any(color =>
                color.Id != id &&
                string.Equals(
                    ResourceCellFormatColorUtility.Current.NormalizeToHex(color.Color!, color.Format!),
                    canonicalHex,
                    StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException("That color already exists under a different name.");
            }

            target.ColorName = request.ColorName;
            target.Format = request.Format;
            target.Color = request.Color;

            await _configurationConstantsService.ReplaceOptionsAsynchronous(
                ConfigurationKey,
                existingColors.Select(color => JsonSerializer.Serialize(color)).ToList());

            return existingColors;
        }

        public async Task<List<CustomColorOptionDTO>> DeleteCustomColorAsynchronous(Guid id)
        {
            List<CustomColorOptionDTO> existingColors = await GetCustomColorsAsynchronous();

            int removedCount = existingColors.RemoveAll(color => color.Id == id);
            if (removedCount == 0)
            {
                throw new NotFoundException($"No color with id '{id}' was found.");
            }

            // Deleting a color only removes it from this growable list - any
            // resource cell already formatted with its literal hex value
            // keeps rendering exactly as before (a cell's own
            // BackgroundColorKey is a self-contained hex string, never a
            // reference back into this list - see
            // ResourceCellFormatHelper.isCustomColor on the frontend), it
            // just stops being offered as a named option going forward.
            await _configurationConstantsService.ReplaceOptionsAsynchronous(
                ConfigurationKey,
                existingColors.Select(color => JsonSerializer.Serialize(color)).ToList());

            return existingColors;
        }
    }
}
