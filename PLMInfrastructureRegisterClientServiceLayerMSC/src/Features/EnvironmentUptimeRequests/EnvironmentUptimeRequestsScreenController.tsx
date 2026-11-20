import React, { useState } from 'react';
import { LayoutDashboard, FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import SegmentedControlSharedComponent from '../../Shared/Components/SegmentedControlSharedComponent';
import { useIsAdmin } from '../../Utilities/AdminIdentityUtility';
import EnvironmentUptimeRequestFormStaticComponent from './Components/EnvironmentUptimeRequestFormStaticComponent';
import EnvironmentUptimeRequestListFeedStaticComponent from './Components/EnvironmentUptimeRequestListFeedStaticComponent';
import EnvironmentUptimeRequestDashboardStaticComponent from './Components/EnvironmentUptimeRequestDashboardStaticComponent';
import DowntimeAnnouncementBannerSharedComponent from '../DowntimeAnnouncements/Components/DowntimeAnnouncementBannerSharedComponent';
import EnvironmentUptimeRequestsCON from './Constants/EnvironmentUptimeRequestsCON';
import type CreateEnvironmentUptimeRequestInputInterfaceModel from '../../Models/CreateEnvironmentUptimeRequestInputInterfaceModel';

type UptimeRequestViewModeType = 'dashboard' | 'form';

export default function EnvironmentUptimeRequestsScreenController(): React.JSX.Element {
  const isAdmin = useIsAdmin();
  // Never persisted - always resets to Dashboard on a fresh page load,
  // mirroring Environment Overview's own View/Edit Mode toggle (spec
  // FR-003, research.md §2 in specs/003-uptime-request-dashboard).
  const [viewMode, setViewMode] = useState<UptimeRequestViewModeType>('dashboard');
  // Non-admins never see the toggle, so they always render the Form
  // branch below regardless of the state above (spec FR-002).
  const effectiveViewMode: UptimeRequestViewModeType = isAdmin ? viewMode : 'form';
  // Query uptime requests
  const {
    data: requests = [],
    isLoading,
  } = TanstackQueryClientService.current.environmentUptimeRequests.useEnvironmentUptimeRequestsQuery();

  // Mutations
  const createMutation = TanstackQueryClientService.current.environmentUptimeRequests.useCreateEnvironmentUptimeRequestMutation();
  const deleteMutation = TanstackQueryClientService.current.environmentUptimeRequests.useDeleteEnvironmentUptimeRequestMutation({
    onSuccess: () => {
      setDeleteTargetId(null);
    },
  });

  // State for delete confirmation modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleCreateSubmit = (
    input: CreateEnvironmentUptimeRequestInputInterfaceModel,
    onSuccess?: () => void
  ): void => {
    createMutation.mutate(input, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
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

        {isAdmin && (
          <SegmentedControlSharedComponent
            value={viewMode}
            onChange={setViewMode}
            layoutId="uptime-request-view-mode"
            options={[
              { value: 'dashboard', label: EnvironmentUptimeRequestsCON.VIEW_MODE_DASHBOARD_LABEL, icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
              { value: 'form', label: EnvironmentUptimeRequestsCON.VIEW_MODE_FORM_LABEL, icon: <FileText className="w-3.5 h-3.5" /> },
            ]}
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        {effectiveViewMode === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* 50:50 Side-by-Side Layout Container - 2 explicit rows so the
                summary cards (row 1, left) and the request list's control
                card (row 1, right) share a grid row and match height. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-3 flex-1">
              <EnvironmentUptimeRequestDashboardStaticComponent requests={requests} isActive={effectiveViewMode === 'dashboard'} />
              <EnvironmentUptimeRequestListFeedStaticComponent
                requests={requests}
                isLoading={isLoading}
                onDeleteRequest={handleDeleteRequest}
                layout="split"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-6"
          >
            <DowntimeAnnouncementBannerSharedComponent />

            {/* 50:50 Side-by-Side Layout Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
              {/* Left 50% Pane: Submission Form (Sticky on desktop, natural content height) */}
              <div className="w-full lg:sticky lg:top-20 h-fit">
                <EnvironmentUptimeRequestFormStaticComponent
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
          </motion.div>
        )}
      </AnimatePresence>

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
