export default interface CreateDowntimeAnnouncementInputInterfaceModel {
  heading: string;
  description: string;
  // Naive "YYYY-MM-DDTHH:mm" straight from a <input type="datetime-local">
  // field - same shape as CreateEnvironmentUptimeRequestInputInterfaceModel's
  // fromAt/toAt.
  startAt: string;
  endAt: string;
  environments: string[];
}
