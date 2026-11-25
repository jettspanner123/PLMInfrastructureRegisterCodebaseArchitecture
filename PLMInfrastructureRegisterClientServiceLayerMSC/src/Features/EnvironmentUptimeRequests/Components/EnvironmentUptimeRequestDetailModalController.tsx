import React, { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { User, Globe, CalendarClock, FileText, ExternalLink } from 'lucide-react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import BadgeSharedComponent, { type BadgeSharedComponentProps } from '../../../Shared/Components/BadgeSharedComponent';
import ApplicationRouteCON from '../../../Constants/ApplicationRouteCON';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../../Models/EnvironmentUptimeRequestStatusEnumModel';
import type EnvironmentUptimeRequestInterfaceModel from '../../../Models/EnvironmentUptimeRequestInterfaceModel';

export interface EnvironmentUptimeRequestDetailModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  request: EnvironmentUptimeRequestInterfaceModel | null;
}

// Read-only compact summary opened by clicking an existing uptime request's
// event card on the availability calendar (User Story 3, FR-005/FR-006) -
// no inline editing; the link below takes an admin to the existing full
// detail page for that (EnvironmentUptimeRequestDetailScreenController).
export default function EnvironmentUptimeRequestDetailModalController({
  isOpen,
  onClose,
  request,
}: EnvironmentUptimeRequestDetailModalControllerProps): React.JSX.Element {
  // Modal data caching ref (CODING-RULES.md §10.2) - keeps content visible
  // while ModalSharedComponent's own exit animation plays, after `request`
  // has already gone back to null.
  const lastRequestRef = useRef<EnvironmentUptimeRequestInterfaceModel | null>(request);
  if (request) lastRequestRef.current = request;
  const displayRequest = request ?? lastRequestRef.current;

  let statusVariant: BadgeSharedComponentProps['variant'] = 'neutral';
  if (displayRequest) {
    if (displayRequest.status === EnvironmentUptimeRequestStatusEnumModel.Approved) statusVariant = 'info';
    else if (displayRequest.status === EnvironmentUptimeRequestStatusEnumModel.Completed) statusVariant = 'success';
    else if (displayRequest.status === EnvironmentUptimeRequestStatusEnumModel.Rejected) statusVariant = 'danger';
    else if (displayRequest.status === EnvironmentUptimeRequestStatusEnumModel.Pending) statusVariant = 'warning';
  }

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Uptime Request"
      subtitle={displayRequest?.ticketId}
      maxWidth="lg"
    >
      {displayRequest && (
        <div className="flex flex-col divide-y divide-slate-200 dark:divide-zinc-800 -mx-5 sm:-mx-6">
          <div className="px-5 sm:px-6 pb-4 flex items-center gap-2">
            <BadgeSharedComponent variant={statusVariant} size="md" showDot>
              {displayRequest.status}
            </BadgeSharedComponent>
          </div>

          <div className="flex divide-x divide-slate-200 dark:divide-zinc-800">
            <DetailFieldRow className="flex-1 px-5 sm:px-6 py-4" icon={<User className="w-4 h-4" />} label="Requester" value={displayRequest.requesterName} />
            <DetailFieldRow className="flex-1 px-5 sm:px-6 py-4" icon={<Globe className="w-4 h-4" />} label="Environment" value={displayRequest.environment} />
          </div>

          <div className="flex divide-x divide-slate-200 dark:divide-zinc-800">
            <DetailFieldRow
              className="flex-1 px-5 sm:px-6 py-4"
              icon={<CalendarClock className="w-4 h-4" />}
              label="From (CET)"
              value={CETDateTimeFormatUtility.current.formatDateTime(displayRequest.fromAt)}
            />
            <DetailFieldRow
              className="flex-1 px-5 sm:px-6 py-4"
              icon={<CalendarClock className="w-4 h-4" />}
              label="To (CET)"
              value={CETDateTimeFormatUtility.current.formatDateTime(displayRequest.toAt)}
            />
          </div>

          {displayRequest.message && (
            <div className="px-5 sm:px-6 py-4">
              <DetailFieldRow icon={<FileText className="w-4 h-4" />} label="Message" value={displayRequest.message} multiline />
            </div>
          )}

          <div className="px-5 sm:px-6 pt-4">
            <Link
              to={ApplicationRouteCON.ENVIRONMENT_UPTIME_REQUEST_DETAIL_PATTERN}
              params={{ ticketId: displayRequest.ticketId }}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)] dark:text-sky-400 hover:underline"
            >
              View full ticket / change status
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
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
