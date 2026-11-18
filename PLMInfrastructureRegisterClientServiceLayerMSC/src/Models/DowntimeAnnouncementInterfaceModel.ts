// Mirrors the backend's DowntimeAnnouncementDTO field-for-field (camelCase,
// per System.Text.Json's default naming policy).
export default interface DowntimeAnnouncementInterfaceModel {
  id: string;
  heading: string;
  description: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  endedEarlyAt: string | null;
  environments: string[];
  isActive: boolean;
  // 'Active' | 'EndedEarly' | 'Expired' | 'Scheduled' - same computation as
  // isActive, just more granular for the View Announcements history list.
  status: string;
}
