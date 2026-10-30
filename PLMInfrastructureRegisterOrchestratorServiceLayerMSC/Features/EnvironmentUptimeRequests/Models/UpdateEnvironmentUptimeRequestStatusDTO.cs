namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models
{
    public sealed class UpdateEnvironmentUptimeRequestStatusDTO
    {
        public EnvironmentUptimeRequestStatusEnum Status { get; set; }

        // Optional - an admin can change just the status, just the message,
        // or both together in one save.
        public string? AdminMessage { get; set; }
    }
}
