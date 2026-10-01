namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models
{
    public sealed class ResourceNexus
    {
        public Guid Id { get; set; }

        // Null for Resources that aren't Azure-sourced (e.g. Physical Machines) — see CONTEXT.md "Sync".
        public string? AzureResourceId { get; set; }

        // --- Dynamic fields: written only by Sync, never by a user. ---

        public string Hostname { get; set; } = string.Empty;

        public ResourceStatus Status { get; set; }

        public string? PrivateIPAddress { get; set; }

        public string? Subscription { get; set; }

        public bool AutoShutdownEnabled { get; set; }

        public string? AutoShutdownSchedule { get; set; }

        public TimeOnly? AutoShutdownStartTime { get; set; }

        public TimeOnly? AutoShutdownEndTime { get; set; }

        public string? ResourceGroup { get; set; }

        public string? Location { get; set; }

        public string? VirtualNetworkSubnet { get; set; }

        public string? OperatingSystem { get; set; }

        public string? Size { get; set; }

        public int? CpuCores { get; set; }

        public int? RamGB { get; set; }

        public string? Disk1OSPerformance { get; set; }

        public string? Disk2DataPerformance { get; set; }

        public string? Disk3DataType { get; set; }

        public string? Disk4DataType { get; set; }

        // --- Manual fields: entered and edited directly by a user; Sync never overwrites them. ---

        public string? Function { get; set; }

        public string? EnvironmentTag { get; set; }

        public string? DailyBackupTime { get; set; }

        public string? CronJobsTaskScheduler { get; set; }

        public string? DNS { get; set; }

        public string? URL { get; set; }

        public string? Category { get; set; }

        public string? PublicIPAddress { get; set; }

        public string? ProximityGroup { get; set; }

        public string? Disk5DataType { get; set; }

        public string? Disk6DataType { get; set; }

        public string? Disks { get; set; }

        public string? DatabaseInstance { get; set; }

        public string? DatabaseName { get; set; }

        public string? PlanVersion { get; set; }

        public string? BackupSchedule { get; set; }

        public string? BackupStatus { get; set; }

        public string? InfrastructureSupportAzure { get; set; }

        public string? InfrastructureSupportServiceLevel { get; set; }

        public string? DBASupport { get; set; }

        public string? DBASupportServiceLevel { get; set; }

        public string? Protocol { get; set; }

        public string? Port { get; set; }

        public string? TomEEPortConnector { get; set; }

        public string? SMTPEnabled { get; set; }

        public string? SMTPHostname { get; set; }

        public string? SMTPSender { get; set; }

        public string? Comment { get; set; }

        public string? OracleDBASupportRequired { get; set; }

        public string? JavaSupportRequired { get; set; }

        public string? ApacheSupportRequired { get; set; }

        public string? BackupRequired { get; set; }

        public string? OSSupportIncludingPatching { get; set; }

        public string? AzureMonitoringSetupRequired { get; set; }

        public string? ResponseSLARequirement { get; set; }

        public string? AtosAgentDeployed { get; set; }

        public string? ThreeDExperienceSXILicense { get; set; }

        public string? MonitoringHealthcheckURL { get; set; }

        public DateTime? VMCreationDate { get; set; }

        public DateTime? VMDeletionDate { get; set; }

        public string? NewHostname { get; set; }

        // Legacy column "Spinner_R2024x_AtlasCopco_Exp29Oct2026" — meaning was never
        // confirmed with the user (likely a stray deployment label, only "N/A" or
        // "Deployed" in the source data). Kept verbatim rather than dropped or
        // reinterpreted, since the full table must reflect every original column.
        public string? Spinner { get; set; }
    }
}
