export default class ApplicationUserPreferenceKeyCON {
  public static readonly THEME_PREFERENCE: string = 'THEME_PREFERENCE';
  public static readonly LAYOUT_WIDTH_PREFERENCE: string = 'LAYOUT_WIDTH_PREFERENCE';
  public static readonly RESOURCE_TABLE_VISIBLE_COLUMNS: string = 'RESOURCE_TABLE_VISIBLE_COLUMNS';
  // Opt-OUT, unlike RESOURCE_TABLE_VISIBLE_COLUMNS' opt-in list above - the
  // "StartStop_*" dynamic columns aren't known at compile time (see
  // ResourceColumnCON.COLUMNS' own comment), so they can't be seeded into
  // that static list on first load. Defaulting to visible and persisting
  // only the ones a user explicitly hid is the only way to make "a brand-
  // new StartStop_X tag just shows up" and "I can still hide one I don't
  // want" both true at once.
  public static readonly RESOURCE_TABLE_HIDDEN_DYNAMIC_COLUMNS: string = 'RESOURCE_TABLE_HIDDEN_DYNAMIC_COLUMNS';
  public static readonly RESOURCE_TABLE_ENVIRONMENT_FILTER: string = 'RESOURCE_TABLE_ENVIRONMENT_FILTER';
  public static readonly RESOURCE_TABLE_STATUS_FILTER: string = 'RESOURCE_TABLE_STATUS_FILTER';
  public static readonly RESOURCE_TABLE_SUBSCRIPTION_FILTER: string = 'RESOURCE_TABLE_SUBSCRIPTION_FILTER';
  public static readonly RESOURCE_TABLE_RESOURCE_GROUP_FILTER: string = 'RESOURCE_TABLE_RESOURCE_GROUP_FILTER';
  public static readonly RESOURCE_TABLE_LOCATION_FILTER: string = 'RESOURCE_TABLE_LOCATION_FILTER';
  public static readonly RESOURCE_TABLE_OPERATING_SYSTEM_FILTER: string = 'RESOURCE_TABLE_OPERATING_SYSTEM_FILTER';
  public static readonly RESOURCE_TABLE_SIZE_FILTER: string = 'RESOURCE_TABLE_SIZE_FILTER';
  public static readonly RESOURCE_TABLE_CATEGORY_FILTER: string = 'RESOURCE_TABLE_CATEGORY_FILTER';
  public static readonly RESOURCE_TABLE_FUNCTION_FILTER: string = 'RESOURCE_TABLE_FUNCTION_FILTER';
  public static readonly RESOURCE_TABLE_PROXIMITY_GROUP_FILTER: string = 'RESOURCE_TABLE_PROXIMITY_GROUP_FILTER';
  public static readonly RESOURCE_TABLE_VIRTUAL_NETWORK_SUBNET_FILTER: string = 'RESOURCE_TABLE_VIRTUAL_NETWORK_SUBNET_FILTER';
  public static readonly RESOURCE_TABLE_PROTOCOL_FILTER: string = 'RESOURCE_TABLE_PROTOCOL_FILTER';
  public static readonly RESOURCE_TABLE_INFRASTRUCTURE_SUPPORT_SERVICE_LEVEL_FILTER: string =
    'RESOURCE_TABLE_INFRASTRUCTURE_SUPPORT_SERVICE_LEVEL_FILTER';
  public static readonly RESOURCE_TABLE_DBA_SUPPORT_SERVICE_LEVEL_FILTER: string = 'RESOURCE_TABLE_DBA_SUPPORT_SERVICE_LEVEL_FILTER';
  public static readonly RESOURCE_TABLE_BACKUP_STATUS_FILTER: string = 'RESOURCE_TABLE_BACKUP_STATUS_FILTER';
  public static readonly RESOURCE_TABLE_CRON_JOBS_TASK_SCHEDULER_FILTER: string = 'RESOURCE_TABLE_CRON_JOBS_TASK_SCHEDULER_FILTER';
  public static readonly RESOURCE_TABLE_RESPONSE_SLA_REQUIREMENT_FILTER: string = 'RESOURCE_TABLE_RESPONSE_SLA_REQUIREMENT_FILTER';
  public static readonly RESOURCE_TABLE_DISK1_OS_PERFORMANCE_FILTER: string = 'RESOURCE_TABLE_DISK1_OS_PERFORMANCE_FILTER';
  public static readonly RESOURCE_TABLE_DISK2_DATA_PERFORMANCE_FILTER: string = 'RESOURCE_TABLE_DISK2_DATA_PERFORMANCE_FILTER';
  public static readonly RESOURCE_TABLE_DISK3_DATA_TYPE_FILTER: string = 'RESOURCE_TABLE_DISK3_DATA_TYPE_FILTER';
  public static readonly RESOURCE_TABLE_DISK4_DATA_TYPE_FILTER: string = 'RESOURCE_TABLE_DISK4_DATA_TYPE_FILTER';
  public static readonly RESOURCE_TABLE_DISK5_DATA_TYPE_FILTER: string = 'RESOURCE_TABLE_DISK5_DATA_TYPE_FILTER';
  public static readonly RESOURCE_TABLE_DISK6_DATA_TYPE_FILTER: string = 'RESOURCE_TABLE_DISK6_DATA_TYPE_FILTER';
  public static readonly RESOURCE_TABLE_SMTP_ENABLED_FILTER: string = 'RESOURCE_TABLE_SMTP_ENABLED_FILTER';
  public static readonly RESOURCE_TABLE_BACKUP_REQUIRED_FILTER: string = 'RESOURCE_TABLE_BACKUP_REQUIRED_FILTER';
  public static readonly RESOURCE_TABLE_ORACLE_DBA_SUPPORT_REQUIRED_FILTER: string = 'RESOURCE_TABLE_ORACLE_DBA_SUPPORT_REQUIRED_FILTER';
  public static readonly RESOURCE_TABLE_JAVA_SUPPORT_REQUIRED_FILTER: string = 'RESOURCE_TABLE_JAVA_SUPPORT_REQUIRED_FILTER';
  public static readonly RESOURCE_TABLE_APACHE_SUPPORT_REQUIRED_FILTER: string = 'RESOURCE_TABLE_APACHE_SUPPORT_REQUIRED_FILTER';
  public static readonly RESOURCE_TABLE_OS_SUPPORT_INCLUDING_PATCHING_FILTER: string =
    'RESOURCE_TABLE_OS_SUPPORT_INCLUDING_PATCHING_FILTER';
  public static readonly RESOURCE_TABLE_AZURE_MONITORING_SETUP_REQUIRED_FILTER: string =
    'RESOURCE_TABLE_AZURE_MONITORING_SETUP_REQUIRED_FILTER';
  public static readonly RESOURCE_TABLE_ATOS_AGENT_DEPLOYED_FILTER: string = 'RESOURCE_TABLE_ATOS_AGENT_DEPLOYED_FILTER';
  public static readonly RESOURCE_TABLE_THREE_D_EXPERIENCE_SXI_LICENSE_FILTER: string =
    'RESOURCE_TABLE_THREE_D_EXPERIENCE_SXI_LICENSE_FILTER';
  // Maps each multi-select-filterable Resources column key to its own
  // persisted-preference constant above - one key per column (matching this
  // file's existing one-key-per-preference pattern, not a consolidated blob),
  // just looked up through this map instead of 33 near-identical
  // useState/handler pairs in the screen controller.
  public static readonly RESOURCE_TABLE_COLUMN_FILTER_KEYS: Record<string, string> = {
    environmentTag: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_ENVIRONMENT_FILTER,
    status: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_STATUS_FILTER,
    subscription: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_SUBSCRIPTION_FILTER,
    resourceGroup: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_RESOURCE_GROUP_FILTER,
    location: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_LOCATION_FILTER,
    operatingSystem: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_OPERATING_SYSTEM_FILTER,
    size: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_SIZE_FILTER,
    category: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_CATEGORY_FILTER,
    function: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_FUNCTION_FILTER,
    proximityGroup: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_PROXIMITY_GROUP_FILTER,
    virtualNetworkSubnet: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_VIRTUAL_NETWORK_SUBNET_FILTER,
    protocol: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_PROTOCOL_FILTER,
    infrastructureSupportServiceLevel: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_INFRASTRUCTURE_SUPPORT_SERVICE_LEVEL_FILTER,
    dbaSupportServiceLevel: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_DBA_SUPPORT_SERVICE_LEVEL_FILTER,
    backupStatus: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_BACKUP_STATUS_FILTER,
    cronJobsTaskScheduler: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_CRON_JOBS_TASK_SCHEDULER_FILTER,
    responseSLARequirement: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_RESPONSE_SLA_REQUIREMENT_FILTER,
    disk1OSPerformance: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_DISK1_OS_PERFORMANCE_FILTER,
    disk2DataPerformance: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_DISK2_DATA_PERFORMANCE_FILTER,
    disk3DataType: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_DISK3_DATA_TYPE_FILTER,
    disk4DataType: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_DISK4_DATA_TYPE_FILTER,
    disk5DataType: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_DISK5_DATA_TYPE_FILTER,
    disk6DataType: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_DISK6_DATA_TYPE_FILTER,
    smtpEnabled: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_SMTP_ENABLED_FILTER,
    backupRequired: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_BACKUP_REQUIRED_FILTER,
    oracleDBASupportRequired: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_ORACLE_DBA_SUPPORT_REQUIRED_FILTER,
    javaSupportRequired: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_JAVA_SUPPORT_REQUIRED_FILTER,
    apacheSupportRequired: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_APACHE_SUPPORT_REQUIRED_FILTER,
    osSupportIncludingPatching: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_OS_SUPPORT_INCLUDING_PATCHING_FILTER,
    azureMonitoringSetupRequired: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_AZURE_MONITORING_SETUP_REQUIRED_FILTER,
    atosAgentDeployed: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_ATOS_AGENT_DEPLOYED_FILTER,
    threeDExperienceSXILicense: ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_THREE_D_EXPERIENCE_SXI_LICENSE_FILTER,
  };
  public static readonly TABLE_HEIGHT_MODE: string = 'TABLE_HEIGHT_MODE';
  public static readonly TABLE_HEIGHT_CUSTOM_PX: string = 'TABLE_HEIGHT_CUSTOM_PX';
  public static readonly TABLE_DENSITY: string = 'TABLE_DENSITY';
  public static readonly ENVIRONMENT_OVERVIEW_COLUMN_WIDTHS: string = 'ENVIRONMENT_OVERVIEW_COLUMN_WIDTHS';
  public static readonly ENVIRONMENT_OVERVIEW_TABLE_VISIBLE_COLUMNS: string = 'ENVIRONMENT_OVERVIEW_TABLE_VISIBLE_COLUMNS';
  public static readonly ENVIRONMENT_OVERVIEW_ROW_HEIGHTS: string = 'ENVIRONMENT_OVERVIEW_ROW_HEIGHTS';
  public static readonly HORIZONTAL_SCROLL_PILL_ENABLED: string = 'HORIZONTAL_SCROLL_PILL_ENABLED';
  public static readonly STICKY_HEADER: string = 'STICKY_HEADER';
  // A per-browser random id, not a real user identity - this app has no
  // authentication system yet. See AnonymousClientIdentityUtility.ts.
  public static readonly ANONYMOUS_CLIENT_ID: string = 'ANONYMOUS_CLIENT_ID';
  // The signed JWT issued by POST /Api/V1/Admin/Login. See AdminIdentityUtility.ts.
  public static readonly ADMIN_JWT_TOKEN: string = 'ADMIN_JWT_TOKEN';
}
