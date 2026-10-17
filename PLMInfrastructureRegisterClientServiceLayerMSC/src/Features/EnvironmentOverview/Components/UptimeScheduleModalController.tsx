import React from 'react';
import { Plus } from 'lucide-react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import CustomSelectSharedComponent from '../../../Shared/Components/CustomSelectSharedComponent';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface UptimeScheduleModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  environmentName: string;
  specialModeOptions: string[];
  onDemandStatusOptions: string[];
  selectedDays: Set<string>;
  onToggleDay: (day: string) => void;
  specialMode: string | null;
  onSelectSpecialMode: (mode: string) => void;
  onDemandStatus: string | null;
  onSelectOnDemandStatus: (status: string) => void;
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  previewValue: string;
  notes: string;
  onNotesChange: (value: string) => void;
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
  onRequestAddSpecialMode: () => void;
  onRequestAddOnDemandStatus: () => void;
}

// A modal, not a dropdown (the user's own follow-up correction after the
// first pass) - ModalSharedComponent already gives this exactly what the
// hand-rolled dropdown panel had to build itself: a backdrop, Escape/outside-
// click-to-close, and (via the screen controller's own isOptionModalOpen-
// style guard) safe coexistence with the "click outside reverts to View
// Mode" effect, the same way the Create Sponsor/Status modals already
// coexist with it - no data-portal attribute workaround needed here. All
// business state (selection, computed preview, Add-New-option wiring)
// still lives in the parent screen controller, same reasoning as before:
// a freshly-created option needs to flow into whichever row opened this.
export default function UptimeScheduleModalController({
  isOpen,
  onClose,
  environmentName,
  specialModeOptions,
  onDemandStatusOptions,
  selectedDays,
  onToggleDay,
  specialMode,
  onSelectSpecialMode,
  onDemandStatus,
  onSelectOnDemandStatus,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  previewValue,
  notes,
  onNotesChange,
  canSave,
  isSaving,
  onSave,
  onRequestAddSpecialMode,
  onRequestAddOnDemandStatus,
}: UptimeScheduleModalControllerProps): React.JSX.Element {
  const needsTimeRange = !specialMode && selectedDays.size > 0;
  const needsOnDemandStatus = specialMode === 'On Demand';

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Current Uptime Schedule"
      subtitle={environmentName}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 whitespace-pre-wrap break-words min-w-0">
            {previewValue || 'Nothing selected yet'}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <ButtonSharedComponent variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </ButtonSharedComponent>
            <PrimaryActionButtonSharedComponent label="Done" onClick={onSave} disabled={!canSave} isLoading={isSaving} />
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <span className="block px-1 pb-1.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
            Mode
          </span>
          <CustomSelectSharedComponent
            value={specialMode ?? ''}
            onChange={onSelectSpecialMode}
            options={specialModeOptions.map((mode) => ({ value: mode, label: mode }))}
            searchable
            size="sm"
            placeholder="Select a mode"
            footerAction={{
              label: 'Add New Type',
              icon: <Plus className="w-3.5 h-3.5" />,
              onClick: onRequestAddSpecialMode,
            }}
          />
        </div>

        {needsOnDemandStatus && (
          <div>
            <span className="block px-1 pb-1.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
              Status
            </span>
            <CustomSelectSharedComponent
              value={onDemandStatus ?? ''}
              onChange={onSelectOnDemandStatus}
              options={onDemandStatusOptions.map((statusOption) => ({ value: statusOption, label: statusOption }))}
              searchable
              size="sm"
              placeholder="Select a status"
              footerAction={{
                label: 'Add New Status',
                icon: <Plus className="w-3.5 h-3.5" />,
                onClick: onRequestAddOnDemandStatus,
              }}
            />
          </div>
        )}

        <div>
          <span className="block px-1 pb-1.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Optional - shown alongside the schedule above"
            rows={3}
            className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50 resize-none"
          />
        </div>

        <div>
          <span className="block px-1 pb-1.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
            Or pick specific days
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDays.has(day);
              return (
                <label
                  key={day}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/60"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleDay(day)}
                    className="h-3.5 w-3.5 rounded accent-[#0C2086] cursor-pointer shrink-0"
                  />
                  <span className="truncate">{day}</span>
                </label>
              );
            })}
          </div>
        </div>

        {needsTimeRange && (
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <span className="block text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
                Start
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(event) => onStartTimeChange(event.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50"
              />
            </div>
            <div className="flex-1 space-y-1">
              <span className="block text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
                End
              </span>
              <input
                type="time"
                value={endTime}
                onChange={(event) => onEndTimeChange(event.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50"
              />
            </div>
          </div>
        )}
      </div>
    </ModalSharedComponent>
  );
}
