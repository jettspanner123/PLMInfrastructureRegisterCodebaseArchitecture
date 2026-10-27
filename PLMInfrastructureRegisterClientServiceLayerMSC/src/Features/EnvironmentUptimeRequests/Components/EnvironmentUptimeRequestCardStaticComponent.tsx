import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Trash2, Globe, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import BadgeSharedComponent, { type BadgeSharedComponentProps } from '../../../Shared/Components/BadgeSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import ApplicationRouteCON from '../../../Constants/ApplicationRouteCON';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import EnvironmentUptimeRequestsCON from '../Constants/EnvironmentUptimeRequestsCON';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../../Models/EnvironmentUptimeRequestStatusEnumModel';
import type EnvironmentUptimeRequestInterfaceModel from '../../../Models/EnvironmentUptimeRequestInterfaceModel';

export interface EnvironmentUptimeRequestCardStaticComponentProps {
  request: EnvironmentUptimeRequestInterfaceModel;
  onDelete: () => void;
}

export default function EnvironmentUptimeRequestCardStaticComponent({
  request,
  onDelete,
}: EnvironmentUptimeRequestCardStaticComponentProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Map status to badge variant
  let statusVariant: BadgeSharedComponentProps['variant'] = 'neutral';
  if (request.status === EnvironmentUptimeRequestStatusEnumModel.Approved) {
    statusVariant = 'info';
  } else if (request.status === EnvironmentUptimeRequestStatusEnumModel.Completed) {
    statusVariant = 'success';
  } else if (request.status === EnvironmentUptimeRequestStatusEnumModel.Rejected) {
    statusVariant = 'danger';
  } else if (request.status === EnvironmentUptimeRequestStatusEnumModel.Cancelled) {
    statusVariant = 'neutral';
  } else if (request.status === EnvironmentUptimeRequestStatusEnumModel.Pending) {
    statusVariant = 'warning';
  }

  const formattedSubmittedAt = CETDateTimeFormatUtility.current.formatDateTime(request.createdAt);
  const formattedFromAt = CETDateTimeFormatUtility.current.formatDateTime(request.fromAt);
  const formattedToAt = CETDateTimeFormatUtility.current.formatDateTime(request.toAt);

  const message = request.message ?? '';
  const isLongMessage = message.length > 180;
  const displayMessage = isLongMessage && !isExpanded ? `${message.slice(0, 180)}...` : message;

  const handleCopyTicketId = (): void => {
    navigator.clipboard.writeText(request.ticketId);
    toast.success(EnvironmentUptimeRequestsCON.COPY_TOAST_TITLE, {
      description: `${request.ticketId} copied to clipboard.`,
    });
  };

  return (
    <CardSharedComponent
      variant="card"
      hoverable
      onClick={handleCopyTicketId}
      className="flex flex-col gap-3 transition-shadow hover:shadow-md"
    >
      {/* Top Header: Ticket ID, Environment & Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Link
              to={ApplicationRouteCON.ENVIRONMENT_UPTIME_REQUEST_DETAIL_PATTERN}
              params={{ ticketId: request.ticketId }}
              onClick={(event) => event.stopPropagation()}
              className="font-mono font-semibold text-sm text-[#0C2086] dark:text-sky-400 hover:underline"
            >
              {request.ticketId}
            </Link>
            <BadgeSharedComponent variant={statusVariant} size="sm" showDot>
              {request.status}
            </BadgeSharedComponent>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
            {request.environment}
          </h3>
        </div>
      </div>

      {/* From -> To Range */}
      <div className="text-sm text-slate-700 dark:text-zinc-300 bg-slate-50/70 dark:bg-[#111114] p-3 rounded-md border border-slate-200/60 dark:border-zinc-800/60 flex items-center gap-2">
        <CalendarRangeText fromLabel={formattedFromAt} toLabel={formattedToAt} />
      </div>

      {/* Message */}
      {message && (
        <div className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
          {displayMessage}
          {isLongMessage && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-xs font-semibold text-[#0C2086] dark:text-sky-400 hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer: Metadata & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          Submitted {formattedSubmittedAt}
        </div>

        {/* Wrapper stops the click from bubbling up to the card's own
            copy-to-clipboard onClick - ButtonSharedComponent's onClick prop
            takes no event, so propagation must be stopped one level up. */}
        <div className="flex items-center gap-2 self-end sm:self-auto" onClick={(event) => event.stopPropagation()}>
          <ButtonSharedComponent
            onClick={onDelete}
            variant="ghost"
            size="sm"
            title="Delete this request"
            ariaLabel="Delete uptime request"
            className="!px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-4 h-4" />
          </ButtonSharedComponent>
        </div>
      </div>
    </CardSharedComponent>
  );
}

function CalendarRangeText({ fromLabel, toLabel }: { fromLabel: string; toLabel: string }): React.JSX.Element {
  return (
    <span className="font-mono text-xs sm:text-sm">
      {fromLabel} <span className="text-slate-400 dark:text-zinc-500">&rarr;</span> {toLabel}
    </span>
  );
}
