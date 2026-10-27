import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import TanstackQueryKeysCON from '../Constants/TanstackQueryKeysCON';
import EnvironmentOverviewService from '../Features/EnvironmentOverview/Services/EnvironmentOverviewService';
import ResourcesService from '../Features/Resources/Services/ResourcesService';
import SubscriptionsService from '../Features/Subscriptions/Services/SubscriptionsService';
import ConfigurationConstantsService from './ConfigurationConstantsService';
import type ConfiguredSubscriptionInterfaceModel from '../Models/ConfiguredSubscriptionInterfaceModel';
import type SubscriptionDeletionResultInterfaceModel from '../Models/SubscriptionDeletionResultInterfaceModel';
import type EnvironmentOverviewInterfaceModel from '../Models/EnvironmentOverviewInterfaceModel';
import type CreateEnvironmentOverviewRequestInterfaceModel from '../Models/CreateEnvironmentOverviewRequestInterfaceModel';
import type UpdateEnvironmentOverviewStatusRequestInterfaceModel from '../Models/UpdateEnvironmentOverviewStatusRequestInterfaceModel';
import type AddConfigurationConstantOptionRequestInterfaceModel from '../Models/AddConfigurationConstantOptionRequestInterfaceModel';
import type AddActionItemRequestInterfaceModel from '../Models/AddActionItemRequestInterfaceModel';
import type UpdateActionItemRequestInterfaceModel from '../Models/UpdateActionItemRequestInterfaceModel';
import type UpdateEnvironmentOverviewFieldRequestInterfaceModel from '../Models/UpdateEnvironmentOverviewFieldRequestInterfaceModel';
import type UpdateUptimeScheduleRequestInterfaceModel from '../Models/UpdateUptimeScheduleRequestInterfaceModel';
import type UpdateResourceCellFormatRequestInterfaceModel from '../Models/UpdateResourceCellFormatRequestInterfaceModel';
import type ResourceCellFormatInterfaceModel from '../Models/ResourceCellFormatInterfaceModel';
import type CustomColorOptionInterfaceModel from '../Models/CustomColorOptionInterfaceModel';
import type AddCustomColorOptionRequestInterfaceModel from '../Models/AddCustomColorOptionRequestInterfaceModel';
import type UpdateCustomColorOptionRequestInterfaceModel from '../Models/UpdateCustomColorOptionRequestInterfaceModel';
import type LegendEntryInterfaceModel from '../Models/LegendEntryInterfaceModel';
import type AddLegendEntryRequestInterfaceModel from '../Models/AddLegendEntryRequestInterfaceModel';
import type UpdateLegendEntryRequestInterfaceModel from '../Models/UpdateLegendEntryRequestInterfaceModel';
import type EnvironmentOverviewCellFormatInterfaceModel from '../Models/EnvironmentOverviewCellFormatInterfaceModel';
import type UpdateEnvironmentOverviewCellFormatRequestInterfaceModel from '../Models/UpdateEnvironmentOverviewCellFormatRequestInterfaceModel';
import type AskQuestionRequestInterfaceModel from '../Models/AskQuestionRequestInterfaceModel';
import type AskQuestionResponseInterfaceModel from '../Models/AskQuestionResponseInterfaceModel';
import type AnswerQuestionRequestInterfaceModel from '../Models/AnswerQuestionRequestInterfaceModel';
import type ChatMessageInterfaceModel from '../Models/ChatMessageInterfaceModel';
import type FeatureRequestInterfaceModel from '../Models/FeatureRequestInterfaceModel';
import type CreateFeatureRequestInputInterfaceModel from '../Models/CreateFeatureRequestInputInterfaceModel';
import type UpdateFeatureRequestStatusInputInterfaceModel from '../Models/UpdateFeatureRequestStatusInputInterfaceModel';
import type EnvironmentUptimeRequestInterfaceModel from '../Models/EnvironmentUptimeRequestInterfaceModel';
import type CreateEnvironmentUptimeRequestInputInterfaceModel from '../Models/CreateEnvironmentUptimeRequestInputInterfaceModel';
import ChatAssistantService from '../Features/ChatAssistant/Services/ChatAssistantService';
import FeatureRequestsService from '../Features/FeatureRequests/Services/FeatureRequestsService';
import EnvironmentUptimeRequestsService from '../Features/EnvironmentUptimeRequests/Services/EnvironmentUptimeRequestsService';
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
            CellFormatHelper.current.computeMergedSparseList(
              previousFormats,
              request.cells,
              'resourceId',
              (target, style) => ({
                resourceId: target.resourceId,
                columnKey: target.columnKey,
                ...style,
              }),
              request
            )
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

    // The Infrastructure Register page's own user-manageable legend row -
    // purely a labeled reference list (name + color), not tied to any actual
    // table-column coloring. Same dedicated-pair-over-the-generic-mechanism
    // reasoning as useCustomColorsQuery above.
    useLegendsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.RESOURCE_TABLE_LEGENDS,
        queryFn: () => ResourcesService.current.getLegends(),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },

    useAddLegendMutation: (options?: {
      onSuccess?: (data: LegendEntryInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: AddLegendEntryRequestInterfaceModel) => ResourcesService.current.addLegend(request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.RESOURCE_TABLE_LEGENDS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to add the legend.'));
        },
      });
    },

    useUpdateLegendMutation: (options?: {
      onSuccess?: (data: LegendEntryInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateLegendEntryRequestInterfaceModel }) =>
          ResourcesService.current.updateLegend(id, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.RESOURCE_TABLE_LEGENDS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the legend.'));
        },
      });
    },

    useDeleteLegendMutation: (options?: {
      onSuccess?: (data: LegendEntryInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => ResourcesService.current.deleteLegend(id),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.RESOURCE_TABLE_LEGENDS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to delete the legend.'));
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

    useUpdateActionItemMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({
          id,
          lineIndex,
          request,
        }: {
          id: string;
          lineIndex: number;
          request: UpdateActionItemRequestInterfaceModel;
        }) => EnvironmentOverviewService.current.updateActionItem(id, lineIndex, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the action item.'));
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

    useUpdateUptimeScheduleMutation: (options?: {
      onSuccess?: (data: EnvironmentOverviewInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateUptimeScheduleRequestInterfaceModel }) =>
          EnvironmentOverviewService.current.updateUptimeSchedule(id, request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_OVERVIEWS });
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error instanceof Error ? error : new Error('Failed to update the uptime schedule.'));
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

  public readonly chatAssistant = {
    useAskQuestionMutation: (options?: {
      onSuccess?: (data: AskQuestionResponseInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: AskQuestionRequestInterfaceModel) =>
          ChatAssistantService.current.askQuestion(request),
        onSuccess: async (data) => {
          // Invalidates every client's cached conversation list rather than
          // just this one's - cheap (it's a short list) and avoids needing
          // this mutation to know which clientId's query key to target.
          await queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
          options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
          toast.error('Failed to get answer from assistant', {
            description: error.message || 'Please check your connection and try again.',
          });
          options?.onError?.(error);
        },
      });
    },

    // Resolves a pending clarifying question (or a Skip) - same cache
    // invalidation as useAskQuestionMutation, since this can also create new
    // messages/update the conversation's own UpdatedAt.
    useAnswerQuestionMutation: (options?: {
      onSuccess?: (data: AskQuestionResponseInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: AnswerQuestionRequestInterfaceModel) =>
          ChatAssistantService.current.answerQuestion(request),
        onSuccess: async (data) => {
          await queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
          options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
          toast.error('Failed to submit your answer', {
            description: error.message || 'Please check your connection and try again.',
          });
          options?.onError?.(error);
        },
      });
    },

    useConversationsQuery: (clientId: string, enabled: boolean = true) => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.CHAT_CONVERSATIONS(clientId),
        queryFn: () => ChatAssistantService.current.getConversations(clientId),
        staleTime: 1000 * 30, // 30 seconds - the sidebar's own list, short-lived since it changes every message
        enabled,
      });
    },

    // A mutation, not a reactive query bound to the currently-open
    // conversation id - switching conversations from the sidebar is a one-
    // off, click-triggered fetch, not data that should auto-refetch every
    // time conversationId changes for unrelated reasons (e.g. a brand new
    // conversation just got its id back from useAskQuestionMutation).
    useLoadConversationMessagesMutation: (options?: {
      onSuccess?: (data: ChatMessageInterfaceModel[]) => void;
      onError?: (error: Error) => void;
    }) => {
      return useMutation({
        mutationFn: (conversationId: string) => ChatAssistantService.current.getConversationMessages(conversationId),
        onSuccess: (data) => options?.onSuccess?.(data),
        onError: (error: Error) => {
          toast.error('Failed to load that conversation', {
            description: error.message || 'Please check your connection and try again.',
          });
          options?.onError?.(error);
        },
      });
    },
  };

  public readonly featureRequests = {
    useFeatureRequestsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.FEATURE_REQUESTS,
        queryFn: () => FeatureRequestsService.current.getFeatureRequests(),
        staleTime: 1000 * 60,
      });
    },

    useCreateFeatureRequestMutation: (options?: {
      onSuccess?: (data: FeatureRequestInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: CreateFeatureRequestInputInterfaceModel) =>
          FeatureRequestsService.current.createFeatureRequest(request),
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.FEATURE_REQUESTS });
          toast.success('Feature request submitted', {
            description: `"${data.title}" has been recorded successfully.`,
          });
          options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
          toast.error('Failed to submit feature request', {
            description: error.message || 'Please check your inputs and try again.',
          });
          options?.onError?.(error);
        },
      });
    },

    useUpdateFeatureRequestStatusMutation: (options?: {
      onSuccess?: (data: FeatureRequestInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateFeatureRequestStatusInputInterfaceModel }) =>
          FeatureRequestsService.current.updateStatus(id, request),
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.FEATURE_REQUESTS });
          toast.success('Status updated', {
            description: `Request status changed to ${data.status}.`,
          });
          options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
          toast.error('Failed to update status', {
            description: error.message || 'Please check your connection and try again.',
          });
          options?.onError?.(error);
        },
      });
    },

    useDeleteFeatureRequestMutation: (options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => FeatureRequestsService.current.deleteFeatureRequest(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.FEATURE_REQUESTS });
          toast.success('Feature request deleted', {
            description: 'The request has been removed.',
          });
          options?.onSuccess?.();
        },
        onError: (error: Error) => {
          toast.error('Failed to delete feature request', {
            description: error.message || 'Please check your connection and try again.',
          });
          options?.onError?.(error);
        },
      });
    },
  };

  public readonly environmentUptimeRequests = {
    useEnvironmentUptimeRequestsQuery: () => {
      return useQuery({
        queryKey: TanstackQueryKeysCON.ENVIRONMENT_UPTIME_REQUESTS,
        queryFn: () => EnvironmentUptimeRequestsService.current.getEnvironmentUptimeRequests(),
        staleTime: 1000 * 60,
      });
    },

    useCreateEnvironmentUptimeRequestMutation: (options?: {
      onSuccess?: (data: EnvironmentUptimeRequestInterfaceModel) => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (request: CreateEnvironmentUptimeRequestInputInterfaceModel) =>
          EnvironmentUptimeRequestsService.current.createEnvironmentUptimeRequest(request),
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_UPTIME_REQUESTS });
          toast.success('Uptime request submitted', {
            description: `${data.ticketId} has been recorded successfully.`,
          });
          options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
          toast.error('Failed to submit uptime request', {
            description: error.message || 'Please check your inputs and try again.',
          });
          options?.onError?.(error);
        },
      });
    },

    useDeleteEnvironmentUptimeRequestMutation: (options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => EnvironmentUptimeRequestsService.current.deleteEnvironmentUptimeRequest(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.ENVIRONMENT_UPTIME_REQUESTS });
          toast.success('Uptime request deleted', {
            description: 'The request has been removed.',
          });
          options?.onSuccess?.();
        },
        onError: (error: Error) => {
          toast.error('Failed to delete uptime request', {
            description: error.message || 'Please check your connection and try again.',
          });
          options?.onError?.(error);
        },
      });
    },
  };
}
