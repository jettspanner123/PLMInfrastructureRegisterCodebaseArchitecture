import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import YearlyCalendarCON, { type YearMonthDay } from './Constants/YearlyCalendarCON';
import CalendarActivityLaneAssignmentHelper, {
  type CalendarActivityWithDisplayState,
} from './Helpers/CalendarActivityLaneAssignmentHelper';
import YearlyCalendarSidebarStaticComponent from './Components/YearlyCalendarSidebarStaticComponent';
import CalendarActivityFormModalController from './Components/CalendarActivityFormModalController';
import CalendarActivityDetailModalController from './Components/CalendarActivityDetailModalController';
import PrimaryActionButtonSharedComponent from '../../Shared/Components/PrimaryActionButtonSharedComponent';
import ExpandableSearchSharedComponent from '../../Shared/Components/ExpandableSearchSharedComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import { useIsAdmin } from '../../Utilities/AdminIdentityUtility';
import type CalendarActivityInterfaceModel from '../../Models/CalendarActivityInterfaceModel';

// 'forward' = moving to a later month/year (slides in from the right);
// 'backward' = an earlier one (slides in from the left) - same shape as
// EnvironmentUptimeRequestAvailabilityModalController's own SlideDirection
// (specs/015-yearly-calendar research.md §7), applied here to both the
// month/year label and the day grid itself, not just the label.
type SlideDirection = 'forward' | 'backward' | null;

const SLIDE_VARIANTS = {
  initial: (direction: SlideDirection) => ({
    x: direction === 'forward' ? 32 : direction === 'backward' ? -32 : 0,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: (direction: SlideDirection) => ({
    x: direction === 'forward' ? -32 : direction === 'backward' ? 32 : 0,
    opacity: 0,
    transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

function directionBetween(nextYear: number, nextMonth: number, prevYear: number, prevMonth: number): SlideDirection {
  const diff = (nextYear * 12 + nextMonth) - (prevYear * 12 + prevMonth);
  if (diff > 0) return 'forward';
  if (diff < 0) return 'backward';
  return null;
}

function isSameYmd(a: YearMonthDay, b: YearMonthDay): boolean {
  return a.year === b.year && a.monthIndex === b.monthIndex && a.day === b.day;
}

function compareYmd(a: YearMonthDay, b: YearMonthDay): number {
  return (a.year * 10000 + a.monthIndex * 100 + a.day) - (b.year * 10000 + b.monthIndex * 100 + b.day);
}

// Inverse of the backend's CETTimeZoneUtility.ToUtc: a stored UTC ISO
// timestamp read back as a fixed-CET (UTC+1, never DST-shifted) calendar
// date - same +1 hour shift as DowntimeAnnouncementFormModalController's own
// utcIsoToCetDateTimeLocal, truncated to just the date part.
function utcIsoToCetYmd(isoUtcTimestamp: string): YearMonthDay {
  const cetDate = new Date(new Date(isoUtcTimestamp).getTime() + 60 * 60 * 1000);
  return { year: cetDate.getUTCFullYear(), monthIndex: cetDate.getUTCMonth(), day: cetDate.getUTCDate() };
}

// Sunday-first, variable-row-count month matrix - as many full
// Sunday-to-Saturday rows as the month actually needs (4-6), with
// leading/trailing adjacent-month days filling out only the first/last row
// (specs/015-yearly-calendar research.md §1) - distinct from
// CustomDatePickerSharedComponent's own fixed 6-row/42-cell, Monday-first grid.
function buildMonthWeeksMatrix(year: number, monthIndex: number): YearMonthDay[][] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells: YearMonthDay[] = [];
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    cells.push({ year: prevYear, monthIndex: prevMonthIndex, day });
  }
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    cells.push({ year, monthIndex, day });
  }
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    cells.push({ year: nextYear, monthIndex: nextMonthIndex, day });
  }

  const weeks: YearMonthDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

const ACTIVITY_COLOR_CLASSNAMES: Record<string, string> = {
  blue: 'bg-sky-600 text-white',
  green: 'bg-emerald-600 text-white',
  amber: 'bg-amber-600 text-white',
};

// Cycled in creation order - the 1st created activity is 'blue', the 2nd
// 'green', the 3rd 'amber', the 4th 'blue' again, and so on (specs/016-
// calendar-activity-backend research.md §3).
const COLOR_PALETTE: Array<'blue' | 'green' | 'amber'> = ['blue', 'green', 'amber'];

const ACTIVITY_LANE_HEIGHT_PX = 28;
const DAY_CELL_HEADER_HEIGHT_PX = 28;
const MAX_VISIBLE_LANES_PER_WEEK = 3;
const MIN_WEEK_ROW_HEIGHT_PX = 140;

function weekKeyFor(week: YearMonthDay[]): string {
  const sunday = week[0];
  return `${sunday.year}-${sunday.monthIndex}-${sunday.day}`;
}

export default function YearlyCalendarScreenController(): React.JSX.Element {
  const isAdmin = useIsAdmin();
  const now = new Date();
  const todayYmd: YearMonthDay = { year: now.getFullYear(), monthIndex: now.getMonth(), day: now.getDate() };

  const [viewYear, setViewYear] = useState<number>(todayYmd.year);
  const [viewMonth, setViewMonth] = useState<number>(todayYmd.monthIndex);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivityInterfaceModel | null>(null);
  const [expandedWeekKeys, setExpandedWeekKeys] = useState<Set<string>>(new Set());

  const { data: activities = [] } = TanstackQueryClientService.current.calendarActivities.useCalendarActivitiesQuery();

  // Display color (by creation order) and "Backdated" state are derived
  // client-side, never persisted - re-evaluated on every render, exactly
  // like the existing "Today" cell highlight (specs/016-calendar-activity-
  // backend research.md §3).
  const activitiesWithDisplayState: CalendarActivityWithDisplayState[] = useMemo(() => {
    const sortedByCreatedAt = [...activities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const query = activitySearchQuery.trim().toLowerCase();

    return sortedByCreatedAt
      .filter((activity) => !query || activity.title.toLowerCase().includes(query))
      .map((activity, index) => {
        const startYmd = utcIsoToCetYmd(activity.startAt);
        return {
          activity,
          startYmd,
          endYmd: utcIsoToCetYmd(activity.endAt),
          colorKey: COLOR_PALETTE[index % COLOR_PALETTE.length],
          isBackdated: compareYmd(startYmd, todayYmd) < 0,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- todayYmd is derived fresh every render from `now`; its fields are the real dependency.
  }, [activities, activitySearchQuery, todayYmd.year, todayYmd.monthIndex, todayYmd.day]);

  const changeView = (nextYear: number, nextMonth: number): void => {
    setSlideDirection(directionBetween(nextYear, nextMonth, viewYear, viewMonth));
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const handlePrevMonth = (): void => {
    if (viewMonth === 0) changeView(viewYear - 1, 11);
    else changeView(viewYear, viewMonth - 1);
  };

  const handleNextMonth = (): void => {
    if (viewMonth === 11) changeView(viewYear + 1, 0);
    else changeView(viewYear, viewMonth + 1);
  };

  const handleToday = (): void => {
    changeView(todayYmd.year, todayYmd.monthIndex);
  };

  const handlePickMonth = (monthIndex: number): void => {
    changeView(viewYear, monthIndex);
  };

  const handleNavigateYear = (delta: 1 | -1): void => {
    changeView(viewYear + delta, viewMonth);
  };

  const toggleWeekExpanded = (weekKey: string): void => {
    setExpandedWeekKeys((previous) => {
      const next = new Set(previous);
      if (next.has(weekKey)) next.delete(weekKey);
      else next.add(weekKey);
      return next;
    });
  };

  const weeksMatrix = buildMonthWeeksMatrix(viewYear, viewMonth);
  const monthKey = `${viewYear}-${viewMonth}`;

  return (
    <div className="-m-3 sm:-m-6 lg:-m-8 -my-8 flex items-start w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
      <YearlyCalendarSidebarStaticComponent
        viewYear={viewYear}
        viewMonth={viewMonth}
        onPickMonth={handlePickMonth}
        onNavigateYear={handleNavigateYear}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-(--color-surface-card) border-b border-slate-300 dark:border-zinc-800/80 flex items-center px-4 gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="relative inline-block overflow-hidden align-middle h-5">
            <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
              <motion.span
                key={monthKey}
                custom={slideDirection}
                variants={SLIDE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                className="inline-block text-sm font-bold text-slate-900 dark:text-white"
              >
                {YearlyCalendarCON.MONTH_NAMES[viewMonth]} {viewYear}
              </motion.span>
            </AnimatePresence>
          </span>

          <div className="flex-1" />

          <ExpandableSearchSharedComponent
            value={activitySearchQuery}
            onChange={setActivitySearchQuery}
            placeholder="Search activities…"
            ariaLabel="Search Activities"
          />

          {isAdmin && (
            <PrimaryActionButtonSharedComponent label="Add Activity" onClick={() => setIsCreateModalOpen(true)} />
          )}
        </header>

        <div className="grid grid-cols-7 bg-(--color-surface-card) border-b border-slate-300 dark:border-zinc-800/80 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 text-center tracking-wider py-1.5 shrink-0">
          {YearlyCalendarCON.WEEKDAY_ABBREVIATIONS.map((abbreviation) => (
            <div key={abbreviation}>{abbreviation.toUpperCase()}</div>
          ))}
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
            <motion.div
              key={monthKey}
              custom={slideDirection}
              variants={SLIDE_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col divide-y divide-slate-300 dark:divide-zinc-800/80"
            >
              {weeksMatrix.map((week, weekIndex) => {
                const weekKey = weekKeyFor(week);
                const allAssignments = CalendarActivityLaneAssignmentHelper.current.assignLanesForWeek(
                  week,
                  activitiesWithDisplayState
                );
                const laneCount = allAssignments.reduce((max, a) => Math.max(max, a.laneIndex + 1), 0);
                const isExpanded = expandedWeekKeys.has(weekKey);
                const isCapped = laneCount > MAX_VISIBLE_LANES_PER_WEEK && !isExpanded;
                const visibleAssignments = isCapped
                  ? allAssignments.filter((a) => a.laneIndex < MAX_VISIBLE_LANES_PER_WEEK)
                  : allAssignments;
                const hasControl = laneCount > MAX_VISIBLE_LANES_PER_WEEK;
                const visibleLaneCount = isCapped ? MAX_VISIBLE_LANES_PER_WEEK : laneCount;
                const controlLaneIndex = visibleLaneCount;
                const totalLanesForHeight = visibleLaneCount + (hasControl ? 1 : 0);
                const rowMinHeight = Math.max(
                  MIN_WEEK_ROW_HEIGHT_PX,
                  DAY_CELL_HEADER_HEIGHT_PX + totalLanesForHeight * ACTIVITY_LANE_HEIGHT_PX + 8
                );

                return (
                  <div
                    key={weekIndex}
                    className="grid grid-cols-7 relative"
                    style={{ minHeight: rowMinHeight }}
                  >
                    {week.map((day, dayIndex) => {
                      const isCurrentMonth = day.monthIndex === viewMonth && day.year === viewYear;
                      const isToday = isSameYmd(day, todayYmd);
                      return (
                        <div
                          key={dayIndex}
                          className={`border-r border-slate-300 dark:border-zinc-800/80 last:border-r-0 flex flex-col ${
                            !isCurrentMonth ? 'bg-slate-50/50 dark:bg-zinc-900/30' : ''
                          }`}
                        >
                          <div
                            className={`p-1 shrink-0 border-b border-slate-300 dark:border-zinc-800/80 ${
                              isCurrentMonth ? 'bg-(--color-surface-card)' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                                  isToday
                                    ? 'bg-(--color-brand) text-white'
                                    : isCurrentMonth
                                      ? 'text-slate-700 dark:text-zinc-300'
                                      : 'text-slate-400 dark:text-zinc-600'
                                }`}
                              >
                                {day.day}
                              </span>
                              {isToday && (
                                <span className="text-[10px] font-semibold text-(--color-brand) tracking-wide pr-0.5">Today</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1" />
                        </div>
                      );
                    })}

                    <div
                      className="absolute inset-x-0 left-0 right-0 pointer-events-none"
                      style={{ top: DAY_CELL_HEADER_HEIGHT_PX, height: totalLanesForHeight * ACTIVITY_LANE_HEIGHT_PX }}
                    >
                      {visibleAssignments.map(({ activity, colorKey, isBackdated, laneIndex, startColumn, columnSpan }) => (
                        <div
                          key={activity.id}
                          onClick={() => setSelectedActivity(activity)}
                          className={`absolute px-1.5 truncate text-[10px] font-medium pointer-events-auto cursor-pointer transition-[filter] duration-150 hover:brightness-125 ${ACTIVITY_COLOR_CLASSNAMES[colorKey]}`}
                          style={{
                            top: laneIndex * ACTIVITY_LANE_HEIGHT_PX,
                            left: `calc(${(startColumn / 7) * 100}% + 2px)`,
                            width: `calc(${(columnSpan / 7) * 100}% - 4px)`,
                            height: ACTIVITY_LANE_HEIGHT_PX - 2,
                            lineHeight: `${ACTIVITY_LANE_HEIGHT_PX - 2}px`,
                          }}
                          title={activity.title}
                        >
                          {isBackdated && (
                            <span className="text-[9px] font-semibold uppercase tracking-wide opacity-90 mr-1">
                              Backdated
                            </span>
                          )}
                          {activity.title}
                        </div>
                      ))}

                      {hasControl && (
                        <button
                          type="button"
                          onClick={() => toggleWeekExpanded(weekKey)}
                          className="absolute left-0 right-0 px-1.5 text-[10px] font-semibold text-(--color-brand) hover:underline pointer-events-auto cursor-pointer text-left"
                          style={{
                            top: controlLaneIndex * ACTIVITY_LANE_HEIGHT_PX,
                            height: ACTIVITY_LANE_HEIGHT_PX,
                            lineHeight: `${ACTIVITY_LANE_HEIGHT_PX}px`,
                          }}
                        >
                          {isCapped ? `Show +${laneCount - MAX_VISIBLE_LANES_PER_WEEK} More` : 'Show less'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CalendarActivityFormModalController isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <CalendarActivityDetailModalController
        isOpen={selectedActivity !== null}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
      />
    </div>
  );
}
