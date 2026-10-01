// Mirrors the backend's ResourceNexus entity field-for-field (camelCase, per
// System.Text.Json's default naming policy — verified against a real API
// response rather than assumed, including the tricky acronym fields).
export default interface ResourceInterfaceModel {
  id: string;
  azureResourceId: string | null;

  // --- Dynamic fields: written only by Sync. ---
  hostname: string;
  status: 'Running' | 'Stopped' | 'Decommissioned';
  privateIPAddress: string | null;
  subscription: string | null;
  autoShutdownEnabled: boolean;
  autoShutdownSchedule: string | null;
  autoShutdownStartTime: string | null;
  autoShutdownEndTime: string | null;
  resourceGroup: string | null;
  location: string | null;
  virtualNetworkSubnet: string | null;
  operatingSystem: string | null;
  size: string | null;
  cpuCores: number | null;
  ramGB: number | null;
  disk1OSPerformance: string | null;
  disk2DataPerformance: string | null;
  disk3DataType: string | null;
  disk4DataType: string | null;

  // --- Manual fields: entered and edited directly by a user. ---
  function: string | null;
  environmentTag: string | null;
  dailyBackupTime: string | null;
  cronJobsTaskScheduler: string | null;
  dns: string | null;
  url: string | null;
  category: string | null;
  publicIPAddress: string | null;
  proximityGroup: string | null;
  disk5DataType: string | null;
  disk6DataType: string | null;
  disks: string | null;
  databaseInstance: string | null;
  databaseName: string | null;
  planVersion: string | null;
  backupSchedule: string | null;
  backupStatus: string | null;
  infrastructureSupportAzure: string | null;
  infrastructureSupportServiceLevel: string | null;
  dbaSupport: string | null;
  dbaSupportServiceLevel: string | null;
  protocol: string | null;
  port: string | null;
  tomEEPortConnector: string | null;
  smtpEnabled: string | null;
  smtpHostname: string | null;
  smtpSender: string | null;
  comment: string | null;
  oracleDBASupportRequired: string | null;
  javaSupportRequired: string | null;
  apacheSupportRequired: string | null;
  backupRequired: string | null;
  osSupportIncludingPatching: string | null;
  azureMonitoringSetupRequired: string | null;
  responseSLARequirement: string | null;
  atosAgentDeployed: string | null;
  threeDExperienceSXILicense: string | null;
  monitoringHealthcheckURL: string | null;
  vmCreationDate: string | null;
  vmDeletionDate: string | null;
  newHostname: string | null;
  spinner: string | null;
}
