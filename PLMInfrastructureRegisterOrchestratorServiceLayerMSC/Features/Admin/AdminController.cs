using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Factories;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin
{
    [ApiController]
    [Route(ApplicationRouteFactory.AdminRoutes.ControllerURL)]
    public sealed class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(AdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        [HttpPost(ApplicationRouteFactory.AdminRoutes.Login)]
        public async Task<ActionResult<APIResponse<AdminLoginResponseDTO>>> LoginAsynchronous(
            [FromBody] AdminLoginRequestDTO? request)
        {
            try
            {
                AdminLoginResponseDTO response = await _adminService.LoginAsynchronous(request);
                return Ok(APIResponse<AdminLoginResponseDTO>.Succeeded(response, "Logged in successfully.", 200));
            }
            catch (ValidationException valEx)
            {
                _logger.LogWarning("Admin login validation failed: {Message}", valEx.Message);
                return BadRequest(APIResponse<AdminLoginResponseDTO>.Failed(valEx.Message, valEx.ValidationErrors, 400));
            }
            catch (UnauthorizedAccessException authEx)
            {
                _logger.LogWarning("Admin login failed: {Message}", authEx.Message);
                return Unauthorized(APIResponse<AdminLoginResponseDTO>.Failed(authEx.Message, new(), 401));
            }
            catch (TooManyAttemptsException lockoutEx)
            {
                _logger.LogWarning("Admin login throttled: {Message}", lockoutEx.Message);
                return StatusCode(429, APIResponse<AdminLoginResponseDTO>.Failed(lockoutEx.Message, new(), 429));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during admin login.");
                return StatusCode(500, APIResponse<AdminLoginResponseDTO>.Failed(
                    "An unexpected error occurred while logging in.", new(), 500));
            }
        }
    }
}
