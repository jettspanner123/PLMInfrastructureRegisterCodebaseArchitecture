import React, { useState } from 'react';
import { Trash2, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import CardSharedComponent from '../../../Shared/Components/CardSharedComponent';
import BadgeSharedComponent, { type BadgeSharedComponentProps } from '../../../Shared/Components/BadgeSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import CustomSelectSharedComponent from '../../../Shared/Components/CustomSelectSharedComponent';
import FeatureRequestsCON from '../Constants/FeatureRequestsCON';
import { FeatureRequestPriorityEnumModel } from '../../../Models/FeatureRequestPriorityEnumModel';
import { FeatureRequestStatusEnumModel } from '../../../Models/FeatureRequestStatusEnumModel';
import type FeatureRequestInterfaceModel from '../../../Models/FeatureRequestInterfaceModel';

export interface FeatureRequestCardStaticComponentProps {
  request: FeatureRequestInterfaceModel;
  onStatusChange: (status: FeatureRequestStatusEnumModel) => void;
  onDelete: () => void;
}

export default function FeatureRequestCardStaticComponent({
  request,
  onStatusChange,
  onDelete,
}: FeatureRequestCardStaticComponentProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
  } else if (request.status === FeatureRequestStatusEnumModel.Planned) {
    statusVariant = 'warning';
  } else if (request.status === FeatureRequestStatusEnumModel.Declined) {
    statusVariant = 'danger';
  }

  // Readable Category label
  const categoryLabel =
    FeatureRequestsCON.CATEGORY_OPTIONS.find((c) => c.value === request.category)?.label ?? request.category;

  // Format date
  const formattedDate = new Date(request.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isLongDescription = request.description.length > 180;
  const displayDescription =
    isLongDescription && !isExpanded ? `${request.description.slice(0, 180)}...` : request.description;

  return (
    <CardSharedComponent variant="card" className="flex flex-col gap-3 transition-shadow hover:shadow-md">
      {/* Top Header: Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <BadgeSharedComponent variant="neutral" size="sm">
              {categoryLabel}
            </BadgeSharedComponent>
            <BadgeSharedComponent variant={priorityVariant} size="sm" showDot>
              {request.priority} Priority
            </BadgeSharedComponent>
            <BadgeSharedComponent variant={statusVariant} size="sm">
              {request.status.replace(/([A-Z])/g, ' $1').trim()}
            </BadgeSharedComponent>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
            {request.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line bg-slate-50/70 dark:bg-[#111114] p-3 rounded-md border border-slate-200/60 dark:border-zinc-800/60">
        {displayDescription}
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

      {/* Footer: Metadata & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-700 dark:text-zinc-300">{request.requesterName}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Status Changer */}
          <div className="w-36">
            <CustomSelectSharedComponent
              value={request.status}
              options={FeatureRequestsCON.STATUS_OPTIONS}
              onChange={(next) => onStatusChange(next as FeatureRequestStatusEnumModel)}
              size="sm"
            />
          </div>

          {/* Delete Action */}
          <ButtonSharedComponent
            onClick={onDelete}
            variant="ghost"
            size="sm"
            title="Delete this request"
            ariaLabel="Delete feature request"
            className="!px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-4 h-4" />
          </ButtonSharedComponent>
        </div>
      </div>
    </CardSharedComponent>
  );
}
