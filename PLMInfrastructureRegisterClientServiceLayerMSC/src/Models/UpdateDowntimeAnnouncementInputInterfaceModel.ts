// Identical shape to CreateDowntimeAnnouncementInputInterfaceModel - every
// field is editable, regardless of the announcement's current status.
export default interface UpdateDowntimeAnnouncementInputInterfaceModel {
  heading: string;
  description: string;
  startAt: string;
  endAt: string;
  environments: string[];
}
