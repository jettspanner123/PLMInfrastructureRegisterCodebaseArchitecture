using System.Text.Json;
using Azure.Core;
using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.Compute;
using Azure.ResourceManager.Compute.Models;
using Azure.ResourceManager.Network;
using Azure.ResourceManager.Resources;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Services
{
    // Scans every configured subscription's Virtual Machines (see
    // ConfiguredSubscription) and reconciles them into Resources — matched by
    // Azure Resource ID (see RESOURCE_IDENTITY_MATCHING_KEY_TODO.md). Storage
    // Accounts and Physical Machines are out of scope for this first pass
    // (see STORAGE_ACCOUNT_SYNC_SUPPORT_TODO.md / MANUAL_PHYSICAL_MACHINE_ENTRY_TODO.md).
    //
    // Authenticates via DefaultAzureCredential, which reuses whoever is
    // locally logged in via `az login` — a deliberate "for now" choice, not a
    // final design (see ADD_OR_REMOVE_SUBSCRIPTION_FEATURE_TODO.md's
    // "Sync's own Azure identity" note).
    public sealed class SyncService
    {
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;
        private readonly ArmClient _armClient;

        public SyncService(ApplicationDatabaseContext applicationDatabaseContext)
        {
            _applicationDatabaseContext = applicationDatabaseContext;
            _armClient = new ArmClient(new DefaultAzureCredential());
        }

        public async Task<SyncResult> RunAsynchronous()
        {
            List<ConfiguredSubscription> configuredSubscriptions = await _applicationDatabaseContext
                .ConfiguredSubscriptions
                .AsNoTracking()
                .ToListAsync();

            int createdCount = 0;
            int updatedCount = 0;
            var seenAzureResourceIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (ConfiguredSubscription configuredSubscription in configuredSubscriptions)
            {
                SubscriptionResource subscription = _armClient.GetSubscriptionResource(
                    new ResourceIdentifier($"/subscriptions/{configuredSubscription.AzureSubscriptionId}"));

                await foreach (VirtualMachineResource virtualMachine in subscription.GetVirtualMachinesAsync())
                {
                    string azureResourceId = virtualMachine.Id.ToString();
                    seenAzureResourceIds.Add(azureResourceId);

                    ResourceNexus? existingResource = await _applicationDatabaseContext.Resources
                        .FirstOrDefaultAsync(resource => resource.AzureResourceId == azureResourceId);

                    bool isNewResource = existingResource is null;
                    ResourceNexus resource = existingResource ?? new ResourceNexus
                    {
                        Id = Guid.NewGuid(),
                        AzureResourceId = azureResourceId,
                    };

                    await MapVirtualMachineIntoResourceAsynchronous(virtualMachine, configuredSubscription, resource);

                    if (isNewResource)
                    {
                        _applicationDatabaseContext.Resources.Add(resource);
                        createdCount++;
                    }
                    else
                    {
                        updatedCount++;
                    }
                }
            }

            int decommissionedCount = await DecommissionMissingResourcesAsynchronous(configuredSubscriptions, seenAzureResourceIds);

            await _applicationDatabaseContext.SaveChangesAsync();

            return new SyncResult(createdCount, updatedCount, decommissionedCount);
        }

        private async Task<int> DecommissionMissingResourcesAsynchronous(
            List<ConfiguredSubscription> configuredSubscriptions,
            HashSet<string> seenAzureResourceIds)
        {
            // Anything previously synced from a configured subscription that
            // wasn't seen this run has disappeared from Azure — decommission
            // it, never delete it (see CONTEXT.md "Sync" / "Resource Status").
            var configuredSubscriptionIds = configuredSubscriptions
                .Select(configuredSubscription => configuredSubscription.AzureSubscriptionId)
                .ToList();

            List<ResourceNexus> previouslySyncedResources = await _applicationDatabaseContext.Resources
                .Where(resource => resource.AzureResourceId != null)
                .ToListAsync();

            int decommissionedCount = 0;

            foreach (ResourceNexus resource in previouslySyncedResources)
            {
                if (resource.AzureResourceId is null) continue;
                if (seenAzureResourceIds.Contains(resource.AzureResourceId)) continue;
                if (resource.Status == ResourceStatus.Decommissioned) continue;

                bool belongsToConfiguredSubscription = configuredSubscriptionIds.Any(subscriptionId =>
                    resource.AzureResourceId.Contains($"/subscriptions/{subscriptionId}/", StringComparison.OrdinalIgnoreCase));

                if (belongsToConfiguredSubscription)
                {
                    resource.Status = ResourceStatus.Decommissioned;
                    decommissionedCount++;
                }
            }

            return decommissionedCount;
        }

        private async Task MapVirtualMachineIntoResourceAsynchronous(
            VirtualMachineResource virtualMachine,
            ConfiguredSubscription configuredSubscription,
            ResourceNexus resource)
        {
            VirtualMachineData data = virtualMachine.Data;

            resource.Hostname = data.Name;
            resource.Subscription = configuredSubscription.DisplayName;
            resource.ResourceGroup = virtualMachine.Id.ResourceGroupName;
            resource.Location = data.Location.ToString();
            resource.OperatingSystem = data.StorageProfile?.OSDisk?.OSType?.ToString();
            resource.Size = data.HardwareProfile?.VmSize?.ToString();

            resource.Status = await GetResourceStatusAsynchronous(virtualMachine);
            resource.PrivateIPAddress = await GetPrivateIPAddressAsynchronous(data);

            (int? cpuCores, int? ramGB) = await GetVmSizeSpecsAsynchronous(virtualMachine.Id.SubscriptionId!, data);
            resource.CpuCores = cpuCores;
            resource.RamGB = ramGB;

            resource.StartStopTagsJson = BuildStartStopTagsJson(data.Tags);

            await MapDisksIntoResourceAsynchronous(data.StorageProfile, resource);
        }

        // Disk1 is always the OS disk; Disk2-6 are data disks in ascending
        // LUN order. Every slot is set (including to null) on every sync -
        // a disk detached since the last run must disappear from its slot,
        // not leave a stale value behind, same as every other Sync-owned
        // field. A VM with more than 5 data disks has nowhere to put the
        // overflow past Disk6 - dropped by design (see ResourceNexus's own
        // comment on these fields).
        private async Task MapDisksIntoResourceAsynchronous(VirtualMachineStorageProfile? storageProfile, ResourceNexus resource)
        {
            resource.Disk1OSPerformance = await ResolveDiskSizeAsynchronous(
                storageProfile?.OSDisk?.DiskSizeGB, storageProfile?.OSDisk?.ManagedDisk?.Id);

            List<VirtualMachineDataDisk> dataDisksByLun = storageProfile?.DataDisks?
                .OrderBy(dataDisk => dataDisk.Lun)
                .ToList() ?? new List<VirtualMachineDataDisk>();

            resource.Disk2DataPerformance = dataDisksByLun.Count > 0
                ? await ResolveDiskSizeAsynchronous(dataDisksByLun[0].DiskSizeGB, dataDisksByLun[0].ManagedDisk?.Id) : null;
            resource.Disk3DataType = dataDisksByLun.Count > 1
                ? await ResolveDiskSizeAsynchronous(dataDisksByLun[1].DiskSizeGB, dataDisksByLun[1].ManagedDisk?.Id) : null;
            resource.Disk4DataType = dataDisksByLun.Count > 2
                ? await ResolveDiskSizeAsynchronous(dataDisksByLun[2].DiskSizeGB, dataDisksByLun[2].ManagedDisk?.Id) : null;
            resource.Disk5DataType = dataDisksByLun.Count > 3
                ? await ResolveDiskSizeAsynchronous(dataDisksByLun[3].DiskSizeGB, dataDisksByLun[3].ManagedDisk?.Id) : null;
            resource.Disk6DataType = dataDisksByLun.Count > 4
                ? await ResolveDiskSizeAsynchronous(dataDisksByLun[4].DiskSizeGB, dataDisksByLun[4].ManagedDisk?.Id) : null;
        }

        // A disk's size on the VM's own inline storage profile is only
        // populated when it was explicitly overridden at creation - most
        // disks in this fleet were provisioned at their image/default size,
        // so that value comes back null for them (confirmed live via `az vm
        // show` against a real VM). The managed disk resource itself always
        // knows its own real size, so a null inline value falls back to
        // fetching that resource directly by ID.
        private async Task<string?> ResolveDiskSizeAsynchronous(int? inlineSizeGB, ResourceIdentifier? managedDiskId)
        {
            if (inlineSizeGB.HasValue) return FormatDiskSize(inlineSizeGB);
            if (managedDiskId is null) return null;

            try
            {
                ManagedDiskResource managedDisk = await _armClient.GetManagedDiskResource(managedDiskId).GetAsync();
                return FormatDiskSize(managedDisk.Data.DiskSizeGB);
            }
            catch
            {
                // A disk lookup failing (transient Azure error, permissions)
                // shouldn't fail the whole VM's sync - every other field
                // still gets saved.
                return null;
            }
        }

        private static string? FormatDiskSize(int? sizeGB) => sizeGB.HasValue ? $"{sizeGB.Value} GB" : null;

        // Mirrors every "StartStop_" prefixed tag verbatim (key included) from
        // Azure onto the resource - auto-discovers new tag keys automatically
        // (no code change needed if a new "StartStop_X" tag appears later),
        // rather than a fixed set of hardcoded columns. A value that's exactly
        // "true"/"false" (case-insensitive) is stored as a real JSON boolean
        // instead of a string, so it renders the same Yes/No way every other
        // boolean column already does - applied uniformly to any StartStop_
        // tag, not just the one (StartStop_SystemShutdown) that happens to be
        // boolean-shaped today, so a future boolean-valued tag gets the same
        // treatment with no code change either.
        private static string? BuildStartStopTagsJson(IDictionary<string, string> tags)
        {
            var startStopTags = new Dictionary<string, object>(StringComparer.Ordinal);

            foreach (KeyValuePair<string, string> tag in tags)
            {
                if (!tag.Key.StartsWith("StartStop_", StringComparison.OrdinalIgnoreCase)) continue;

                startStopTags[tag.Key] = bool.TryParse(tag.Value, out bool boolValue)
                    ? boolValue
                    : tag.Value;
            }

            return startStopTags.Count > 0 ? JsonSerializer.Serialize(startStopTags) : null;
        }

        private static async Task<ResourceStatus> GetResourceStatusAsynchronous(VirtualMachineResource virtualMachine)
        {
            try
            {
                var instanceView = await virtualMachine.InstanceViewAsync();

                bool isRunning = instanceView.Value.Statuses.Any(status =>
                    status.Code != null &&
                    status.Code.Contains("PowerState/running", StringComparison.OrdinalIgnoreCase));

                return isRunning ? ResourceStatus.Running : ResourceStatus.Stopped;
            }
            catch
            {
                // Instance view can fail independently of the VM resource itself
                // (e.g. transient Azure errors) — fall back rather than fail the
                // whole Sync run over one VM's power state.
                return ResourceStatus.Stopped;
            }
        }

        private async Task<string?> GetPrivateIPAddressAsynchronous(VirtualMachineData data)
        {
            Azure.Core.ResourceIdentifier? networkInterfaceId = data.NetworkProfile?.NetworkInterfaces?.FirstOrDefault()?.Id;
            if (networkInterfaceId is null) return null;

            try
            {
                NetworkInterfaceResource networkInterface = await _armClient
                    .GetNetworkInterfaceResource(networkInterfaceId)
                    .GetAsync();

                return networkInterface.Data.IPConfigurations?.FirstOrDefault()?.PrivateIPAddress;
            }
            catch
            {
                return null;
            }
        }

        private async Task<(int? cpuCores, int? ramGB)> GetVmSizeSpecsAsynchronous(string subscriptionId, VirtualMachineData data)
        {
            if (string.IsNullOrWhiteSpace(data.HardwareProfile?.VmSize?.ToString())) return (null, null);

            try
            {
                SubscriptionResource subscription = _armClient.GetSubscriptionResource(
                    new ResourceIdentifier($"/subscriptions/{subscriptionId}"));

                await foreach (VirtualMachineSize vmSize in subscription.GetVirtualMachineSizesAsync(data.Location))
                {
                    if (string.Equals(vmSize.Name, data.HardwareProfile!.VmSize.ToString(), StringComparison.OrdinalIgnoreCase))
                    {
                        int? memoryGB = vmSize.MemoryInMB.HasValue ? (int?)(vmSize.MemoryInMB.Value / 1024) : null;
                        return (vmSize.NumberOfCores, memoryGB);
                    }
                }
            }
            catch
            {
                // Size-spec lookup failing shouldn't fail the whole VM's Sync —
                // every other field still gets saved.
            }

            return (null, null);
        }
    }
}
