namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Models
{
    public sealed class CreateCalendarActivityDTO
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Environment { get; set; } = string.Empty;

        public string ResponsiblePerson { get; set; } = string.Empty;

        public string ContactEmail { get; set; } = string.Empty;

        // Naive "YYYY-MM-DDTHH:mm" from a <input type="datetime-local"> field,
        // same shape as CreateDowntimeAnnouncementDTO.StartAt/EndAt.
        public string StartAt { get; set; } = string.Empty;

        public string EndAt { get; set; } = string.Empty;
    }
}
