import React, { useState } from 'react';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import FeatureRequestFormStaticComponent from './Components/FeatureRequestFormStaticComponent';
import FeatureRequestListFeedStaticComponent from './Components/FeatureRequestListFeedStaticComponent';
import FeatureRequestsCON from './Constants/FeatureRequestsCON';
import type CreateFeatureRequestInputInterfaceModel from '../../Models/CreateFeatureRequestInputInterfaceModel';
import type { FeatureRequestStatusEnumModel } from '../../Models/FeatureRequestStatusEnumModel';

export default function FeatureRequestsScreenController(): React.JSX.Element {
  // Query feature requests
  const {
    data: requests = [],
    isLoading,
  } = TanstackQueryClientService.current.featureRequests.useFeatureRequestsQuery();

  // Mutations
  const createMutation = TanstackQueryClientService.current.featureRequests.useCreateFeatureRequestMutation();
  const updateStatusMutation = TanstackQueryClientService.current.featureRequests.useUpdateFeatureRequestStatusMutation();
  const deleteMutation = TanstackQueryClientService.current.featureRequests.useDeleteFeatureRequestMutation({
    onSuccess: () => {
      setDeleteTargetId(null);
    },
  });

  // State for delete confirmation modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleCreateSubmit = (input: CreateFeatureRequestInputInterfaceModel): void => {
    createMutation.mutate(input);
  };

  const handleStatusChange = (id: string, status: FeatureRequestStatusEnumModel): void => {
    updateStatusMutation.mutate({ id, request: { status } });
  };

  const handleDeleteRequest = (id: string): void => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = (): void => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Screen Header - byte-for-byte copy of Infrastructure Register's /
          Environment Overview's own header markup & classes. */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">
            {FeatureRequestsCON.SCREEN_TITLE}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {FeatureRequestsCON.SCREEN_SUBTITLE}
          </p>
        </div>
      </div>

      {/* 50:50 Side-by-Side Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start flex-1">
        {/* Left 50% Pane: Submission Form */}
        <div className="w-full">
          <FeatureRequestFormStaticComponent
            onSubmit={handleCreateSubmit}
            isSubmitting={createMutation.isPending}
          />
        </div>

        {/* Right 50% Pane: Requests List Feed */}
        <div className="w-full">
          <FeatureRequestListFeedStaticComponent
            requests={requests}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onDeleteRequest={handleDeleteRequest}
          />
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModalSharedComponent
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title={FeatureRequestsCON.DELETE_MODAL_TITLE}
        description={FeatureRequestsCON.DELETE_MODAL_DESCRIPTION}
        confirmText="Delete Request"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
