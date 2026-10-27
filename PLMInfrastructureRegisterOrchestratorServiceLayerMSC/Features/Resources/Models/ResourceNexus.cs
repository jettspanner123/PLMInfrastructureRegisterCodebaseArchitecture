using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

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

        // Raw JSON object of every Azure tag whose key starts with
        // "StartStop_", keys preserved verbatim (e.g. "StartStop_ContactEmail") -
        // auto-discovered by Sync from whatever tags actually exist on each VM,
        // not a fixed set of columns, so a brand-new "StartStop_X" tag shows up
        // automatically on its next sync with no code change (see
        // SyncService.BuildStartStopTagsJson for how values get typed). Replaces
        // the four Auto Shutdown columns that used to live here - this comment
        // section's own name notwithstanding, Sync never actually wrote them.
        [JsonIgnore]
        public string? StartStopTagsJson { get; set; }

        [NotMapped]
        public Dictionary<string, object>? StartStopTags =>
            StartStopTagsJson is null ? null : JsonSerializer.Deserialize<Dictionary<string, object>>(StartStopTagsJson);

        public string? ResourceGroup { get; set; }

        public string? Location { get; set; }

        public string? VirtualNetworkSubnet { get; set; }

        public string? OperatingSystem { get; set; }

        public string? Size { get; set; }

        public int? CpuCores { get; set; }

        public int? RamGB { get; set; }

        // Disk1 through Disk6 hold that disk slot's size (e.g. "128 GB") -
        // Disk1 is always the VM's OS disk; Disk2-6 are its data disks in
        // ascending LUN order. Cleared to null on any sync where that slot
        // has no disk (see SyncService.MapDisksIntoResource) - a VM with
        // more than 5 data disks has nowhere to put the overflow past
        // Disk6, dropped by design (confirmed acceptable: this fleet's VMs
        // top out at 6 disks in practice).
        public string? Disk1OSPerformance { get; set; }

        public string? Disk2DataPerformance { get; set; }

        public string? Disk3DataType { get; set; }

        public string? Disk4DataType { get; set; }

        public string? Disk5DataType { get; set; }

        public string? Disk6DataType { get; set; }

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
