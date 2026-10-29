import React, { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Trash2, Clock, CalendarClock, ArrowRight, Copy, Check, Server, ChevronDown, ChevronUp } from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import BadgeSharedComponent, { type BadgeSharedComponentProps } from '../../../Shared/Components/BadgeSharedComponent';
import ApplicationRouteCON from '../../../Constants/ApplicationRouteCON';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import EnvironmentUptimeRequestsCON from '../Constants/EnvironmentUptimeRequestsCON';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../../Models/EnvironmentUptimeRequestStatusEnumModel';
import type EnvironmentUptimeRequestInterfaceModel from '../../../Models/EnvironmentUptimeRequestInterfaceModel';

export interface EnvironmentUptimeRequestCardStaticComponentProps {
  request: EnvironmentUptimeRequestInterfaceModel;
  onDelete: () => void;
}

function calculateDurationLabel(fromAt: string, toAt: string): string | null {
  try {
    const fromTime = new Date(fromAt).getTime();
    const toTime = new Date(toAt).getTime();
    const diffMs = toTime - fromTime;
    if (isNaN(diffMs) || diffMs <= 0) return null;

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
  } catch {
    return null;
  }
}

export default function EnvironmentUptimeRequestCardStaticComponent({
  request,
  onDelete,
}: EnvironmentUptimeRequestCardStaticComponentProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

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
  const durationLabel = useMemo(
    () => calculateDurationLabel(request.fromAt, request.toAt),
    [request.fromAt, request.toAt]
  );

  const message = request.message ?? '';
  const isLongMessage = message.length > 180;
  const displayMessage = isLongMessage && !isExpanded ? `${message.slice(0, 180)}...` : message;

  const handleCopyTicketId = (event: React.MouseEvent): void => {
    event.stopPropagation();
    navigator.clipboard.writeText(request.ticketId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
    toast.success(EnvironmentUptimeRequestsCON.COPY_TOAST_TITLE, {
      description: `${request.ticketId} copied to clipboard.`,
    });
  };

  return (
    <CardSharedComponent
      variant="card"
      hoverable
      className="flex flex-col gap-3 transition-shadow hover:shadow-md p-4 sm:p-5"
    >
      {/* Top Header: Environment & Badges */}
      <div className="flex items-start justify-between gap-3">
        {/* Environment Name Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#0C2086] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Server className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate tracking-tight leading-snug">
              {request.environment}
            </h3>
          </div>
        </div>

        {/* Badges: Ticket ID with 1-click Copy + Status */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded text-xs font-mono font-medium border border-slate-200/70 dark:border-zinc-700/60">
            <Link
              to={ApplicationRouteCON.ENVIRONMENT_UPTIME_REQUEST_DETAIL_PATTERN}
              params={{ ticketId: request.ticketId }}
              className="text-[#0C2086] dark:text-sky-400 hover:underline font-semibold"
            >
              {request.ticketId}
            </Link>
            <button
              type="button"
              onClick={handleCopyTicketId}
              title="Copy ticket ID"
              aria-label="Copy ticket ID"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-100 transition-colors p-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-700 cursor-pointer ml-0.5"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <BadgeSharedComponent variant={statusVariant} size="sm" showDot>
            {request.status}
          </BadgeSharedComponent>
        </div>
      </div>

      {/* Maintenance Schedule Window */}
      <div className="rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-2.5 sm:p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium">
            <CalendarClock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span>Maintenance Window (CET)</span>
          </div>
          {durationLabel && (
            <span className="font-mono text-[11px] font-semibold text-[#0C2086] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/40">
              {durationLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 flex-wrap">
          <span className="font-mono">{formattedFromAt}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
          <span className="font-mono">{formattedToAt}</span>
        </div>
      </div>

      {/* Optional Context / Message */}
      {message && (
        <div className="border-l-2 border-[#0C2086]/70 dark:border-sky-500/70 bg-slate-50/60 dark:bg-zinc-900/40 pl-3 pr-2.5 py-2 rounded-r-md text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">
            Context / Notes
          </div>
          <div>{displayMessage}</div>
          {isLongMessage && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-[#0C2086] dark:text-sky-400 hover:underline mt-1 flex items-center gap-1 cursor-pointer"
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

      {/* Footer: Submission metadata & Delete action */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
        <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Submitted {formattedSubmittedAt}</span>
        </div>

        <button
          type="button"
          onClick={onDelete}
          title="Delete this request"
          aria-label="Delete uptime request"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </CardSharedComponent>
  );
}
