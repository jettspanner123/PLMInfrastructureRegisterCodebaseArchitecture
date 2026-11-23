import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';

export interface EnvironmentUptimeRequestAvailabilityModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  environment: string;
  fromAt: string;
  toAt: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  fromError?: string;
  toError?: string;
}

// Static 1:1 port of PLMInfrastructureRegisterAgentDocumentationNMSC/UI_HTML/CALENDAR_MODAL_VIEW.html
// (a Microsoft Teams Calendar mockup), now with working navigation (week arrows, mini-calendar
// row/month clicks, Today) and a past-date/time booking guard - still no backend/query wiring, no
// connection to fromAt/toAt/onFromChange/onToChange yet. That reconnection is a deliberately
// separate, later step.

const HOURS_START = 0;
const HOURS_END = 23;
const HOURS_COUNT = HOURS_END - HOURS_START + 1; // 24
const SLOT_HEIGHT_PX = 96; // h-24

const HOUR_ROWS = Array.from({ length: HOURS_COUNT }, (_, index) => HOURS_START + index);

const WEEKDAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface YearMonthDay {
  year: number;
  monthIndex: number; // 0-11
  day: number;
}

function toDate(ymd: YearMonthDay): Date {
  return new Date(ymd.year, ymd.monthIndex, ymd.day);
}

function toYmd(date: Date): YearMonthDay {
  return { year: date.getFullYear(), monthIndex: date.getMonth(), day: date.getDate() };
}

function addDays(ymd: YearMonthDay, delta: number): YearMonthDay {
  const date = toDate(ymd);
  date.setDate(date.getDate() + delta);
  return toYmd(date);
}

function isSameYmd(a: YearMonthDay, b: YearMonthDay): boolean {
  return a.year === b.year && a.monthIndex === b.monthIndex && a.day === b.day;
}

function getSundayOfWeek(ymd: YearMonthDay): YearMonthDay {
  const date = toDate(ymd);
  date.setDate(date.getDate() - date.getDay());
  return toYmd(date);
}

// 'forward' = the new content is later in time than the old (slides in from the right);
// 'backward' = earlier (slides in from the left); null = no transition (e.g. re-selecting the
// already-selected week) - see research.md §1/§4 and data-model.md's SlideDirection entity.
type SlideDirection = 'forward' | 'backward' | null;

function directionBetween(next: YearMonthDay, prev: YearMonthDay): SlideDirection {
  const diff = toDate(next).getTime() - toDate(prev).getTime();
  if (diff > 0) return 'forward';
  if (diff < 0) return 'backward';
  return null;
}

// Shared directional slide recipe - same "custom direction drives initial/animate/exit" pattern
// already used by ModalSharedComponent's own modalVariants (research.md §1).
const SLIDE_VARIANTS = {
  initial: (direction: SlideDirection) => ({
    x: direction === 'forward' ? 28 : direction === 'backward' ? -28 : 0,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: (direction: SlideDirection) => ({
    x: direction === 'forward' ? -28 : direction === 'backward' ? 28 : 0,
    opacity: 0,
    transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

function SlidingLabel({
  slideKey,
  direction,
  className,
  children,
}: {
  slideKey: string;
  direction: SlideDirection;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <span className="relative inline-block overflow-hidden align-middle">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.span
          key={slideKey}
          custom={direction}
          variants={SLIDE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`inline-block ${className ?? ''}`}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface WeekDay extends YearMonthDay {
  weekdayAbbreviation: string;
  isWeekend: boolean;
}

function formatWeekRangeLabel(first: YearMonthDay, last: YearMonthDay): string {
  const firstMonthName = MONTH_NAMES[first.monthIndex];
  const lastMonthName = MONTH_NAMES[last.monthIndex];
  if (first.year === last.year && first.monthIndex === last.monthIndex) {
    return `${first.day}–${last.day} ${firstMonthName}, ${first.year}`;
  }
  if (first.year === last.year) {
    return `${first.day} ${firstMonthName} – ${last.day} ${lastMonthName}, ${first.year}`;
  }
  return `${first.day} ${firstMonthName}, ${first.year} – ${last.day} ${lastMonthName}, ${last.year}`;
}

// Converts an hour-of-day (0-23, or 24 to represent the day's end boundary / next midnight) to a
// bare 12-hour label like "12 AM" / "1 PM" - matches this view's minimal hour-label style, just
// swapped from 24-hour digits to 12-hour + period.
function formatHourLabel12(hour: number): string {
  const normalizedHour = hour % 24;
  const period = normalizedHour < 12 ? 'AM' : 'PM';
  const hour12 = normalizedHour % 12 === 0 ? 12 : normalizedHour % 12;
  return `${hour12} ${period}`;
}

function getSlotIndex(day: number, hour: number): number {
  return day * HOURS_COUNT + (hour - HOURS_START);
}

interface TeamsCalendarEvent {
  id: string;
  day: number;
  startHour: number;
  endHour: number; // inclusive
  title: string;
  justCreated?: boolean;
}

function OfficeBuildingIcon({ className }: { className: string }): React.JSX.Element {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 3a2 2 0 00-2 2v12a1 1 0 001 1h14a1 1 0 001-1V9a2 2 0 00-2-2h-3V5a2 2 0 00-2-2H4zm2 4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1V7zm0 4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1zm0 4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1zm6-4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1zm0 4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1z" />
    </svg>
  );
}

export default function EnvironmentUptimeRequestAvailabilityModalController({
  isOpen,
  onClose,
}: EnvironmentUptimeRequestAvailabilityModalControllerProps): React.JSX.Element {
  // Recomputed fresh every render (not memoized once) - spec.md's Assumption is explicit that
  // this re-evaluates "on render/interaction, not a live per-second timer", so a plain value here
  // (refreshed on every open/interaction-driven re-render) is exactly right - memoizing with `[]`
  // would go stale if the modal stayed mounted-but-closed across a day boundary.
  const now = new Date();
  const todayYmd = toYmd(now);
  const currentHour = now.getHours();

  const [viewYear, setViewYear] = useState<number>(todayYmd.year);
  const [viewMonth, setViewMonth] = useState<number>(todayYmd.monthIndex);
  const [selectedWeekStart, setSelectedWeekStart] = useState<YearMonthDay>(() => getSundayOfWeek(todayYmd));
  const [weekSlideDirection, setWeekSlideDirection] = useState<SlideDirection>(null);
  const [monthSlideDirection, setMonthSlideDirection] = useState<SlideDirection>(null);

  const [startSlot, setStartSlot] = useState<{ day: number; hour: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ day: number; hour: number } | null>(null);
  const [events, setEvents] = useState<TeamsCalendarEvent[]>([]);
  const bookedEventCounterRef = useRef(0);
  const gridScrollRef = useRef<HTMLDivElement | null>(null);

  const cancelSelection = (): void => {
    setStartSlot(null);
    setHoverSlot(null);
  };

  useEffect(() => {
    if (!isOpen) cancelSelection();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && startSlot) cancelSelection();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, startSlot]);

  // Mini-calendar follows the main grid's selected week across a month boundary (FR-009) - but
  // deliberately does NOT depend on viewYear/viewMonth themselves, so the mini-calendar's own
  // independent month browsing (FR-008) never gets fought/reset by this effect.
  useEffect(() => {
    const weekMonthYmd: YearMonthDay = { year: selectedWeekStart.year, monthIndex: selectedWeekStart.monthIndex, day: 1 };
    const currentViewYmd: YearMonthDay = { year: viewYear, monthIndex: viewMonth, day: 1 };
    if (!isSameYmd(weekMonthYmd, currentViewYmd)) {
      setMonthSlideDirection(directionBetween(weekMonthYmd, currentViewYmd));
      setViewYear(weekMonthYmd.year);
      setViewMonth(weekMonthYmd.monthIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeekStart]);

  // Sunday-first month grid (matches this sidebar's S M T W T F S header), chunked into week-rows
  // so each row can be selected as a single unit - mirrors CustomDatePickerSharedComponent's own
  // daysMatrix generator, adapted from ISO Monday-first to Sunday-first.
  const weeksMatrix = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: YearMonthDay[] = [];
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ year: prevYear, monthIndex: prevMonthIndex, day });
    }
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      cells.push({ year: viewYear, monthIndex: viewMonth, day });
    }
    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ year: nextYear, monthIndex: nextMonthIndex, day });
    }

    const weeks: YearMonthDay[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [viewYear, viewMonth]);

  const weekDays: WeekDay[] = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const ymd = addDays(selectedWeekStart, i);
        return { ...ymd, weekdayAbbreviation: WEEKDAY_ABBREVIATIONS[i], isWeekend: i === 0 || i === 6 };
      }),
    [selectedWeekStart]
  );

  const weekRangeLabel = useMemo(() => formatWeekRangeLabel(weekDays[0], weekDays[6]), [weekDays]);
  const weekKey = `${selectedWeekStart.year}-${selectedWeekStart.monthIndex}-${selectedWeekStart.day}`;
  const monthKey = `${viewYear}-${viewMonth}`;

  const previewRange = useMemo(() => {
    if (!startSlot || !hoverSlot) return null;
    const startIndex = getSlotIndex(startSlot.day, startSlot.hour);
    const hoverIndex = getSlotIndex(hoverSlot.day, hoverSlot.hour);
    return { lo: Math.min(startIndex, hoverIndex), hi: Math.max(startIndex, hoverIndex) };
  }, [startSlot, hoverSlot]);

  // A slot is unselectable when its day is before today, or it's today and at-or-before the
  // current hour (the earliest selectable hour on today is `currentHour + 1`) - data-model.md's
  // SlotSelectability rule.
  const isSlotDisabled = (dayIndex: number, hour: number): boolean => {
    const day = weekDays[dayIndex];
    const dayDiff = toDate(day).getTime() - toDate(todayYmd).getTime();
    if (dayDiff < 0) return true;
    if (dayDiff > 0) return false;
    return hour <= currentHour;
  };

  const goToWeek = (next: YearMonthDay, direction: SlideDirection): void => {
    setWeekSlideDirection(direction);
    setSelectedWeekStart(next);
    cancelSelection();
  };

  const handlePrevWeek = (): void => goToWeek(addDays(selectedWeekStart, -7), 'backward');
  const handleNextWeek = (): void => goToWeek(addDays(selectedWeekStart, 7), 'forward');

  const handleSelectWeek = (weekSunday: YearMonthDay): void => {
    if (isSameYmd(weekSunday, selectedWeekStart)) return;
    goToWeek(weekSunday, directionBetween(weekSunday, selectedWeekStart));
  };

  const goToMonth = (nextYear: number, nextMonth: number, direction: SlideDirection): void => {
    setMonthSlideDirection(direction);
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const handlePrevMonth = (): void => {
    if (viewMonth === 0) goToMonth(viewYear - 1, 11, 'backward');
    else goToMonth(viewYear, viewMonth - 1, 'backward');
  };

  const handleNextMonth = (): void => {
    if (viewMonth === 11) goToMonth(viewYear + 1, 0, 'forward');
    else goToMonth(viewYear, viewMonth + 1, 'forward');
  };

  const scrollToCurrentHour = (): void => {
    const container = gridScrollRef.current;
    if (!container) return;
    const targetTop = currentHour * SLOT_HEIGHT_PX - container.clientHeight / 2 + SLOT_HEIGHT_PX / 2;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  };

  const handleToday = (): void => {
    const currentWeekSunday = getSundayOfWeek(todayYmd);
    if (!isSameYmd(currentWeekSunday, selectedWeekStart)) {
      setWeekSlideDirection(directionBetween(currentWeekSunday, selectedWeekStart));
      setSelectedWeekStart(currentWeekSunday);
    }

    const currentMonthYmd: YearMonthDay = { year: todayYmd.year, monthIndex: todayYmd.monthIndex, day: 1 };
    const viewMonthYmd: YearMonthDay = { year: viewYear, monthIndex: viewMonth, day: 1 };
    if (!isSameYmd(currentMonthYmd, viewMonthYmd)) {
      setMonthSlideDirection(directionBetween(currentMonthYmd, viewMonthYmd));
      setViewYear(currentMonthYmd.year);
      setViewMonth(currentMonthYmd.monthIndex);
    }

    cancelSelection();
    scrollToCurrentHour();
  };

  const handleSlotClick = (day: number, hour: number): void => {
    if (isSlotDisabled(day, hour)) return;

    if (!startSlot) {
      setStartSlot({ day, hour });
      return;
    }

    const clickedIndex = getSlotIndex(day, hour);
    const startIndex = getSlotIndex(startSlot.day, startSlot.hour);

    if (clickedIndex === startIndex) {
      cancelSelection();
      return;
    }

    const minIndex = Math.min(startIndex, clickedIndex);
    const maxIndex = Math.max(startIndex, clickedIndex);
    const firstDay = Math.floor(minIndex / HOURS_COUNT);
    const lastDay = Math.floor(maxIndex / HOURS_COUNT);

    const newEvents: TeamsCalendarEvent[] = [];
    for (let d = firstDay; d <= lastDay; d++) {
      const dayStartHour = d === firstDay ? HOURS_START + (minIndex % HOURS_COUNT) : HOURS_START;
      const dayEndHour = d === lastDay ? HOURS_START + (maxIndex % HOURS_COUNT) : HOURS_END;
      bookedEventCounterRef.current += 1;
      newEvents.push({
        id: `booked-${bookedEventCounterRef.current}`,
        day: d,
        startHour: dayStartHour,
        endHour: dayEndHour,
        title: 'Booked Meeting',
        justCreated: true,
      });
    }

    setEvents((prev) => [...prev, ...newEvents]);
    cancelSelection();
  };

  return (
    <ModalSharedComponent isOpen={isOpen} onClose={onClose} sizeMode="adaptive">
      <div className="ta-teams-calendar-scope relative -m-5 sm:-m-6 h-[calc(100%+2.5rem)] sm:h-[calc(100%+3rem)] overflow-hidden rounded-2xl">
        <style>{`
          .ta-teams-calendar-scope ::-webkit-scrollbar { width: 6px; height: 6px; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-track { background: #141414; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-thumb { background: #333333; border-radius: 3px; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-thumb:hover { background: #444444; }
          @keyframes ta-slot-pulse {
            0%, 100% { box-shadow: inset 0 0 0 1.5px rgba(123, 131, 235, 0.85), 0 0 0 0 rgba(91, 95, 199, 0.35); }
            50% { box-shadow: inset 0 0 0 1.5px rgba(123, 131, 235, 1), 0 0 12px 1px rgba(91, 95, 199, 0.3); }
          }
          .ta-slot-start-active { animation: ta-slot-pulse 1.8s ease-in-out infinite; }
          @keyframes ta-event-pop-in {
            0% { opacity: 0; transform: scale(0.96); }
            100% { opacity: 1; transform: scale(1); }
          }
          .ta-booked-event-card { animation: ta-event-pop-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 z-30 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#292929] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex h-full w-full overflow-hidden font-sans text-[#f5f5f5] select-none">
          {/* BEGIN: LeftSidebar */}
          <aside className="w-[260px] flex-shrink-0 bg-[#141414] border-r border-[#2b2b2b] flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 pt-4 pb-3">
                <h1 className="text-xl font-bold text-white tracking-tight">Calendar</h1>
              </div>
              <div className="px-5 py-2">
                <div className="flex items-center justify-between mb-3 text-xs text-[#c8c8c8]">
                  <div className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <SlidingLabel slideKey={monthKey} direction={monthSlideDirection} className="font-semibold text-sm text-[#e1dfdd]">
                      {viewYear} {MONTH_NAMES[viewMonth]}
                    </SlidingLabel>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <button type="button" onClick={handlePrevMonth} aria-label="Previous month" className="hover:text-white p-0.5 cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </button>
                    <button type="button" onClick={handleNextMonth} aria-label="Next month" className="hover:text-white p-0.5 cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] grid grid-cols-7 gap-y-1 text-center font-normal text-[#979797] mb-1">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>

                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={monthSlideDirection} initial={false}>
                    <motion.div
                      key={monthKey}
                      custom={monthSlideDirection}
                      variants={SLIDE_VARIANTS}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex flex-col"
                    >
                      {weeksMatrix.map((week, weekIndex) => {
                        const weekSunday = week[0];
                        const isSelectedWeek = isSameYmd(weekSunday, selectedWeekStart);
                        return (
                          <div
                            key={weekIndex}
                            onClick={() => handleSelectWeek(weekSunday)}
                            className="relative grid grid-cols-7 text-[11px] text-center font-normal rounded-full my-0.5 cursor-pointer hover:bg-[#1c1c1c] transition-colors"
                          >
                            {isSelectedWeek && (
                              <motion.div
                                layoutId="ta-week-highlight-pill"
                                className="absolute inset-0 bg-[#28273b] rounded-full"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              />
                            )}
                            {week.map((cell, dayIndex) => {
                              const isToday = isSameYmd(cell, todayYmd);
                              const isCurrentMonth = cell.monthIndex === viewMonth && cell.year === viewYear;
                              const textClassName = isToday
                                ? 'bg-[#5b5fc7] text-white font-medium'
                                : isCurrentMonth
                                ? isSelectedWeek
                                  ? 'text-white'
                                  : 'text-[#d6d6d6]'
                                : 'text-[#979797]';
                              return (
                                <span
                                  key={dayIndex}
                                  className={`relative h-6 flex items-center justify-center rounded-full ${textClassName}`}
                                >
                                  {cell.day}
                                </span>
                              );
                            })}
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-center mt-2 mb-1">
                  <svg className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div className="h-px bg-[#2b2b2b] mx-3 my-1" />
            </div>
          </aside>
          {/* END: LeftSidebar */}

          {/* BEGIN: MainContentArea */}
          <main className="flex-1 flex flex-col h-full bg-[#141414] overflow-hidden">
            {/* BEGIN: TopActionBar */}
            <header className="h-12 border-b border-[#2b2b2b] flex items-center justify-between px-3 text-xs text-[#c8c8c8]">
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded hover:bg-[#292929] text-gray-300 hover:text-white transition-colors" title="Toggle sidebar">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    <rect fill="none" height="16" rx="2" strokeWidth="1.8" width="18" x="3" y="4" />
                    <line strokeWidth="1.8" x1="9" x2="9" y1="4" y2="20" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-[#2b2b2b] hover:bg-[#292929] text-[#e1dfdd] transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect height="18" rx="2" strokeWidth="2" width="18" x="3" y="4" />
                    <line strokeWidth="2" x1="16" x2="16" y1="2" y2="6" />
                    <line strokeWidth="2" x1="8" x2="8" y1="2" y2="6" />
                    <line strokeWidth="2" x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <span className="font-normal text-xs">Today</span>
                </button>
                <div className="flex items-center space-x-0.5">
                  <button type="button" onClick={handlePrevWeek} aria-label="Previous week" className="p-1.5 rounded hover:bg-[#292929] text-gray-400 hover:text-white cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                  <button type="button" onClick={handleNextWeek} aria-label="Next week" className="p-1.5 rounded hover:bg-[#292929] text-gray-400 hover:text-white cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-1 pl-1 cursor-pointer hover:bg-[#292929] py-1 px-2 rounded">
                  <SlidingLabel slideKey={weekKey} direction={weekSlideDirection} className="font-semibold text-white text-xs">
                    {weekRangeLabel}
                  </SlidingLabel>
                  <svg className="w-3.5 h-3.5 text-gray-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </header>
            {/* END: TopActionBar */}

            {/* BEGIN: CalendarGridContainer */}
            <div ref={gridScrollRef} className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-[#141414]">
              <div className="flex border-b border-[#2b2b2b] sticky top-0 bg-[#141414] z-20">
                <div className="w-12 flex-shrink-0 border-r border-[#2b2b2b]" />
                <AnimatePresence mode="wait" custom={weekSlideDirection} initial={false}>
                  <motion.div
                    key={weekKey}
                    custom={weekSlideDirection}
                    variants={SLIDE_VARIANTS}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-1"
                  >
                    {weekDays.map((weekDay, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`flex-1 min-w-0 border-r border-[#2b2b2b] px-3 py-2 flex items-center justify-between ${
                          weekDay.isWeekend ? 'bg-[#1a1a1a]' : ''
                        }`}
                      >
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-xl font-normal text-[#5b9bd5]">{weekDay.day}</span>
                          <span className="text-xs text-[#979797]">{weekDay.weekdayAbbreviation}</span>
                        </div>
                        {!weekDay.isWeekend && <OfficeBuildingIcon className="w-3.5 h-3.5 text-[#7070b8]" />}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-1 relative min-h-[2304px]">
                <div className="w-12 flex-shrink-0 flex flex-col text-right text-[11px] text-[#979797] border-r border-[#2b2b2b] select-none">
                  {HOUR_ROWS.map((hour) => (
                    <div key={hour} className="h-24 pr-2 pt-1 border-b border-[#2b2b2b]">{formatHourLabel12(hour)}</div>
                  ))}
                </div>

                <AnimatePresence mode="wait" custom={weekSlideDirection} initial={false}>
                  <motion.div
                    key={weekKey}
                    custom={weekSlideDirection}
                    variants={SLIDE_VARIANTS}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-1"
                  >
                    {weekDays.map((weekDay, dayIndex) => {
                      const dayEvents = events.filter((ev) => ev.day === dayIndex);
                      return (
                        <div
                          key={dayIndex}
                          className={`flex-1 border-r border-[#2b2b2b] relative ${weekDay.isWeekend ? 'bg-[#1a1a1a]' : ''}`}
                        >
                          {HOUR_ROWS.map((hour) => {
                            const disabled = isSlotDisabled(dayIndex, hour);
                            const index = getSlotIndex(dayIndex, hour);
                            const isStart = !disabled && startSlot?.day === dayIndex && startSlot?.hour === hour;
                            const inPreview =
                              !disabled && !isStart && previewRange !== null && index >= previewRange.lo && index <= previewRange.hi;

                            let slotClassName = 'h-24 border-b border-[#2b2b2b] relative transition-colors duration-150';
                            if (disabled) {
                              slotClassName += ' bg-[#101010] cursor-not-allowed';
                            } else if (isStart) {
                              slotClassName += ' cursor-pointer bg-[rgba(91,95,199,0.28)] ta-slot-start-active z-[5]';
                            } else if (inPreview) {
                              slotClassName += ' cursor-pointer bg-[rgba(91,95,199,0.22)] shadow-[inset_0_0_0_1px_rgba(123,131,235,0.45)]';
                            } else {
                              slotClassName += ' cursor-pointer hover:bg-[rgba(91,95,199,0.12)]';
                            }

                            return (
                              <div
                                key={hour}
                                className={slotClassName}
                                onClick={() => handleSlotClick(dayIndex, hour)}
                                onMouseEnter={() => {
                                  if (!disabled) setHoverSlot({ day: dayIndex, hour });
                                }}
                              >
                                {isStart && (
                                  <span className="absolute top-1 right-1.5 bg-[#5b5fc7] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide pointer-events-none shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                                    Start
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {dayEvents.map((ev) => {
                            const topPx = (ev.startHour - HOURS_START) * SLOT_HEIGHT_PX + 4;
                            const heightPx = (ev.endHour - ev.startHour + 1) * SLOT_HEIGHT_PX - 8;

                            return (
                              <div
                                key={ev.id}
                                style={{ top: topPx, height: heightPx }}
                                className={`absolute inset-x-1 bg-[#3d375a] border border-[#5b5fc7]/50 rounded cursor-pointer overflow-hidden flex shadow-sm hover:brightness-110 transition-all z-10 ${ev.justCreated ? 'ta-booked-event-card' : ''}`}
                              >
                                <div className="w-1 flex-shrink-0 bg-[#7b83eb]" />
                                <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden">
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="text-xs font-semibold text-white truncate leading-tight">{ev.title}</span>
                                    <span className="text-[10px] font-medium text-[#c8c8c8] bg-[#464775] px-1.5 py-0.5 rounded flex-shrink-0">
                                      {formatHourLabel12(ev.startHour)} – {formatHourLabel12(ev.endHour + 1)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-[11px] text-[#c8c8c8] truncate leading-tight">
                                    <span className="truncate">Microsoft Teams</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            {/* END: CalendarGridContainer */}
          </main>
          {/* END: MainContentArea */}
        </div>
      </div>
    </ModalSharedComponent>
  );
}
