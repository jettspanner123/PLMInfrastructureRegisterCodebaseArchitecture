import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import { useIsAdmin } from '../../../Utilities/AdminIdentityUtility';
import ConfirmationModalSharedComponent from '../../../Shared/Components/ConfirmationModalSharedComponent';

// Shown directly below the Uptime Request page's header, to every user, for
// whatever single downtime announcement the backend reports as currently
// active (only ever one at a time - see DowntimeAnnouncementsService on the
// backend). Not dismissible by design: it's meant to stay visible for the
// full duration of the announcement, same as a persistent warning.
export default function DowntimeAnnouncementBannerSharedComponent(): React.JSX.Element | null {
  const isAdmin = useIsAdmin();
  const [isEndNowConfirmOpen, setIsEndNowConfirmOpen] = useState<boolean>(false);

  const { data: activeAnnouncement } =
    TanstackQueryClientService.current.downtimeAnnouncements.useActiveDowntimeAnnouncementQuery();

  const endEarlyMutation = TanstackQueryClientService.current.downtimeAnnouncements.useEndDowntimeAnnouncementEarlyMutation({
    onSuccess: () => setIsEndNowConfirmOpen(false),
  });

  if (!activeAnnouncement) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-600 dark:bg-red-700 text-white">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm leading-tight">{activeAnnouncement.heading}</p>
          <p className="text-xs text-red-50 mt-1 leading-relaxed">{activeAnnouncement.description}</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsEndNowConfirmOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer text-xs font-bold"
          >
            <X className="w-3.5 h-3.5" />
            <span>End Now</span>
          </button>
        )}
      </div>

      <ConfirmationModalSharedComponent
        isOpen={isEndNowConfirmOpen}
        onClose={() => setIsEndNowConfirmOpen(false)}
        onConfirm={() => endEarlyMutation.mutate(activeAnnouncement.id)}
        title="End Downtime Announcement"
        description="This banner will stop showing to every user immediately. This cannot be undone."
        confirmText="End Now"
        cancelText="Cancel"
        variant="danger"
        isLoading={endEarlyMutation.isPending}
        maxWidth="md"
      />
    </React.Fragment>
  );
}
