namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    public sealed class UpdateUptimeScheduleRequestDTO
    {
        // Already-composed by the frontend (Mode/Status/days/times folded
        // into one string) - same value UpdateField's own "CurrentUptimeSchedule"
        // case used to receive.
        public string? CurrentUptimeSchedule { get; set; }

        // Optional - the raw text from the modal's own Notes textarea.
        public string? UptimeScheduleNote { get; set; }
    }
}
