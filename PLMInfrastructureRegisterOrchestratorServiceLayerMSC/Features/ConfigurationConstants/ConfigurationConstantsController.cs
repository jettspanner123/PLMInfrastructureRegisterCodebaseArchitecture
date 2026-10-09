using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants
{
    [ApiController]
    [Route(ApplicationRouteFactory.ConfigurationConstantsRoutes.ControllerURL)]
    public sealed class ConfigurationConstantsController : ControllerBase
    {
        private readonly ConfigurationConstantsService _configurationConstantsService;
        private readonly ILogger<ConfigurationConstantsController> _logger;

        public ConfigurationConstantsController(
            ConfigurationConstantsService configurationConstantsService,
            ILogger<ConfigurationConstantsController> logger)
        {
            _configurationConstantsService = configurationConstantsService;
            _logger = logger;
        }

        [HttpGet(ApplicationRouteFactory.ConfigurationConstantsRoutes.GetOptions)]
        public async Task<ActionResult<APIResponse<List<string>>>> GetOptionsAsynchronous([FromRoute] string? fieldName)
        {
            try
            {
                string configurationKey = ConfigurationConstantsAssertion.Current.AssertOptionsFieldName(fieldName);

                List<string> options = await _configurationConstantsService.GetOptionsAsynchronous(configurationKey);

                return Ok(
                    APIResponse<List<string>>.Succeeded(
                        options,
                        "Options retrieved successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Get options validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<string>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving options.");

                return StatusCode(
                    500,
                    APIResponse<List<string>>.Failed(
                        "An unexpected error occurred while retrieving the options.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.ConfigurationConstantsRoutes.AddOption)]
        public async Task<ActionResult<APIResponse<List<string>>>> AddOptionAsynchronous(
            [FromRoute] string? fieldName,
            [FromBody] AddConfigurationConstantOptionRequestDTO? request)
        {
            try
            {
                string configurationKey = ConfigurationConstantsAssertion.Current.AssertOptionsFieldName(fieldName);
                ConfigurationConstantsAssertion.Current.AssertAddOptionRequest(request);

                List<string> options = await _configurationConstantsService.AddOptionAsynchronous(configurationKey, request!.Value!);

                return Ok(
                    APIResponse<List<string>>.Succeeded(
                        options,
                        "Option added successfully.",
                        201));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Add option validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<string>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (ConflictException conflictEx)
            {
                _logger.LogWarning("Add option conflict: {Message}", conflictEx.Message);

                return Conflict(
                    APIResponse<List<string>>.Failed(conflictEx.Message, new List<string>(), 409));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Add option not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<List<string>>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding an option.");

                return StatusCode(
                    500,
                    APIResponse<List<string>>.Failed(
                        "An unexpected error occurred while adding the option.",
                        new List<string>(),
                        500));
            }
        }
    }
}
