import React, { useRef } from 'react';
import { CalendarClock, FileText, Globe } from 'lucide-react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import BadgeSharedComponent from '../../../Shared/Components/BadgeSharedComponent';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import type DowntimeAnnouncementInterfaceModel from '../../../Models/DowntimeAnnouncementInterfaceModel';

export interface DowntimeAnnouncementDetailModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: DowntimeAnnouncementInterfaceModel | null;
}

// Read-only compact summary opened by clicking a downtime event card on the
// availability calendar (User Story 3, FR-007) - purely informational, no
// editing surface (downtime management stays on its own existing screens).
export default function DowntimeAnnouncementDetailModalController({
  isOpen,
  onClose,
  announcement,
}: DowntimeAnnouncementDetailModalControllerProps): React.JSX.Element {
  // Modal data caching ref (CODING-RULES.md §10.2).
  const lastAnnouncementRef = useRef<DowntimeAnnouncementInterfaceModel | null>(announcement);
  if (announcement) lastAnnouncementRef.current = announcement;
  const displayAnnouncement = announcement ?? lastAnnouncementRef.current;

  return (
    <ModalSharedComponent isOpen={isOpen} onClose={onClose} title="Downtime Announcement" maxWidth="lg">
      {displayAnnouncement && (
        <div className="flex flex-col divide-y divide-slate-200 dark:divide-zinc-800 -mx-5 sm:-mx-6">
          <div className="px-5 sm:px-6 pb-4 flex flex-col gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{displayAnnouncement.heading}</h3>
            <BadgeSharedComponent variant={displayAnnouncement.isActive ? 'danger' : 'neutral'} size="md" showDot className="w-fit">
              {displayAnnouncement.status}
            </BadgeSharedComponent>
          </div>

          <div className="px-5 sm:px-6 py-4">
            <DetailFieldRow icon={<FileText className="w-4 h-4" />} label="Description" value={displayAnnouncement.description} multiline />
          </div>

          <div className="flex divide-x divide-slate-200 dark:divide-zinc-800">
            <DetailFieldRow
              className="flex-1 px-5 sm:px-6 py-4"
              icon={<CalendarClock className="w-4 h-4" />}
              label="Start (CET)"
              value={CETDateTimeFormatUtility.current.formatDateTime(displayAnnouncement.startAt)}
            />
            <DetailFieldRow
              className="flex-1 px-5 sm:px-6 py-4"
              icon={<CalendarClock className="w-4 h-4" />}
              label="End (CET)"
              value={CETDateTimeFormatUtility.current.formatDateTime(displayAnnouncement.endAt)}
            />
          </div>

          <div className="px-5 sm:px-6 py-4">
            <DetailFieldRow
              icon={<Globe className="w-4 h-4" />}
              label="Affected Environments"
              value={displayAnnouncement.environments.join(', ')}
            />
          </div>
        </div>
      )}
    </ModalSharedComponent>
  );
}

interface DetailFieldRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
  className?: string;
}

function DetailFieldRow({ icon, label, value, multiline = false, className = '' }: DetailFieldRowProps): React.JSX.Element {
  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
        {icon}
        {label}
      </span>
      <span className={`text-sm text-slate-900 dark:text-zinc-100 ${multiline ? 'whitespace-pre-line leading-relaxed' : 'truncate'}`}>
        {value}
      </span>
    </div>
  );
}
