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

                (string answer, Guid conversationId) = await _chatAssistantService.AskQuestionAsynchronous(
                    request!.ClientId!, request.ConversationId, request.Question!);

                return Ok(
                    APIResponse<AskQuestionResponseDTO>.Succeeded(
                        new AskQuestionResponseDTO { Answer = answer, ConversationId = conversationId },
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

        [HttpGet(ApplicationRouteFactory.ChatAssistantRoutes.GetConversations)]
        public async Task<ActionResult<APIResponse<List<ChatConversationSummaryDTO>>>> GetConversationsAsynchronous(
            [FromQuery] string? clientId)
        {
            try
            {
                ChatAssistantAssertion.Current.AssertGetConversationsRequest(clientId);

                List<ChatConversationSummaryDTO> conversations = await _chatAssistantService.GetConversationsAsynchronous(clientId!);

                return Ok(
                    APIResponse<List<ChatConversationSummaryDTO>>.Succeeded(
                        conversations,
                        "Conversations retrieved successfully.",
                        200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Get conversations validation failed: {Message}", valEx.Message);

                return BadRequest(
                    APIResponse<List<ChatConversationSummaryDTO>>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving conversations.");

                return StatusCode(
                    500,
                    APIResponse<List<ChatConversationSummaryDTO>>.Failed(
                        "An unexpected error occurred while retrieving conversations.",
                        new List<string>(),
                        500));
            }
        }

        [HttpGet(ApplicationRouteFactory.ChatAssistantRoutes.GetConversationMessages)]
        public async Task<ActionResult<APIResponse<List<ChatMessageDTO>>>> GetConversationMessagesAsynchronous(
            [FromRoute] Guid id)
        {
            try
            {
                List<ChatMessageDTO> messages = await _chatAssistantService.GetConversationMessagesAsynchronous(id);

                return Ok(
                    APIResponse<List<ChatMessageDTO>>.Succeeded(
                        messages,
                        "Conversation messages retrieved successfully.",
                        200));
            }
            catch (NotFoundException notFoundEx)
            {
                _logger.LogWarning("Get conversation messages not found: {Message}", notFoundEx.Message);

                return NotFound(
                    APIResponse<List<ChatMessageDTO>>.Failed(notFoundEx.Message, new List<string>(), 404));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while retrieving conversation messages.");

                return StatusCode(
                    500,
                    APIResponse<List<ChatMessageDTO>>.Failed(
                        "An unexpected error occurred while retrieving conversation messages.",
                        new List<string>(),
                        500));
            }
        }
    }
}
