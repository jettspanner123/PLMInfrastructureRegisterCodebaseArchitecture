namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Models
{
    public sealed class AdminLoginRequestDTO
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}
