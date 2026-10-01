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
