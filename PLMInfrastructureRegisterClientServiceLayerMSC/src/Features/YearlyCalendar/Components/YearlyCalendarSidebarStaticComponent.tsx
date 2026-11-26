import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import YearlyCalendarCON from '../Constants/YearlyCalendarCON';

export interface YearlyCalendarSidebarStaticComponentProps {
  viewYear: number;
  viewMonth: number; // 0-11
  onPickMonth: (monthIndex: number) => void;
  onNavigateYear: (delta: 1 | -1) => void;
}

// Year navigator + 12-month quick-select, adapted from
// YEARLY_CALENDAR_VIEW.html's own left sidebar (specs/015-yearly-calendar) -
// rendered directly inside YearlyCalendarScreenController's own full-bleed
// wrapper (not through NavigationController's generic sidebar slot), since
// it needs to share live viewYear/viewMonth state with the main grid, which
// sibling components under that slot cannot do without a URL/store mechanism
// this feature doesn't otherwise need.
export default function YearlyCalendarSidebarStaticComponent({
  viewYear,
  viewMonth,
  onPickMonth,
  onNavigateYear,
}: YearlyCalendarSidebarStaticComponentProps): React.JSX.Element {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-slate-300 dark:border-zinc-800/80 bg-(--color-surface-card) sticky top-16 h-[calc(100dvh-64px)] overflow-y-auto p-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={() => onNavigateYear(-1)}
          aria-label="Previous year"
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-wide">{viewYear}</span>
        <button
          type="button"
          onClick={() => onNavigateYear(1)}
          aria-label="Next year"
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 text-[11px] text-center font-medium">
        {YearlyCalendarCON.MONTH_NAMES.map((monthName, monthIndex) => {
          const isActive = monthIndex === viewMonth;
          return (
            <button
              key={monthName}
              type="button"
              onClick={() => onPickMonth(monthIndex)}
              className={`py-1.5 rounded transition-colors cursor-pointer ${
                isActive
                  ? 'bg-(--color-brand) text-white font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {monthName.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
