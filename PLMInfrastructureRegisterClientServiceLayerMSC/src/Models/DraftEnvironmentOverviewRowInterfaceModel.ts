// Field set for the one new, locally-editable row the Environment Overview
// screen's "Add Environment" button inserts - deliberately a separate shape
// from EnvironmentOverviewInterfaceModel (no id/isDecommissioned) since those
// don't exist until the row is actually saved. Keys match
// EnvironmentOverviewCON.TEXT_COLUMNS' keys exactly, plus actionItemsUpdates
// (its own textarea, same as the read-only table's own layout).
export default interface DraftEnvironmentOverviewRowInterfaceModel {
  environment: string;
  purpose: string;
  sponsor: string;
  currentUptimeSchedule: string;
  priority1: string;
  priority2: string;
  priority3: string;
  configurationCustomisationVersion: string;
  dnsurl: string;
  actionItemsUpdates: string;
}
