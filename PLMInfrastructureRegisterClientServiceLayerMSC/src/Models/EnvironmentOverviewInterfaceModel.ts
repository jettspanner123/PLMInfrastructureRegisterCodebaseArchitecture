// Mirrors the backend's EnvironmentOverviewDTO field-for-field (camelCase,
// per System.Text.Json's default naming policy).
export default interface EnvironmentOverviewInterfaceModel {
  id: string;
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
  status: string;
}
