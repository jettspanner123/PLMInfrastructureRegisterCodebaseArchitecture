import React from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import CETDateTimeFormatUtility from '../../../Utilities/CETDateTimeFormatUtility';
import type CalendarActivityInterfaceModel from '../../../Models/CalendarActivityInterfaceModel';

export interface CalendarActivityDetailModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  activity: CalendarActivityInterfaceModel | null;
}

// Read-only - no edit or delete control anywhere (spec FR-017/User Story 2).
export default function CalendarActivityDetailModalController({
  isOpen,
  onClose,
  activity,
}: CalendarActivityDetailModalControllerProps): React.JSX.Element | null {
  if (!activity) return null;

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title={activity.title}
      subtitle="Activity details"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-end">
          <ButtonSharedComponent variant="outline" onClick={onClose}>
            Close
          </ButtonSharedComponent>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">Description</span>
          <p className="text-sm text-slate-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
            {activity.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">Environment</span>
            <p className="text-sm text-slate-900 dark:text-zinc-100">{activity.environment}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">Responsible Person</span>
            <p className="text-sm text-slate-900 dark:text-zinc-100">{activity.responsiblePerson}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">Contact Email</span>
            <p className="text-sm text-slate-900 dark:text-zinc-100">{activity.contactEmail}</p>
          </div>
          <div />
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">Start</span>
            <p className="text-sm text-slate-900 dark:text-zinc-100">
              {CETDateTimeFormatUtility.current.formatDateTime(activity.startAt)}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">End</span>
            <p className="text-sm text-slate-900 dark:text-zinc-100">
              {CETDateTimeFormatUtility.current.formatDateTime(activity.endAt)}
            </p>
          </div>
        </div>
      </div>
    </ModalSharedComponent>
  );
}
