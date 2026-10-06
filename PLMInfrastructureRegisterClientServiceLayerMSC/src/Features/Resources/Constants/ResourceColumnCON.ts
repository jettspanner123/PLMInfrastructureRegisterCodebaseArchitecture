// Column order and labels mirror the original spreadsheet exactly — labels
// are the literal legacy header text (per the naming rule: UI-facing text is
// exempt from the project's code-identifier naming conventions).
export interface ResourceColumnDef {
  key: string;
  label: string;
  // Locked columns identify the row itself (hostname, environment) — hiding
  // them would leave a row of data with no way to tell what it belongs to,
  // so they're always visible and can't be unchecked in the column picker.
  locked?: boolean;
}

export default class ResourceColumnCON {
  public static readonly ENVIRONMENT_COLUMN_KEY: string = 'environmentTag';
  // Sentinel for the environment header-filter's "no filter, show every
  // machine" option - not a real EnvironmentTag value itself.
  public static readonly ALL_ENVIRONMENTS_FILTER_VALUE: string = 'ALL';

  public static readonly COLUMNS: ResourceColumnDef[] = [
    { key: 'hostname', label: 'HOSTNAME', locked: true },
    { key: 'environmentTag', label: 'ENVIRONMENT (TAG)', locked: true },
    { key: 'function', label: 'FUNCTION' },
    { key: 'status', label: 'STATUS' },
    { key: 'dailyBackupTime', label: 'Daily Backup Time (CET)' },
    { key: 'cronJobsTaskScheduler', label: 'Cronjobs / Task scheduler' },
    { key: 'dns', label: 'DNS' },
    { key: 'url', label: 'URL' },
    { key: 'privateIPAddress', label: 'PRIVATE IP ADDRESS' },
    { key: 'category', label: 'TYPE' },
    { key: 'subscription', label: 'SUBSCRIPTION' },
    { key: 'spinner', label: 'Spinner_R2024x_AtlasCopco_Exp29Oct2026' },
    { key: 'autoShutdownEnabled', label: 'Auto Shutdown' },
    { key: 'autoShutdownSchedule', label: 'Auto Shutdown Schedule' },
    { key: 'autoShutdownStartTime', label: 'Auto Shutdown Start Time (CET)' },
    { key: 'autoShutdownEndTime', label: 'Auto Shutdown End Time (CET)' },
    { key: 'resourceGroup', label: 'RESOURCE GROUP' },
    { key: 'location', label: 'LOCATION' },
    { key: 'virtualNetworkSubnet', label: 'VIRTUAL NETWORK/SUBNET' },
    { key: 'proximityGroup', label: 'PROXIMITY GROUP' },
    { key: 'operatingSystem', label: 'OPERATING SYSTEM' },
    { key: 'size', label: 'SIZE' },
    { key: 'cpuCores', label: 'CPU' },
    { key: 'ramGB', label: 'RAM' },
    { key: 'disk1OSPerformance', label: 'DISK 1 (OS) PERFORMANCE' },
    { key: 'disk2DataPerformance', label: 'DISK 2 (DATA) PERFORMANCE' },
    { key: 'disk3DataType', label: 'DISK 3 (DATA) TYPE3' },
    { key: 'disk4DataType', label: 'DISK 4 (DATA) TYPE4' },
    { key: 'disk5DataType', label: 'DISK 5 (DATA) TYPE5' },
    { key: 'disk6DataType', label: 'DISK 6 (DATA) TYPE6' },
    { key: 'databaseInstance', label: 'Database Instance' },
    { key: 'databaseName', label: 'Database Name' },
    { key: 'publicIPAddress', label: 'PUBLIC IP ADDRESS' },
    { key: 'disks', label: 'DISKS' },
    { key: 'planVersion', label: 'PLAN/VERSION' },
    { key: 'backupSchedule', label: 'Backup Schedule' },
    { key: 'backupStatus', label: 'Backup Status' },
    { key: 'infrastructureSupportAzure', label: 'Infrastucture Support (Azure)' },
    { key: 'infrastructureSupportServiceLevel', label: 'Infrastucture Support Service Level (Insight)' },
    { key: 'dbaSupport', label: 'DBA Support' },
    { key: 'dbaSupportServiceLevel', label: 'DBA Support Service Level' },
    { key: 'protocol', label: 'Protocol' },
    { key: 'port', label: 'Port' },
    { key: 'tomEEPortConnector', label: 'TomEE Port Connector' },
    { key: 'smtpEnabled', label: 'SMTP Enabled' },
    { key: 'smtpHostname', label: 'SMTP Hostname' },
    { key: 'smtpSender', label: 'SMTP Sender' },
    { key: 'comment', label: 'Comment' },
    { key: 'oracleDBASupportRequired', label: 'Oracle DBA Support Required' },
    { key: 'javaSupportRequired', label: 'JAVA Support Required' },
    { key: 'apacheSupportRequired', label: 'Apache Support Required' },
    { key: 'backupRequired', label: 'Backup Required' },
    { key: 'osSupportIncludingPatching', label: 'OS Support(inc patching)' },
    { key: 'azureMonitoringSetupRequired', label: 'Azure montioring setup required' },
    { key: 'responseSLARequirement', label: 'Response SLA Requirement' },
    { key: 'atosAgentDeployed', label: 'Atos Agent Deployed' },
    { key: 'threeDExperienceSXILicense', label: '3DExperience SXI License' },
    { key: 'monitoringHealthcheckURL', label: 'Monitoring healthcheck URL' },
    { key: 'vmCreationDate', label: 'VM creation date' },
    { key: 'vmDeletionDate', label: 'VM deletion date' },
    { key: 'newHostname', label: 'New HOSTName' },
  ];

  // Derived from COLUMNS above, not hand-maintained separately - a class
  // static property can read an earlier static property of the same class
  // during initialization, so these stay in sync with COLUMNS automatically.
  public static readonly ALL_COLUMN_KEYS: string[] = ResourceColumnCON.COLUMNS.map((column) => column.key);

  public static readonly LOCKED_COLUMN_KEYS: Set<string> = new Set(
    ResourceColumnCON.COLUMNS.filter((column) => column.locked).map((column) => column.key)
  );
}
