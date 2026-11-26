// Mirrors the backend's CalendarActivityDTO field-for-field (camelCase, per
// System.Text.Json's default naming policy). createdAt is used only to
// derive display color/ordering client-side - never rendered as a field.
export default interface CalendarActivityInterfaceModel {
  id: string;
  title: string;
  description: string;
  environment: string;
  responsiblePerson: string;
  contactEmail: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}
