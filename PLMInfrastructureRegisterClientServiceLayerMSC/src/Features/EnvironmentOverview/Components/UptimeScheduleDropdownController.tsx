import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Plus } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface UptimeScheduleDropdownControllerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  displayLabel: string;
  triggerClassName?: string;
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

// Positioning/portal mechanics only (trigger rect, fixed-position panel,
// outside-click-to-close) - copied from CustomSelectSharedComponent's own
// usePortal mode rather than extended from it directly, since this panel's
// CONTENT (weekday checkboxes + conditional time pickers/sub-dropdown) has
// nothing in common with that component's single options-list rendering.
// All business state (which days/mode/times are selected, the computed
// preview, Add-New-option wiring) is owned by the parent screen controller -
// this component is a pure positioning shell around props it just displays.
export default function UptimeScheduleDropdownController({
  isOpen,
  onOpen,
  onClose,
  displayLabel,
  triggerClassName,
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
}: UptimeScheduleDropdownControllerProps): React.JSX.Element {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (triggerRef.current) setTriggerRect(triggerRef.current.getBoundingClientRect());

    const handlePointerDown = (event: MouseEvent | TouchEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose]);

  const needsTimeRange = !specialMode && selectedDays.size > 0;
  const needsOnDemandStatus = specialMode === 'On Demand';

  const panel = (
    <AnimatePresence>
      {isOpen && triggerRect && (
        <motion.div
          ref={panelRef}
          data-portal="true"
          initial={{ opacity: 0, scale: 0.96, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: `${triggerRect.bottom + 6}px`,
            left: `${triggerRect.left}px`,
            minWidth: Math.max(260, triggerRect.width),
            zIndex: 9999,
          }}
          className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 text-xs normal-case tracking-normal font-sans text-slate-700 dark:text-zinc-300"
        >
          <div className="space-y-0.5">
            {specialModeOptions.map((mode) => {
              const isSelected = specialMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onSelectSpecialMode(mode)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-900/60'
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
              className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#0C2086] dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Type
            </button>
          </div>

          {needsOnDemandStatus && (
            <div className="mt-1 pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-0.5">
              {onDemandStatusOptions.map((statusOption) => {
                const isSelected = onDemandStatus === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => onSelectOnDemandStatus(statusOption)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-900/60'
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
                className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#0C2086] dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer text-left"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Status
              </button>
            </div>
          )}

          <div className="mt-1 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <span className="block px-1 pb-1 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
              Or pick specific days
            </span>
            <div className="grid grid-cols-1 gap-0.5">
              {WEEKDAYS.map((day) => {
                const isSelected = selectedDays.has(day);
                return (
                  <label
                    key={day}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900/60"
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
            <div className="mt-1 pt-2 border-t border-slate-100 dark:border-zinc-800/80 px-1 flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <span className="block text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500">
                  Start
                </span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => onStartTimeChange(event.target.value)}
                  className="w-full h-8 px-2 text-xs bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50"
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
                  className="w-full h-8 px-2 text-xs bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50"
                />
              </div>
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 px-1">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mb-1.5 whitespace-pre-wrap break-words">
              {previewValue || 'Nothing selected yet'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="font-bold text-slate-400 dark:text-zinc-500 hover:opacity-80 cursor-pointer px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!canSave || isSaving}
                className="font-bold underline text-[#0C2086] dark:text-blue-400 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-2 py-1"
              >
                {isSaving ? 'Saving…' : 'Done'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className={
          triggerClassName ??
          'w-full h-auto flex items-center justify-between gap-2 px-3 py-2.5 text-left font-mono text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/60 rounded-lg transition-colors cursor-pointer whitespace-pre-wrap break-words'
        }
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {typeof document !== 'undefined' && createPortal(panel, document.body)}
    </>
  );
}
