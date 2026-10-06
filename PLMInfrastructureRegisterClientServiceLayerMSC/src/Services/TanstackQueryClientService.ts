import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TanstackQueryKeysCON from '../Constants/TanstackQueryKeysCON';
import EnvironmentOverviewService from '../Features/EnvironmentOverview/Services/EnvironmentOverviewService';
import ResourcesService from '../Features/Resources/Services/ResourcesService';
import SubscriptionsService from '../Features/Subscriptions/Services/SubscriptionsService';
import type ConfiguredSubscriptionInterfaceModel from '../Models/ConfiguredSubscriptionInterfaceModel';
import type SubscriptionDeletionResultInterfaceModel from '../Models/SubscriptionDeletionResultInterfaceModel';

export default class TanstackQueryClientService {
  public static current: TanstackQueryClientService = new TanstackQueryClientService();

  public readonly resources = {
    useResourcesQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.RESOURCES,
        queryFn: () => ResourcesService.current.getResources(),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },
  };

  public readonly environmentOverview = {
    useEnvironmentOverviewsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS,
        queryFn: () => EnvironmentOverviewService.current.getEnvironmentOverviews(),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },
  };

  public readonly subscriptions = {
    useConfiguredSubscriptionsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.CONFIGURED_SUBSCRIPTIONS,
        queryFn: () => SubscriptionsService.current.getConfiguredSubscriptions(),
        staleTime: 1000 * 30,
      });
    },

    // Only fetched while the Add-subscription picker is actually open — it's
    // a live, read-only Azure call, not something to poll in the background.
    useAvailableAzureSubscriptionsQuery: (enabled: boolean) => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.AVAILABLE_AZURE_SUBSCRIPTIONS,
        queryFn: () => SubscriptionsService.current.getAvailableAzureSubscriptions(),
        enabled,
        staleTime: 0,
      });
    },

    useAddSubscriptionMutation: (options?: { onSuccess?: (data: ConfiguredSubscriptionInterfaceModel) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (azureSubscriptionId: string) => SubscriptionsService.current.addSubscription(azureSubscriptionId),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.CONFIGURED_SUBSCRIPTIONS });
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.AVAILABLE_AZURE_SUBSCRIPTIONS });
          options?.onSuccess?.(data);
        },
      });
    },

    useUpdateSubscriptionDisplayNameMutation: (options?: {
      onSuccess?: (data: ConfiguredSubscriptionInterfaceModel) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, displayName }: { id: string; displayName: string }) =>
          SubscriptionsService.current.updateDisplayName(id, displayName),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.CONFIGURED_SUBSCRIPTIONS });
          options?.onSuccess?.(data);
        },
      });
    },

    useDeleteSubscriptionMutation: (options?: {
      onSuccess?: (data: SubscriptionDeletionResultInterfaceModel) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => SubscriptionsService.current.deleteSubscription(id),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.CONFIGURED_SUBSCRIPTIONS });
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.RESOURCES });
          options?.onSuccess?.(data);
        },
      });
    },
  };
}
