import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';

export interface CustomDatePickerSharedComponentProps {
  value?: string; // 'YYYY-MM-DD'
  onChange: (date: string) => void;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
  className?: string;
  showShortcuts?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function formatTwoDigits(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatDateString(year: number, monthIndex: number, day: number): string {
  return `${year}-${formatTwoDigits(monthIndex + 1)}-${formatTwoDigits(day)}`;
}

export default function CustomDatePickerSharedComponent({
  value,
  onChange,
  minDate,
  maxDate,
  className = '',
}: CustomDatePickerSharedComponentProps): React.JSX.Element {
  // Parse initial view year and month from value or current date
  const parsedValueDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedValueDate ? parsedValueDate.getFullYear() : new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedValueDate ? parsedValueDate.getMonth() : new Date().getMonth();
  });

  // Current system date representation for "Today" highlight
  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      string: formatDateString(now.getFullYear(), now.getMonth(), now.getDate()),
    };
  }, []);

  const handlePrevMonth = (): void => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(8);
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = (): void => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(8);
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Generate 42 days grid (6 weeks x 7 days)
  const daysMatrix = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    // Convert Sunday (0) to 6, Monday (1) to 0 (European/ISO calendar)
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const items: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isDisabled: boolean;
    }> = [];

    // Previous month padding days
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateString = formatDateString(prevYear, prevMonthIndex, day);
      const isDisabled =
        (Boolean(minDate) && dateString < (minDate as string)) ||
        (Boolean(maxDate) && dateString > (maxDate as string));
      items.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: false,
        isDisabled,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateString = formatDateString(viewYear, viewMonth, day);
      const isDisabled =
        (Boolean(minDate) && dateString < (minDate as string)) ||
        (Boolean(maxDate) && dateString > (maxDate as string));
      items.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: true,
        isDisabled,
      });
    }

    // Next month padding days to complete 35 or 42 cells
    const remainingCells = (7 - (items.length % 7)) % 7;
    const totalNeeded = items.length + remainingCells < 35 ? 35 - items.length : remainingCells;
    for (let day = 1; day <= totalNeeded; day++) {
      const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateString = formatDateString(nextYear, nextMonthIndex, day);
      const isDisabled =
        (Boolean(minDate) && dateString < (minDate as string)) ||
        (Boolean(maxDate) && dateString > (maxDate as string));
      items.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: false,
        isDisabled,
      });
    }

    return items;
  }, [viewYear, viewMonth, minDate, maxDate]);

  const handleSelectDate = (dateString: string, isDisabled: boolean): void => {
    if (isDisabled) return;
    ApplicationHapticsUtility.current.triggerHapticFeedback(12);
    onChange(dateString);
  };

  return (
    <div className={`flex flex-col select-none p-3 ${className}`}>
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Previous month"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-800 dark:text-zinc-100">
          <span>{MONTH_NAMES[viewMonth]}</span>
          <span className="text-slate-400 dark:text-zinc-500 font-mono">{viewYear}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Next month"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid Inset Box - matching Select Time container */}
      <div className="border border-slate-200/80 dark:border-zinc-800 rounded-lg p-1.5 bg-slate-50/50 dark:bg-zinc-900/30">
        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-1 text-center pb-1 border-b border-slate-200/60 dark:border-zinc-800/60 mb-1">
          {WEEKDAY_NAMES.map((name) => (
            <div
              key={name}
              className="text-[10px] font-mono font-medium text-slate-400 dark:text-zinc-500 py-0.5"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysMatrix.map((item, index) => {
            const isSelected = value === item.dateString;
            const isToday = today.string === item.dateString;

            let cellStyle = '';
            if (isSelected) {
              cellStyle = '!bg-[#0C2086] text-white font-semibold shadow-xs';
            } else if (item.isDisabled) {
              cellStyle = 'opacity-25 text-slate-300 dark:text-zinc-700 cursor-not-allowed pointer-events-none';
            } else if (isToday) {
              // Clean button styling without blue border, subtle bold indicator matching Select Time buttons
              cellStyle =
                'text-slate-900 dark:text-white font-bold hover:bg-slate-200/70 dark:hover:bg-zinc-800';
            } else if (item.isCurrentMonth) {
              cellStyle =
                'text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 font-medium';
            } else {
              cellStyle =
                'text-slate-400/60 dark:text-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-800/50 text-xs';
            }

            return (
              <button
                key={`${item.dateString}-${index}`}
                type="button"
                disabled={item.isDisabled}
                onClick={() => handleSelectDate(item.dateString, item.isDisabled)}
                className={`w-8 h-8 rounded text-xs flex items-center justify-center transition-colors cursor-pointer ${cellStyle}`}
              >
                {item.dayNumber}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
