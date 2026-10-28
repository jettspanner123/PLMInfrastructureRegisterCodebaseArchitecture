import React, { useState } from 'react';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import EnvironmentUptimeRequestFormStaticComponent from './Components/EnvironmentUptimeRequestFormStaticComponent';
import EnvironmentUptimeRequestListFeedStaticComponent from './Components/EnvironmentUptimeRequestListFeedStaticComponent';
import EnvironmentUptimeRequestsCON from './Constants/EnvironmentUptimeRequestsCON';
import type CreateEnvironmentUptimeRequestInputInterfaceModel from '../../Models/CreateEnvironmentUptimeRequestInputInterfaceModel';

export default function EnvironmentUptimeRequestsScreenController(): React.JSX.Element {
  // Query uptime requests
  const {
    data: requests = [],
    isLoading,
  } = TanstackQueryClientService.current.environmentUptimeRequests.useEnvironmentUptimeRequestsQuery();

  // Mutations
  const createMutation = TanstackQueryClientService.current.environmentUptimeRequests.useCreateEnvironmentUptimeRequestMutation({
    onSuccess: () => {
      // Force the (uncontrolled-from-here) form to remount with blank
      // fields after a successful submission, instead of leaving the
      // just-submitted values sitting in the inputs.
      setFormResetKey((key) => key + 1);
    },
  });
  const deleteMutation = TanstackQueryClientService.current.environmentUptimeRequests.useDeleteEnvironmentUptimeRequestMutation({
    onSuccess: () => {
      setDeleteTargetId(null);
    },
  });

  // State for delete confirmation modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Bumped on a successful create to remount EnvironmentUptimeRequestFormStaticComponent,
  // clearing its internal field state.
  const [formResetKey, setFormResetKey] = useState(0);

  const handleCreateSubmit = (input: CreateEnvironmentUptimeRequestInputInterfaceModel): void => {
    createMutation.mutate(input);
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
            {EnvironmentUptimeRequestsCON.SCREEN_TITLE}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {EnvironmentUptimeRequestsCON.SCREEN_SUBTITLE}
          </p>
        </div>
      </div>

      {/* 50:50 Side-by-Side Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start flex-1">
        {/* Left 50% Pane: Submission Form */}
        <div className="w-full">
          <EnvironmentUptimeRequestFormStaticComponent
            key={formResetKey}
            onSubmit={handleCreateSubmit}
            isSubmitting={createMutation.isPending}
          />
        </div>

        {/* Right 50% Pane: Requests List Feed */}
        <div className="w-full">
          <EnvironmentUptimeRequestListFeedStaticComponent
            requests={requests}
            isLoading={isLoading}
            onDeleteRequest={handleDeleteRequest}
          />
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModalSharedComponent
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title={EnvironmentUptimeRequestsCON.DELETE_MODAL_TITLE}
        description={EnvironmentUptimeRequestsCON.DELETE_MODAL_DESCRIPTION}
        confirmText="Delete Request"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
