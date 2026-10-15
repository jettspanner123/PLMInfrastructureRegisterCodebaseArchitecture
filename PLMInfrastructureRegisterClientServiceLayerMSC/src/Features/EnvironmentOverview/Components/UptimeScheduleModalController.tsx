import React from 'react';
import { Check, Plus } from 'lucide-react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';

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
          <div className="space-y-0.5">
            {specialModeOptions.map((mode) => {
              const isSelected = specialMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onSelectSpecialMode(mode)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-left text-xs ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="truncate">{mode}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#0C2086] dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onRequestAddSpecialMode}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#0C2086] dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Type
            </button>
          </div>
        </div>

        {needsOnDemandStatus && (
          <div>
            <span className="block px-1 pb-1.5 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
              Status
            </span>
            <div className="space-y-0.5">
              {onDemandStatusOptions.map((statusOption) => {
                const isSelected = onDemandStatus === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => onSelectOnDemandStatus(statusOption)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-left text-xs ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <span className="truncate">{statusOption}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#0C2086] dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={onRequestAddOnDemandStatus}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#0C2086] dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer text-left"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Status
              </button>
            </div>
          </div>
        )}

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
