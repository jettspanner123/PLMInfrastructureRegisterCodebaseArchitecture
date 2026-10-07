// Mirrors the backend's CreateEnvironmentOverviewRequestDTO field-for-field.
// DisplayOrder/IsDecommissioned are deliberately absent - both are derived
// server-side for a brand-new row.
export default interface CreateEnvironmentOverviewRequestInterfaceModel {
  environment: string;
  purpose: string | null;
  sponsor: string | null;
  currentUptimeSchedule: string | null;
  priority1: string | null;
  priority2: string | null;
  priority3: string | null;
  actionItemsUpdates: string | null;
  configurationCustomisationVersion: string | null;
  dnsurl: string | null;
}
