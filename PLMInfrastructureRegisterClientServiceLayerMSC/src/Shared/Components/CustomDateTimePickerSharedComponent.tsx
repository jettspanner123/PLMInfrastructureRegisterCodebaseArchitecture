import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarClock, Calendar, Clock, ChevronDown, X, Check } from 'lucide-react';
import CustomDatePickerSharedComponent from './CustomDatePickerSharedComponent';
import CustomTimePickerSharedComponent from './CustomTimePickerSharedComponent';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';

export interface CustomDateTimePickerSharedComponentProps {
  label?: string;
  value?: string; // 'YYYY-MM-DDTHH:mm' for datetime, 'YYYY-MM-DD' for date, 'HH:mm' for time
  onChange?: (value: string) => void;
  mode?: 'datetime' | 'date' | 'time';
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  size?: 'sm' | 'md';
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  usePortal?: boolean;
  dropdownAnchor?: 'left' | 'right';
}

function formatTwoDigits(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function getFormattedDisplay(value: string | undefined, mode: 'datetime' | 'date' | 'time'): string | null {
  if (!value) return null;

  try {
    if (mode === 'time') {
      return value;
    }

    if (mode === 'date') {
      const parts = value.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return value;
    }

    // datetime
    const [datePart, timePart] = value.split('T');
    if (datePart) {
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const formattedDate = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        return timePart ? `${formattedDate}, ${timePart}` : formattedDate;
      }
    }
    return value;
  } catch {
    return value;
  }
}

export default function CustomDateTimePickerSharedComponent({
  label,
  value,
  onChange,
  mode = 'datetime',
  placeholder,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  size = 'md',
  className = 'w-full',
  triggerClassName = '',
  dropdownClassName = '',
  usePortal = false,
  dropdownAnchor = 'left',
}: CustomDateTimePickerSharedComponentProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'date' | 'time'>('date');
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Split value into date and time
  const [selectedDate, selectedTime] = useMemo(() => {
    if (!value) {
      return ['', '12:00'];
    }
    if (mode === 'date') {
      return [value, '12:00'];
    }
    if (mode === 'time') {
      return ['', value];
    }
    const [d, t] = value.split('T');
    return [d ?? '', t ?? '12:00'];
  }, [value, mode]);

  const updateTriggerRect = useCallback((): void => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = (): void => {
      updateTriggerRect();
    };

    if (usePortal) {
      updateTriggerRect();
      window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
      window.addEventListener('resize', handleScrollOrResize, { passive: true });
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent): void => {
      const isInsideTrigger = triggerRef.current?.contains(event.target as Node);
      const isInsidePanel = panelRef.current?.contains(event.target as Node);
      if (!isInsideTrigger && !isInsidePanel) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      if (usePortal) {
        window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
        window.removeEventListener('resize', handleScrollOrResize);
      }
    };
  }, [isOpen, usePortal, updateTriggerRect]);

  const handleDateChange = (newDate: string): void => {
    if (mode === 'date') {
      onChange?.(newDate);
      setIsOpen(false);
      return;
    }
    const time = selectedTime || '12:00';
    onChange?.(newDate ? `${newDate}T${time}` : '');
  };

  const handleTimeChange = (newTime: string): void => {
    if (mode === 'time') {
      onChange?.(newTime);
      return;
    }
    const date = selectedDate || new Date().toISOString().split('T')[0];
    onChange?.(`${date}T${newTime}`);
  };

  const handleNowAction = (): void => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(12);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${formatTwoDigits(now.getMonth() + 1)}-${formatTwoDigits(now.getDate())}`;
    const timeStr = `${formatTwoDigits(now.getHours())}:${formatTwoDigits(now.getMinutes())}`;

    if (mode === 'date') {
      onChange?.(dateStr);
    } else if (mode === 'time') {
      onChange?.(timeStr);
    } else {
      onChange?.(`${dateStr}T${timeStr}`);
    }
  };

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    ApplicationHapticsUtility.current.triggerHapticFeedback(12);
    onChange?.('');
  };

  const defaultPlaceholder =
    mode === 'datetime'
      ? 'Select date & time...'
      : mode === 'date'
        ? 'Select date...'
        : 'Select time...';

  const displayLabel = getFormattedDisplay(value, mode) ?? (placeholder || defaultPlaceholder);
  const hasValue = Boolean(value && String(value).trim() !== '');

  const heightClass =
    size === 'sm'
      ? 'h-11 sm:h-9 px-3.5 sm:px-2.5 text-sm sm:text-xs'
      : 'h-11 sm:h-10 px-3.5 sm:px-3 text-sm sm:text-xs';

  const ModeIcon = mode === 'time' ? Clock : mode === 'date' ? Calendar : CalendarClock;

  const popoverContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.96, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={
            usePortal && triggerRect
              ? {
                  position: 'fixed',
                  top: `${triggerRect.bottom + 6}px`,
                  left: dropdownAnchor === 'right' ? undefined : `${triggerRect.left}px`,
                  right:
                    dropdownAnchor === 'right'
                      ? `${window.innerWidth - triggerRect.right}px`
                      : undefined,
                  zIndex: 9999,
                }
              : undefined
          }
          className={`${
            usePortal
              ? ''
              : `absolute ${dropdownAnchor === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5`
          } z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 text-xs select-none max-w-[calc(100vw-24px)] ${dropdownClassName}`}
        >
          {/* Mobile Tabbed Segmented Control (when in datetime mode on small screens) */}
          {mode === 'datetime' && (
            <div className="flex sm:hidden items-center p-1 mb-2 bg-slate-100 dark:bg-zinc-900 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveMobileTab('date')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeMobileTab === 'date'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Date
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('time')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeMobileTab === 'time'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Time ({selectedTime})
              </button>
            </div>
          )}

          {/* Desktop & Mobile Main Panels */}
          <div className="flex flex-col sm:flex-row items-stretch">
            {/* Date Picker View */}
            {(mode === 'date' || mode === 'datetime') && (
              <div
                className={`w-72 ${
                  mode === 'datetime'
                    ? `${activeMobileTab === 'date' ? 'block' : 'hidden sm:block'} sm:border-r border-slate-200/80 dark:border-zinc-800 sm:pr-2`
                    : ''
                }`}
              >
                <CustomDatePickerSharedComponent
                  value={selectedDate}
                  onChange={handleDateChange}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              </div>
            )}

            {/* Time Picker View */}
            {(mode === 'time' || mode === 'datetime') && (
              <div
                className={`w-72 sm:w-48 ${
                  mode === 'datetime'
                    ? `${activeMobileTab === 'time' ? 'block' : 'hidden sm:block'} sm:pl-2`
                    : ''
                }`}
              >
                <CustomTimePickerSharedComponent
                  value={selectedTime}
                  onChange={handleTimeChange}
                />
              </div>
            )}
          </div>

          {/* Bottom Popover Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handleNowAction}
              className="px-2.5 py-1 text-xs font-medium text-[#0C2086] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors cursor-pointer"
            >
              Set to Now
            </button>

            <button
              type="button"
              onClick={() => {
                ApplicationHapticsUtility.current.triggerHapticFeedback(12);
                setIsOpen(false);
              }}
              className="px-3 py-1 text-xs font-semibold bg-[#0C2086] text-white hover:bg-[#081765] rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            ApplicationHapticsUtility.current.triggerHapticFeedback(10);
            updateTriggerRect();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full flex items-center justify-between rounded-md bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 hairline-border-strong focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors duration-200 select-none group text-left ${heightClass} ${
          error ? 'border-red-500 dark:border-red-500' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-1">
          <ModeIcon className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <span
            className={`truncate ${
              hasValue
                ? 'font-medium text-slate-900 dark:text-zinc-100'
                : 'text-slate-400 dark:text-zinc-500 font-normal'
            }`}
          >
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onChange?.('');
                }
              }}
              title="Clear selection"
              aria-label="Clear selection"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Panel (in portal or inline) */}
      {usePortal && typeof document !== 'undefined'
        ? createPortal(popoverContent, document.body)
        : popoverContent}

      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </div>
  );
}
