using Azure.Core;
using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.Resources;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Models;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Services
{
    // Manages the list of Azure subscriptions Sync is allowed to scan (see
    // ADD_OR_REMOVE_SUBSCRIPTION_FEATURE_TODO.md). Every Azure call here is
    // strictly read-only — this service only ever writes to the app's own
    // ConfiguredSubscriptions table, never to Azure itself. Authenticates via
    // DefaultAzureCredential, the same "for now" choice SyncService makes.
    public sealed class SubscriptionsService
    {
        private readonly ApplicationDatabaseContext _applicationDatabaseContext;
        private readonly ArmClient _armClient;

        public SubscriptionsService(ApplicationDatabaseContext applicationDatabaseContext)
        {
            _applicationDatabaseContext = applicationDatabaseContext;
            _armClient = new ArmClient(new DefaultAzureCredential());
        }

        public async Task<List<ConfiguredSubscriptionDTO>> GetConfiguredSubscriptionsAsynchronous()
        {
            List<ConfiguredSubscription> configuredSubscriptions = await _applicationDatabaseContext
                .ConfiguredSubscriptions
                .AsNoTracking()
                .OrderBy(subscription => subscription.DisplayName)
                .ToListAsync();

            var result = new List<ConfiguredSubscriptionDTO>();

            foreach (ConfiguredSubscription configuredSubscription in configuredSubscriptions)
            {
                int resourceCount = await CountActiveResourcesAsynchronous(configuredSubscription.AzureSubscriptionId);

                result.Add(new ConfiguredSubscriptionDTO
                {
                    Id = configuredSubscription.Id,
                    AzureSubscriptionId = configuredSubscription.AzureSubscriptionId,
                    DisplayName = configuredSubscription.DisplayName,
                    ResourceCount = resourceCount,
                });
            }

            return result;
        }

        public async Task<List<AvailableAzureSubscriptionDTO>> GetAvailableAzureSubscriptionsAsynchronous()
        {
            HashSet<string> alreadyConfiguredIds = (await _applicationDatabaseContext.ConfiguredSubscriptions
                .AsNoTracking()
                .Select(subscription => subscription.AzureSubscriptionId)
                .ToListAsync())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var available = new List<AvailableAzureSubscriptionDTO>();

            await foreach (SubscriptionResource subscription in _armClient.GetSubscriptions().GetAllAsync())
            {
                string azureSubscriptionId = subscription.Data.SubscriptionId;

                if (alreadyConfiguredIds.Contains(azureSubscriptionId)) continue;

                available.Add(new AvailableAzureSubscriptionDTO
                {
                    AzureSubscriptionId = azureSubscriptionId,
                    DisplayName = subscription.Data.DisplayName,
                });
            }

            return available.OrderBy(subscription => subscription.DisplayName).ToList();
        }

        public async Task<ConfiguredSubscriptionDTO> AddSubscriptionAsynchronous(AddSubscriptionRequestDTO request)
        {
            string azureSubscriptionId = request.AzureSubscriptionId!;

            bool alreadyConfigured = await _applicationDatabaseContext.ConfiguredSubscriptions
                .AnyAsync(subscription => subscription.AzureSubscriptionId == azureSubscriptionId);

            if (alreadyConfigured)
            {
                throw new ConflictException("This subscription has already been added to the configured list.");
            }

            SubscriptionResource subscription;

            try
            {
                subscription = await _armClient
                    .GetSubscriptionResource(new ResourceIdentifier($"/subscriptions/{azureSubscriptionId}"))
                    .GetAsync();
            }
            catch (Exception)
            {
                throw new NotFoundException(
                    "That subscription could not be found, or the app's Azure credentials don't have access to it.");
            }

            var configuredSubscription = new ConfiguredSubscription
            {
                Id = Guid.NewGuid(),
                AzureSubscriptionId = subscription.Data.SubscriptionId,
                DisplayName = subscription.Data.DisplayName,
            };

            _applicationDatabaseContext.ConfiguredSubscriptions.Add(configuredSubscription);
            await _applicationDatabaseContext.SaveChangesAsync();

            return new ConfiguredSubscriptionDTO
            {
                Id = configuredSubscription.Id,
                AzureSubscriptionId = configuredSubscription.AzureSubscriptionId,
                DisplayName = configuredSubscription.DisplayName,
                ResourceCount = 0,
            };
        }

        public async Task<ConfiguredSubscriptionDTO> UpdateDisplayNameAsynchronous(
            Guid id,
            UpdateSubscriptionDisplayNameRequestDTO request)
        {
            ConfiguredSubscription? configuredSubscription = await _applicationDatabaseContext.ConfiguredSubscriptions
                .FirstOrDefaultAsync(subscription => subscription.Id == id);

            if (configuredSubscription is null)
            {
                throw new NotFoundException("That configured subscription could not be found.");
            }

            // Deliberately does not touch already-synced Resources' denormalized
            // Subscription string — that field is Sync-exclusive (see
            // ResourceNexus.cs's Dynamic/Manual field split) and will self-correct
            // on the next Sync run.
            configuredSubscription.DisplayName = request.DisplayName!;
            await _applicationDatabaseContext.SaveChangesAsync();

            int resourceCount = await CountActiveResourcesAsynchronous(configuredSubscription.AzureSubscriptionId);

            return new ConfiguredSubscriptionDTO
            {
                Id = configuredSubscription.Id,
                AzureSubscriptionId = configuredSubscription.AzureSubscriptionId,
                DisplayName = configuredSubscription.DisplayName,
                ResourceCount = resourceCount,
            };
        }

        public async Task<SubscriptionDeletionResultDTO> DeleteSubscriptionAsynchronous(Guid id)
        {
            ConfiguredSubscription? configuredSubscription = await _applicationDatabaseContext.ConfiguredSubscriptions
                .FirstOrDefaultAsync(subscription => subscription.Id == id);

            if (configuredSubscription is null)
            {
                throw new NotFoundException("That configured subscription could not be found.");
            }

            List<ResourceNexus> affectedResources = await GetActiveResourcesQueryable(configuredSubscription.AzureSubscriptionId)
                .ToListAsync();

            foreach (ResourceNexus resource in affectedResources)
            {
                resource.Status = ResourceStatus.Decommissioned;
            }

            _applicationDatabaseContext.ConfiguredSubscriptions.Remove(configuredSubscription);
            await _applicationDatabaseContext.SaveChangesAsync();

            return new SubscriptionDeletionResultDTO
            {
                DecommissionedResourceCount = affectedResources.Count,
            };
        }

        private async Task<int> CountActiveResourcesAsynchronous(string azureSubscriptionId)
        {
            return await GetActiveResourcesQueryable(azureSubscriptionId).CountAsync();
        }

        // Matches Resources to a subscription the same way SyncService's own
        // decommissioning logic does — via the Azure Resource ID, not the
        // denormalized DisplayName string, since the Display Name can be
        // edited on this page and would otherwise drift out of sync.
        private IQueryable<ResourceNexus> GetActiveResourcesQueryable(string azureSubscriptionId)
        {
            string subscriptionSegment = $"/subscriptions/{azureSubscriptionId}/";

            return _applicationDatabaseContext.Resources
                .Where(resource =>
                    resource.AzureResourceId != null &&
                    resource.AzureResourceId.Contains(subscriptionSegment) &&
                    resource.Status != ResourceStatus.Decommissioned);
        }
    }
}
