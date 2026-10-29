import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Trash2,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Database,
  Globe,
  Bot,
  Sliders,
} from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import BadgeSharedComponent, { type BadgeSharedComponentProps } from '../../../Shared/Components/BadgeSharedComponent';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import FeatureRequestsCON from '../Constants/FeatureRequestsCON';
import { FeatureRequestCategoryEnumModel } from '../../../Models/FeatureRequestCategoryEnumModel';
import { FeatureRequestPriorityEnumModel } from '../../../Models/FeatureRequestPriorityEnumModel';
import { FeatureRequestStatusEnumModel } from '../../../Models/FeatureRequestStatusEnumModel';
import type FeatureRequestInterfaceModel from '../../../Models/FeatureRequestInterfaceModel';

export interface FeatureRequestCardStaticComponentProps {
  request: FeatureRequestInterfaceModel;
  onStatusChange?: (status: FeatureRequestStatusEnumModel) => void;
  onDelete: () => void;
}

function getCategoryIcon(category: FeatureRequestCategoryEnumModel): React.ReactNode {
  switch (category) {
    case FeatureRequestCategoryEnumModel.InfrastructureRegister:
      return <Database className="w-4 h-4 text-white" />;
    case FeatureRequestCategoryEnumModel.EnvironmentOverview:
      return <Globe className="w-4 h-4 text-white" />;
    case FeatureRequestCategoryEnumModel.ChatAssistant:
      return <Bot className="w-4 h-4 text-white" />;
    case FeatureRequestCategoryEnumModel.General:
    default:
      return <Sliders className="w-4 h-4 text-white" />;
  }
}

export default function FeatureRequestCardStaticComponent({
  request,
  onDelete,
}: FeatureRequestCardStaticComponentProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Map priority to badge variant
  let priorityVariant: BadgeSharedComponentProps['variant'] = 'neutral';
  if (request.priority === FeatureRequestPriorityEnumModel.Critical) {
    priorityVariant = 'danger';
  } else if (request.priority === FeatureRequestPriorityEnumModel.High) {
    priorityVariant = 'warning';
  } else if (request.priority === FeatureRequestPriorityEnumModel.Medium) {
    priorityVariant = 'info';
  }

  // Map status to badge variant
  let statusVariant: BadgeSharedComponentProps['variant'] = 'neutral';
  if (request.status === FeatureRequestStatusEnumModel.Completed) {
    statusVariant = 'success';
  } else if (request.status === FeatureRequestStatusEnumModel.InProgress) {
    statusVariant = 'info';
  } else if (request.status === FeatureRequestStatusEnumModel.UnderReview) {
    statusVariant = 'warning';
  } else if (request.status === FeatureRequestStatusEnumModel.Declined) {
    statusVariant = 'danger';
  }

  // Readable Category label
  const categoryLabel =
    FeatureRequestsCON.CATEGORY_OPTIONS.find((c) => c.value === request.category)?.label ?? request.category;

  // Readable Status label
  const statusLabel =
    FeatureRequestsCON.STATUS_OPTIONS.find((s) => s.value === request.status)?.label ?? request.status;

  // Format date using CET DateTime Utility
  const formattedDate = CETDateTimeFormatUtility.current.formatDateTime(request.createdAt);

  // Short ticket ID display
  const shortId = request.id ? request.id.replace(/-/g, '').slice(0, 8).toUpperCase() : 'UNKNOWN';
  const displayTicketId = `#FR-${shortId}`;

  const isLongDescription = request.description.length > 180;
  const displayDescription =
    isLongDescription && !isExpanded ? `${request.description.slice(0, 180)}...` : request.description;

  const handleCopyTicketId = (event: React.MouseEvent): void => {
    event.stopPropagation();
    navigator.clipboard.writeText(request.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
    toast.success('Ticket ID Copied', {
      description: `${displayTicketId} copied to clipboard.`,
    });
  };

  return (
    <CardSharedComponent
      variant="card"
      hoverable
      className="flex flex-col gap-3 transition-shadow hover:shadow-md p-4 sm:p-5"
    >
      {/* Top Header: Category Icon, Title & Badges */}
      <div className="flex items-start justify-between gap-3">
        {/* Module Icon & Title */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#0C2086] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            {getCategoryIcon(request.category)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">
              {categoryLabel}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {request.title}
            </h3>
          </div>
        </div>

        {/* Right: Ticket ID with 1-click Copy + Priority + Status */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded text-xs font-mono font-medium border border-slate-200/70 dark:border-zinc-700/60">
            <span className="font-semibold text-[#0C2086] dark:text-sky-400">
              {displayTicketId}
            </span>
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

          <BadgeSharedComponent variant={priorityVariant} size="sm" showDot>
            {request.priority} Priority
          </BadgeSharedComponent>

          <BadgeSharedComponent variant={statusVariant} size="sm" showDot>
            {statusLabel}
          </BadgeSharedComponent>
        </div>
      </div>

      {/* Description Body: Inset with Accent Border */}
      <div className="border-l-2 border-[#0C2086]/70 dark:border-sky-500/70 bg-slate-50/60 dark:bg-zinc-900/40 pl-3 pr-2.5 py-2.5 rounded-r-md text-xs sm:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
        <div>{displayDescription}</div>
        {isLongDescription && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
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

      {/* Footer: Requester, Timing, & Direct Delete */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
        {/* Left: Requester & Timing */}
        <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span className="font-medium text-slate-700 dark:text-zinc-300">{request.requesterName}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span>Submitted {formattedDate}</span>
          </span>
        </div>

        {/* Right: Direct Delete Button */}
        <button
          type="button"
          onClick={onDelete}
          title="Delete this request"
          aria-label="Delete feature request"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </CardSharedComponent>
  );
}
