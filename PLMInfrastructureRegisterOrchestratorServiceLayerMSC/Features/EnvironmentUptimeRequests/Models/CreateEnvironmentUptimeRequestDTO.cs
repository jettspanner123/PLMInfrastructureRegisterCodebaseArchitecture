namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Models
{
    public sealed class CreateEnvironmentUptimeRequestDTO
    {
        public string Environment { get; set; } = string.Empty;

        // Naive local-time strings straight off a <input type="datetime-local">
        // field (e.g. "2026-03-15T14:30") - interpreted as fixed CET (UTC+1,
        // never DST-shifted) wall-clock time server-side, never as UTC and
        // never as the server's own local time.
        public string FromAt { get; set; } = string.Empty;

        public string ToAt { get; set; } = string.Empty;

        public string? Message { get; set; }
    }
}
