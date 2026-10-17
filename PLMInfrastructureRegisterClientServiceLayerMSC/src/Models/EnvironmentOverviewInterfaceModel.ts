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
  // The raw, full text from the Current Uptime Schedule modal's own
  // optional Notes field - re-populates that textarea for editing.
  uptimeScheduleNote: string | null;
  // Display-ready version shown in the table cell - verbatim when short,
  // AI-condensed (losslessly) when long. See ChatMessageNexus's own
  // comment on the equivalent heading/description convention for why a
  // long free-text field gets a separate display-ready counterpart.
  uptimeScheduleNoteSummary: string | null;
  configurationCustomisationVersion: string | null;
  dnsurl: string | null;
  status: string;
}
