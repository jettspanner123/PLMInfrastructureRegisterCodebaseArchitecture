using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models.Classes;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Services
{
    public sealed class ConfigurationConstantsService
    {
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;

        public ConfigurationConstantsService(ApplicationDatabaseContext applicationDatabaseContext)
        {
            _applicationDatabaseContext = applicationDatabaseContext;
        }

        // configurationKey is already resolved from the public fieldName via
        // ConfigurationConstantsAssertion.AssertOptionsFieldName before
        // either of these run - shared by every growable-dropdown field
        // across the whole app, not one GetXOptions/AddXOption pair per
        // field per feature.
        public async Task<List<string>> GetOptionsAsynchronous(string configurationKey)
        {
            ConfigurationConstantClass? configurationConstant = await _applicationDatabaseContext.ConfigurationConstants
                .AsNoTracking()
                .FirstOrDefaultAsync(constant => constant.ConfigurationKey == configurationKey);

            if (configurationConstant is null) return new List<string>();

            return JsonSerializer.Deserialize<List<string>>(configurationConstant.ConfigurationValue) ?? new List<string>();
        }

        public async Task<List<string>> AddOptionAsynchronous(string configurationKey, string value)
        {
            ConfigurationConstantClass? configurationConstant = await _applicationDatabaseContext.ConfigurationConstants
                .FirstOrDefaultAsync(constant => constant.ConfigurationKey == configurationKey);

            if (configurationConstant is null)
            {
                throw new NotFoundException($"Configuration key '{configurationKey}' was not found.");
            }

            List<string> options = JsonSerializer.Deserialize<List<string>>(configurationConstant.ConfigurationValue) ?? new List<string>();

            if (options.Any(existingOption => string.Equals(existingOption, value, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ConflictException($"Option '{value}' already exists.");
            }

            options.Add(value);
            configurationConstant.ConfigurationValue = JsonSerializer.Serialize(options);
            configurationConstant.UpdatedAt = DateTime.UtcNow;
            await _applicationDatabaseContext.SaveChangesAsync();

            return options;
        }
    }
}
