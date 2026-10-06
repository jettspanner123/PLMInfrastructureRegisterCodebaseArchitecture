using Microsoft.AspNetCore.Mvc;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant
{
    [ApiController]
    [Route(ApplicationRouteFactory.ChatAssistantRoutes.ControllerURL)]
    public sealed class ChatAssistantController : ControllerBase
    {
        private readonly ChatAssistantService _chatAssistantService;
        private readonly ILogger<ChatAssistantController> _logger;

        public ChatAssistantController(ChatAssistantService chatAssistantService, ILogger<ChatAssistantController> logger)
        {
            _chatAssistantService = chatAssistantService;
            _logger = logger;
        }

        [HttpPost(ApplicationRouteFactory.ChatAssistantRoutes.AskQuestion)]
        public async Task<ActionResult<APIResponse<AskQuestionResponseDTO>>> AskQuestionAsynchronous(
            [FromBody] AskQuestionRequestDTO? request)
        {
            try
            {
                ChatAssistantAssertion.Current.AssertAskQuestionRequest(request);

                string answer = await _chatAssistantService.AskQuestionAsynchronous(request!.Question!);

                return Ok(
                    APIResponse<AskQuestionResponseDTO>.Succeeded(
                        new AskQuestionResponseDTO { Answer = answer },
                        "Answer retrieved successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Ask question validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<AskQuestionResponseDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while asking the assistant a question.");

                return StatusCode(
                    500,
                    APIResponse<AskQuestionResponseDTO>.Failed(
                        "An unexpected error occurred while contacting the assistant.",
                        new List<string>(),
                        500));
            }
        }
    }
}
