using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions
{
    [ApiController]
    [Route(ApplicationRouteFactory.SubscriptionsRoutes.ControllerURL)]
    public sealed class SubscriptionsController : ControllerBase
    {
        private readonly SubscriptionsService _subscriptionsService;
        private readonly ILogger<SubscriptionsController> _logger;

        public SubscriptionsController(SubscriptionsService subscriptionsService, ILogger<SubscriptionsController> logger)
        {
            _subscriptionsService = subscriptionsService;
            _logger = logger;
        }

        [HttpGet(ApplicationRouteFactory.SubscriptionsRoutes.GetConfiguredSubscriptions)]
        public async Task<ActionResult<APIResponse<List<ConfiguredSubscriptionDTO>>>> GetConfiguredSubscriptionsAsynchronous()
        {
            try
            {
                List<ConfiguredSubscriptionDTO> subscriptions = await _subscriptionsService.GetConfiguredSubscriptionsAsynchronous();

                return Ok(
                    APIResponse<List<ConfiguredSubscriptionDTO>>.Succeeded(
                        subscriptions,
                        "Configured subscriptions retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving configured subscriptions.");

                return StatusCode(
                    500,
                    APIResponse<List<ConfiguredSubscriptionDTO>>.Failed(
                        "An unexpected error occurred while retrieving configured subscriptions.",
                        new List<string>(),
                        500));
            }
        }

        [HttpGet(ApplicationRouteFactory.SubscriptionsRoutes.GetAvailableAzureSubscriptions)]
        public async Task<ActionResult<APIResponse<List<AvailableAzureSubscriptionDTO>>>> GetAvailableAzureSubscriptionsAsynchronous()
        {
            try
            {
                List<AvailableAzureSubscriptionDTO> subscriptions = await _subscriptionsService.GetAvailableAzureSubscriptionsAsynchronous();

                return Ok(
                    APIResponse<List<AvailableAzureSubscriptionDTO>>.Succeeded(
                        subscriptions,
                        "Available Azure subscriptions retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving available Azure subscriptions.");

                return StatusCode(
                    500,
                    APIResponse<List<AvailableAzureSubscriptionDTO>>.Failed(
                        "An unexpected error occurred while retrieving available Azure subscriptions.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPost(ApplicationRouteFactory.SubscriptionsRoutes.AddSubscription)]
        public async Task<ActionResult<APIResponse<ConfiguredSubscriptionDTO>>> AddSubscriptionAsynchronous(
            [FromBody] AddSubscriptionRequestDTO? request)
        {
            try
            {
                SubscriptionsAssertion.Current.AssertAddSubscriptionRequest(request);

                ConfiguredSubscriptionDTO subscription = await _subscriptionsService.AddSubscriptionAsynchronous(request!);

                return Ok(
                    APIResponse<ConfiguredSubscriptionDTO>.Succeeded(
                        subscription,
                        "Subscription added successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Add subscription validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<ConfiguredSubscriptionDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (ConflictException conflictEx)
            {
                _logger.LogWarning("Add subscription conflict: {Message}", conflictEx.Message);

                return Conflict(
                    APIResponse<ConfiguredSubscriptionDTO>.Failed(conflictEx.Message, new List<string>(), 409));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Add subscription not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<ConfiguredSubscriptionDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding a subscription.");

                return StatusCode(
                    500,
                    APIResponse<ConfiguredSubscriptionDTO>.Failed(
                        "An unexpected error occurred while adding the subscription.",
                        new List<string>(),
                        500));
            }
        }

        [HttpPut(ApplicationRouteFactory.SubscriptionsRoutes.UpdateDisplayName)]
        public async Task<ActionResult<APIResponse<ConfiguredSubscriptionDTO>>> UpdateDisplayNameAsynchronous(
            [FromRoute] Guid id,
            [FromBody] UpdateSubscriptionDisplayNameRequestDTO? request)
        {
            try
            {
                SubscriptionsAssertion.Current.AssertUpdateDisplayNameRequest(request);

                ConfiguredSubscriptionDTO subscription = await _subscriptionsService.UpdateDisplayNameAsynchronous(id, request!);

                return Ok(
                    APIResponse<ConfiguredSubscriptionDTO>.Succeeded(
                        subscription,
                        "Display name updated successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Update display name validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<ConfiguredSubscriptionDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Update display name not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<ConfiguredSubscriptionDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating a subscription's display name.");

                return StatusCode(
                    500,
                    APIResponse<ConfiguredSubscriptionDTO>.Failed(
                        "An unexpected error occurred while updating the display name.",
                        new List<string>(),
                        500));
            }
        }

        [HttpDelete(ApplicationRouteFactory.SubscriptionsRoutes.DeleteSubscription)]
        public async Task<ActionResult<APIResponse<SubscriptionDeletionResultDTO>>> DeleteSubscriptionAsynchronous(
            [FromRoute] Guid id)
        {
            try
            {
                SubscriptionDeletionResultDTO result = await _subscriptionsService.DeleteSubscriptionAsynchronous(id);

                return Ok(
                    APIResponse<SubscriptionDeletionResultDTO>.Succeeded(
                        result,
                        "Subscription removed successfully.",
                        200));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Delete subscription not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<SubscriptionDeletionResultDTO>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting a subscription.");

                return StatusCode(
                    500,
                    APIResponse<SubscriptionDeletionResultDTO>.Failed(
                        "An unexpected error occurred while deleting the subscription.",
                        new List<string>(),
                        500));
            }
        }
    }
}
