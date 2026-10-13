import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import TanstackQueryKeysCON from '../Constants/TanstackQueryKeysCON';
import EnvironmentOverviewService from '../Features/EnvironmentOverview/Services/EnvironmentOverviewService';
import ResourcesService from '../Features/Resources/Services/ResourcesService';
import ResourceCellFormatHelper from '../Features/Resources/Helpers/ResourceCellFormatHelper';
import SubscriptionsService from '../Features/Subscriptions/Services/SubscriptionsService';
import ConfigurationConstantsService from './ConfigurationConstantsService';
import type ConfiguredSubscriptionInterfaceModel from '../Models/ConfiguredSubscriptionInterfaceModel';
import type SubscriptionDeletionResultInterfaceModel from '../Models/SubscriptionDeletionResultInterfaceModel';
import type EnvironmentOverviewInterfaceModel from '../Models/EnvironmentOverviewInterfaceModel';
import type CreateEnvironmentOverviewRequestInterfaceModel from '../Models/CreateEnvironmentOverviewRequestInterfaceModel';
import type UpdateEnvironmentOverviewStatusRequestInterfaceModel from '../Models/UpdateEnvironmentOverviewStatusRequestInterfaceModel';
import type AddConfigurationConstantOptionRequestInterfaceModel from '../Models/AddConfigurationConstantOptionRequestInterfaceModel';
import type AddActionItemRequestInterfaceModel from '../Models/AddActionItemRequestInterfaceModel';
import type UpdateEnvironmentOverviewFieldRequestInterfaceModel from '../Models/UpdateEnvironmentOverviewFieldRequestInterfaceModel';
import type UpdateResourceCellFormatRequestInterfaceModel from '../Models/UpdateResourceCellFormatRequestInterfaceModel';
import type ResourceCellFormatInterfaceModel from '../Models/ResourceCellFormatInterfaceModel';
import type CustomColorOptionInterfaceModel from '../Models/CustomColorOptionInterfaceModel';
import type AddCustomColorOptionRequestInterfaceModel from '../Models/AddCustomColorOptionRequestInterfaceModel';
import type UpdateCustomColorOptionRequestInterfaceModel from '../Models/UpdateCustomColorOptionRequestInterfaceModel';
import type EnvironmentOverviewCellFormatInterfaceModel from '../Models/EnvironmentOverviewCellFormatInterfaceModel';
import type UpdateEnvironmentOverviewCellFormatRequestInterfaceModel from '../Models/UpdateEnvironmentOverviewCellFormatRequestInterfaceModel';
import CellFormatHelper from '../Utilities/CellFormatHelper';

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

    useResourceCellFormatsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.RESOURCE_CELL_FORMATS,
        queryFn: () => ResourcesService.current.getCellFormats(),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },

    // Optimistic by design - a right-click formatting action (bold/italic/
    // color, possibly across many selected cells) applies to the UI the
    // instant it's clicked, with the actual save happening in the
    // background. A failed save rolls back silently (this mutation never
    // had any error UI to begin with - see git history - so that's not a
    // regression) plus one toast, since "the thing I just saw happen
    // quietly un-happened" is exactly the moment a user needs telling why.
    useUpdateResourceCellFormatMutation: (options?: {
      onSuccess?: (data: ResourceCellFormatInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: UpdateResourceCellFormatRequestInterfaceModel) =>
          ResourcesService.current.updateCellFormat(request),
        onMutate: (request) => {
          const previousFormats =
            queryClient.getQueryData<ResourceCellFormatInterfaceModel[]>(TanstackQueryKeysCON.RESOURCE_CELL_FORMATS) ?? [];

          // The optimistic write itself must never wait on anything - fired
          // synchronously, before cancelling any in-flight refetch that
          // could otherwise land after it and clobber it with stale
          // pre-mutation data (that cancellation doesn't need to be awaited
          // either; it just needs to be in flight before this returns).
          queryClient.setQueryData(
            TanstackQueryKeysCON.RESOURCE_CELL_FORMATS,
            ResourceCellFormatHelper.current.applyOptimisticUpdate(previousFormats, request)
          );
          void queryClient.cancelQueries({ queryKey: TanstackQueryKeysCON.RESOURCE_CELL_FORMATS });

          return { previousFormats };
        },
        onSuccess: (data) => {
          // The PUT response is already the full fresh list - setting it
          // directly avoids an extra refetch invalidate would otherwise cost.
          queryClient.setQueryData(TanstackQueryKeysCON.RESOURCE_CELL_FORMATS, data);
          options?.onSuccess?.(data);
        },
        onError: (error, _request, context) => {
          if (context) {
            queryClient.setQueryData(TanstackQueryKeysCON.RESOURCE_CELL_FORMATS, context.previousFormats);
          }

          toast.error('Failed to update cell formatting', {
            description: 'Your change was rolled back. You might want to check your internet connection before making any more changes.',
          });

          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the cell format.'));
        },
      });
    },

    // The named, growable custom-color palette offered by "Add Color" - a
    // dedicated pair rather than a reuse of configurationConstants' generic
    // options mechanism below, since a color needs a name attached (see
    // ResourceCellFormatColorService on the backend); Status/Sponsor never
    // will, so they stay on the generic mechanism untouched.
    useCustomColorsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.RESOURCE_CUSTOM_COLORS,
        queryFn: () => ResourcesService.current.getCustomColors(),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },

    useAddCustomColorMutation: (options?: {
      onSuccess?: (data: CustomColorOptionInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: AddCustomColorOptionRequestInterfaceModel) =>
          ResourcesService.current.addCustomColor(request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.RESOURCE_CUSTOM_COLORS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to add the custom color.'));
        },
      });
    },

    useUpdateCustomColorMutation: (options?: {
      onSuccess?: (data: CustomColorOptionInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateCustomColorOptionRequestInterfaceModel }) =>
          ResourcesService.current.updateCustomColor(id, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.RESOURCE_CUSTOM_COLORS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the custom color.'));
        },
      });
    },

    useDeleteCustomColorMutation: (options?: {
      onSuccess?: (data: CustomColorOptionInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => ResourcesService.current.deleteCustomColor(id),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.RESOURCE_CUSTOM_COLORS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to delete the custom color.'));
        },
      });
    },
  };

  // Generic growable-dropdown options mechanism - shared by Status/Sponsor
  // (Environment Overview), the custom color palette (Infrastructure
  // Register), and any future field across the whole app that needs one.
  // Each field gets its own independently cached query key (see
  // TanstackQueryKeysCON.CONFIGURATION_CONSTANT_OPTIONS), so adding a new
  // Sponsor option never invalidates Status's (or a custom color's)
  // already-cached list.
  public readonly configurationConstants = {
    useOptionsQuery: (fieldName: string) => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.CONFIGURATION_CONSTANT_OPTIONS(fieldName),
        queryFn: () => ConfigurationConstantsService.current.getOptions(fieldName),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },

    useAddOptionMutation: (fieldName: string, options?: { onSuccess?: (data: string[]) => void; onError?: (error: Error) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: AddConfigurationConstantOptionRequestInterfaceModel) =>
          ConfigurationConstantsService.current.addOption(fieldName, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.CONFIGURATION_CONSTANT_OPTIONS(fieldName) });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to add the option.'));
        },
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

    useCreateEnvironmentOverviewMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewInterfaceModel) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: CreateEnvironmentOverviewRequestInterfaceModel) =>
          EnvironmentOverviewService.current.createEnvironmentOverview(request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.(data);
        },
      });
    },

    useUpdateEnvironmentStatusMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateEnvironmentOverviewStatusRequestInterfaceModel }) =>
          EnvironmentOverviewService.current.updateStatus(id, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the Status.'));
        },
      });
    },

    useAddActionItemMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, request }: { id: string; request: AddActionItemRequestInterfaceModel }) =>
          EnvironmentOverviewService.current.addActionItem(id, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to add the action item.'));
        },
      });
    },

    useDeleteActionItemMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, lineIndex }: { id: string; lineIndex: number }) =>
          EnvironmentOverviewService.current.deleteActionItem(id, lineIndex),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to delete the action item.'));
        },
      });
    },

    useDeleteEnvironmentOverviewMutation: (options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => EnvironmentOverviewService.current.deleteEnvironmentOverview(id),
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.();
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to delete the environment.'));
        },
      });
    },

    useUpdateFieldMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateEnvironmentOverviewFieldRequestInterfaceModel }) =>
          EnvironmentOverviewService.current.updateField(id, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the field.'));
        },
      });
    },

    useEnvironmentOverviewCellFormatsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEW_CELL_FORMATS,
        queryFn: () => EnvironmentOverviewService.current.getCellFormats(),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },

    useUpdateEnvironmentOverviewCellFormatMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewCellFormatInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: UpdateEnvironmentOverviewCellFormatRequestInterfaceModel) =>
          EnvironmentOverviewService.current.updateCellFormat(request),
        onMutate: (request) => {
          const previousFormats =
            queryClient.getQueryData<EnvironmentOverviewCellFormatInterfaceModel[]>(
              TanstackQueryKeysCON.ENVIRONMENT_OVERVIEW_CELL_FORMATS
            ) ?? [];

          queryClient.setQueryData(
            TanstackQueryKeysCON.ENVIRONMENT_OVERVIEW_CELL_FORMATS,
            CellFormatHelper.current.computeMergedSparseList(
              previousFormats,
              request.cells,
              'environmentOverviewId',
              (target, style) => ({
                environmentOverviewId: target.environmentOverviewId,
                columnKey: target.columnKey,
                ...style,
              }),
              request
            )
          );
          void queryClient.cancelQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEW_CELL_FORMATS });

          return { previousFormats };
        },
        onSuccess: (data) => {
          queryClient.setQueryData(TanstackQueryKeysCON.ENVIRONMENT_OVERVIEW_CELL_FORMATS, data);
          options?.onSuccess?.(data);
        },
        onError: (error, _request, context) => {
          if (context) {
            queryClient.setQueryData(TanstackQueryKeysCON.ENVIRONMENT_OVERVIEW_CELL_FORMATS, context.previousFormats);
          }

          toast.error('Failed to update cell formatting', {
            description:
              'Your change was rolled back. You might want to check your internet connection before making any more changes.',
          });

          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the cell format.'));
        },
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
