export default interface CreateCalendarActivityInputInterfaceModel {
  title: string;
  description: string;
  environment: string;
  responsiblePerson: string;
  contactEmail: string;
  // Naive "YYYY-MM-DDTHH:mm" straight from a datetime-local picker - same
  // shape as CreateDowntimeAnnouncementInputInterfaceModel's startAt/endAt.
  startAt: string;
  endAt: string;
}
