import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ContextMenuSharedComponent, { type ContextMenuItem } from '../../../Shared/Components/ContextMenuSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import { EnvironmentUptimeRequestStatusEnumModel } from '../../../Models/EnvironmentUptimeRequestStatusEnumModel';
import CalendarBookingConversionHelper from '../Helpers/CalendarBookingConversionHelper';
import EnvironmentUptimeRequestDetailModalController from './EnvironmentUptimeRequestDetailModalController';
import DowntimeAnnouncementDetailModalController from './DowntimeAnnouncementDetailModalController';

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

// Originally a static 1:1 port of PLMInfrastructureRegisterAgentDocumentationNMSC/UI_HTML/
// CALENDAR_MODAL_VIEW.html (a Microsoft Teams Calendar mockup). Now: a continuously horizontally-
// scrollable 5-week grid (current week through 4 weeks ahead), a mini-calendar synced live to
// scroll position, working jump controls (arrows/row-clicks/Today), a past-date/time booking
// guard, real existing uptime-request/downtime bookings rendered as event cards (polling every 15s
// while open), click-for-details on those, a right-click "Delete" scoped to only the viewer's own
// in-progress pick, and that pick fully controlled by the outer form's own fromAt/toAt/
// onFromChange/onToChange props - see specs/009-calendar-backend-integration.

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

const WEEK_COUNT = 5; // current week + 4 more (spec.md FR-001/FR-003)
const DAY_COUNT = WEEK_COUNT * 7; // 35

// Literal, non-interpolated classes only - Tailwind's JIT scanner can't see a
// template-built `bg-[${hex}]` string (research.md §1, 010-calendar-status-colors).
const BOOKING_STATUS_CARD_STYLES: Record<string, { card: string; stripe: string; pill: string }> = {
  [EnvironmentUptimeRequestStatusEnumModel.Pending]: {
    card: 'bg-[#ffa826] border border-[#ffa826]/50',
    stripe: 'bg-[#ffcf88]',
    pill: 'bg-[#8c5c15]',
  },
  [EnvironmentUptimeRequestStatusEnumModel.Approved]: {
    card: 'bg-[#26acff] border border-[#26acff]/50',
    stripe: 'bg-[#88d1ff]',
    pill: 'bg-[#155f8c]',
  },
  [EnvironmentUptimeRequestStatusEnumModel.Completed]: {
    card: 'bg-[#29d944] border border-[#29d944]/50',
    stripe: 'bg-[#89ea98]',
    pill: 'bg-[#177725]',
  },
};

// Sidebar legend (research.md / grill-me, same session as the solid teal in-progress
// card recolor) - one row per distinct color shown on the grid, swatch = each type's own
// card background, so it reads the same as what's painted on the events themselves.
const CALENDAR_LEGEND_ITEMS: { label: string; swatchClassName: string }[] = [
  { label: 'Pending', swatchClassName: 'bg-[#ffa826]' },
  { label: 'Approved', swatchClassName: 'bg-[#26acff]' },
  { label: 'Completed', swatchClassName: 'bg-[#29d944]' },
  { label: 'Downtime', swatchClassName: 'bg-[#5a2323]' },
  { label: 'Booked Meeting', swatchClassName: 'bg-[#008eb8]' },
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
// 'backward' = earlier (slides in from the left); null = no transition - see research.md
// (008-calendar-scrollable-weeks) §7 for what this still drives now that the main grid itself no
// longer slides (the mini-calendar's month-view and highlight-pill, and the header's date-range
// label text, still do).
type SlideDirection = 'forward' | 'backward' | null;

function directionBetween(next: YearMonthDay, prev: YearMonthDay): SlideDirection {
  const diff = toDate(next).getTime() - toDate(prev).getTime();
  if (diff > 0) return 'forward';
  if (diff < 0) return 'backward';
  return null;
}

// Shared directional slide recipe - same "custom direction drives initial/animate/exit" pattern
// already used by ModalSharedComponent's own modalVariants.
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

export interface WeekDay extends YearMonthDay {
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

// 'inProgress' = the viewer's own not-yet-submitted pick (derived from the
// fromAt/toAt props, never stored locally - research.md §9); 'uptimeRequest'/
// 'downtime' = real backend data (research.md §6).
export type CalendarEventSourceType = 'inProgress' | 'uptimeRequest' | 'downtime';

export interface TeamsCalendarEvent {
  id: string;
  day: number; // absolute index into AllDays (0-34), not a per-week index
  startHour: number;
  endHour: number; // inclusive
  title: string;
  justCreated?: boolean;
  source: CalendarEventSourceType;
  backendId?: string; // present only when source !== 'inProgress'
  status?: EnvironmentUptimeRequestStatusEnumModel; // present only when source === 'uptimeRequest', populated from the originating request's own status
  requesterName?: string; // present only when source === 'uptimeRequest', populated from the originating request's own requesterName
  message?: string; // present only when source === 'uptimeRequest' and the originating request has a non-empty message
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
  environment,
  fromAt,
  toAt,
  onFromChange,
  onToChange,
}: EnvironmentUptimeRequestAvailabilityModalControllerProps): React.JSX.Element {
  // Recomputed fresh every render (not memoized once) - re-evaluates "on render/interaction, not a
  // live per-second timer", so a plain value here (refreshed on every open/interaction-driven
  // re-render) is exactly right - memoizing with `[]` would go stale if the modal stayed
  // mounted-but-closed across a day boundary.
  const now = new Date();
  const todayYmd = toYmd(now);
  const currentHour = now.getHours();

  // The fixed, always-fully-rendered 5-week range (data-model.md's AllDays) - index 0 is always
  // the current week's Sunday, even when that's before today; nothing about what renders here
  // ever changes while the modal is open, only which week is "leading" (below) does.
  const allDays: WeekDay[] = Array.from({ length: DAY_COUNT }, (_, i) => {
    const ymd = addDays(getSundayOfWeek(todayYmd), i);
    const dayOfWeekIndex = i % 7;
    return { ...ymd, weekdayAbbreviation: WEEKDAY_ABBREVIATIONS[dayOfWeekIndex], isWeekend: dayOfWeekIndex === 0 || dayOfWeekIndex === 6 };
  });

  const [viewYear, setViewYear] = useState<number>(todayYmd.year);
  const [viewMonth, setViewMonth] = useState<number>(todayYmd.monthIndex);
  // Which of the 5 weeks is currently "leading" (data-model.md's LeadingWeekIndex) - a derived
  // display/sync concern now, not a rendering input: updated by scroll position (primarily) and by
  // jump actions (whose own scrollTo calls the same scroll listener picks up).
  const [leadingWeekIndex, setLeadingWeekIndex] = useState<number>(0);
  const [weekSlideDirection, setWeekSlideDirection] = useState<SlideDirection>(null);
  const [monthSlideDirection, setMonthSlideDirection] = useState<SlideDirection>(null);

  const [startSlot, setStartSlot] = useState<{ day: number; hour: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ day: number; hour: number } | null>(null);
  const gridScrollRef = useRef<HTMLDivElement | null>(null);

  const cancelSelection = (): void => {
    setStartSlot(null);
    setHoverSlot(null);
  };

  // The calendar's own fixed 5-week visible range, as a real Date span for
  // querying existing bookings/downtime - the day AFTER the last visible day
  // so the entire last day is included, not just its midnight instant.
  const visibleRangeStart = toDate(allDays[0]);
  const visibleRangeEnd = toDate(addDays(allDays[allDays.length - 1], 1));

  const environmentUptimeRequestsForEnvironmentQuery =
    TanstackQueryClientService.current.environmentUptimeRequests.useEnvironmentUptimeRequestsForEnvironmentQuery(
      environment,
      visibleRangeStart,
      visibleRangeEnd,
      isOpen
    );

  const downtimeAnnouncementsInRangeQuery =
    TanstackQueryClientService.current.downtimeAnnouncements.useDowntimeAnnouncementsInRangeQuery(
      visibleRangeStart,
      visibleRangeEnd,
      isOpen
    );

  useEffect(() => {
    if (environmentUptimeRequestsForEnvironmentQuery.isError) {
      toast.error('Could not load existing uptime requests', {
        description: "You can still pick a time for this ticket - existing bookings just might not all show.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentUptimeRequestsForEnvironmentQuery.isError]);

  useEffect(() => {
    if (downtimeAnnouncementsInRangeQuery.isError) {
      toast.error('Could not load downtime announcements', {
        description: "You can still pick a time for this ticket - scheduled downtime just might not all show.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downtimeAnnouncementsInRangeQuery.isError]);

  // The in-progress pick is fully derived from the outer form's own
  // fromAt/toAt props - never stored locally. This single mechanism covers
  // showing a previously-picked span on reopen, reacting to the outer form's
  // own reset after a successful submit, and reacting to the right-click
  // "Delete" action below, all through the same one data flow (research.md
  // §9 / data-model.md).
  const parsedPickFromAt = fromAt ? CalendarBookingConversionHelper.current.parseNaiveDateTime(fromAt) : null;
  const parsedPickToAt = toAt ? CalendarBookingConversionHelper.current.parseNaiveDateTime(toAt) : null;
  const inProgressEvents: TeamsCalendarEvent[] =
    parsedPickFromAt && parsedPickToAt
      ? CalendarBookingConversionHelper.current.convertRangeToEvents(
          parsedPickFromAt,
          parsedPickToAt,
          allDays,
          'Booked Meeting',
          'inProgress'
        )
      : [];

  const realUptimeEvents: TeamsCalendarEvent[] = (environmentUptimeRequestsForEnvironmentQuery.data ?? [])
    .filter(
      (request) =>
        request.status === EnvironmentUptimeRequestStatusEnumModel.Pending ||
        request.status === EnvironmentUptimeRequestStatusEnumModel.Approved ||
        request.status === EnvironmentUptimeRequestStatusEnumModel.Completed
    )
    .flatMap((request) =>
      CalendarBookingConversionHelper.current.convertRangeToEvents(
        CalendarBookingConversionHelper.current.convertUtcToCetWallClockDate(request.fromAt),
        CalendarBookingConversionHelper.current.convertUtcToCetWallClockDate(request.toAt),
        allDays,
        request.environment,
        'uptimeRequest',
        request.id
      ).map((event) => ({
        ...event,
        status: request.status,
        requesterName: request.requesterName,
        message: request.message ?? undefined,
      }))
    );

  const realDowntimeEvents: TeamsCalendarEvent[] = (downtimeAnnouncementsInRangeQuery.data ?? [])
    .filter((announcement) => announcement.environments.includes(environment))
    .flatMap((announcement) =>
      CalendarBookingConversionHelper.current.convertRangeToEvents(
        CalendarBookingConversionHelper.current.convertUtcToCetWallClockDate(announcement.startAt),
        CalendarBookingConversionHelper.current.convertUtcToCetWallClockDate(announcement.endAt),
        allDays,
        announcement.heading,
        'downtime',
        announcement.id
      )
    );

  const events: TeamsCalendarEvent[] = [...inProgressEvents, ...realUptimeEvents, ...realDowntimeEvents];

  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  const handleCloseContextMenu = (): void => {
    setContextMenu((previous) => ({ ...previous, isOpen: false }));
  };

  // Only the viewer's own in-progress pick ever offers this menu (FR-008/
  // FR-010); choosing "Delete" clears the outer form's own fromAt/toAt
  // (FR-016) - since the in-progress card is derived entirely from those
  // props, clearing them is the complete removal, with no backend call
  // (FR-009).
  const handleInProgressEventContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault();
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
  };

  // Real, already-submitted cards never show the custom menu - just suppress
  // the browser's own native one, which would otherwise look broken popping
  // up inside this modal (research.md §5 / FR-010).
  const handleRealEventContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault();
  };

  const handleDeleteInProgressPick = (): void => {
    onFromChange('');
    onToChange('');
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      isDestructive: true,
      onClick: handleDeleteInProgressPick,
    },
  ];

  const [selectedUptimeRequestId, setSelectedUptimeRequestId] = useState<string | null>(null);
  const [selectedDowntimeAnnouncementId, setSelectedDowntimeAnnouncementId] = useState<string | null>(null);

  const selectedUptimeRequest = selectedUptimeRequestId
    ? (environmentUptimeRequestsForEnvironmentQuery.data ?? []).find((request) => request.id === selectedUptimeRequestId) ?? null
    : null;

  const selectedDowntimeAnnouncement = selectedDowntimeAnnouncementId
    ? (downtimeAnnouncementsInRangeQuery.data ?? []).find((announcement) => announcement.id === selectedDowntimeAnnouncementId) ?? null
    : null;

  // Only real, already-submitted cards open a details modal (FR-005/FR-007) -
  // the in-progress pick has no backend record to show details for.
  const handleEventCardClick = (ev: TeamsCalendarEvent): void => {
    if (ev.source === 'uptimeRequest' && ev.backendId) setSelectedUptimeRequestId(ev.backendId);
    if (ev.source === 'downtime' && ev.backendId) setSelectedDowntimeAnnouncementId(ev.backendId);
  };

  const computeCurrentHourScrollTop = (container: HTMLDivElement): number => {
    const targetTop = currentHour * SLOT_HEIGHT_PX - container.clientHeight / 2 + SLOT_HEIGHT_PX / 2;
    return Math.max(0, targetTop);
  };

  useEffect(() => {
    if (!isOpen) {
      cancelSelection();
      return;
    }

    // Every time the modal opens, snap back to "now": today's week index (0, always - the fixed
    // range always starts there), the mini-calendar's month, then scroll both axes so the current
    // week is flush left and the current hour is already in view - the same reset handleToday
    // performs, minus the slide animation (this is the modal's very first paint, not a navigation
    // the user should see animate).
    setViewYear(todayYmd.year);
    setViewMonth(todayYmd.monthIndex);
    setLeadingWeekIndex(0);

    const frame = requestAnimationFrame(() => {
      const container = gridScrollRef.current;
      if (!container) return;
      container.scrollTo({ left: 0, top: computeCurrentHourScrollTop(container), behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && startSlot) cancelSelection();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, startSlot]);

  const leadingWeekDays = allDays.slice(leadingWeekIndex * 7, leadingWeekIndex * 7 + 7);

  // Mini-calendar follows the main grid's leading week across a month boundary (FR-006) - but
  // deliberately depends only on the numeric leadingWeekIndex (stable identity), not on the
  // derived leadingWeekDays array (a fresh object every render) or viewYear/viewMonth themselves,
  // so the mini-calendar's own independent month browsing (FR-009) never gets fought/reset by it.
  useEffect(() => {
    const weekMonthYmd: YearMonthDay = { year: leadingWeekDays[0].year, monthIndex: leadingWeekDays[0].monthIndex, day: 1 };
    const currentViewYmd: YearMonthDay = { year: viewYear, monthIndex: viewMonth, day: 1 };
    if (!isSameYmd(weekMonthYmd, currentViewYmd)) {
      setMonthSlideDirection(directionBetween(weekMonthYmd, currentViewYmd));
      setViewYear(weekMonthYmd.year);
      setViewMonth(weekMonthYmd.monthIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadingWeekIndex]);

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

  const weekRangeLabel = useMemo(() => formatWeekRangeLabel(leadingWeekDays[0], leadingWeekDays[6]), [leadingWeekDays]);
  const weekKey = `${leadingWeekDays[0].year}-${leadingWeekDays[0].monthIndex}-${leadingWeekDays[0].day}`;
  const monthKey = `${viewYear}-${viewMonth}`;

  const previewRange = useMemo(() => {
    if (!startSlot || !hoverSlot) return null;
    const startIndex = getSlotIndex(startSlot.day, startSlot.hour);
    const hoverIndex = getSlotIndex(hoverSlot.day, hoverSlot.hour);
    return { lo: Math.min(startIndex, hoverIndex), hi: Math.max(startIndex, hoverIndex) };
  }, [startSlot, hoverSlot]);

  // A slot is unselectable when its day is before today, or it's today and at-or-before the
  // current hour (the earliest selectable hour on today is `currentHour + 1`) - unchanged rule,
  // now indexed across the full 0-34 range instead of 0-6.
  const isSlotDisabled = (dayIndex: number, hour: number): boolean => {
    const day = allDays[dayIndex];
    const dayDiff = toDate(day).getTime() - toDate(todayYmd).getTime();
    if (dayDiff < 0) return true;
    if (dayDiff > 0) return false;
    return hour <= currentHour;
  };

  // Scrolls the shared container so the given week index (0-4) sits flush against the left edge -
  // used by every jump control (research.md §5). Only ever sets `left`, leaving the current
  // vertical scroll position untouched (matches the prior arrows' behavior of never touching
  // vertical scroll).
  const scrollToWeekIndex = (targetIndex: number): void => {
    const container = gridScrollRef.current;
    if (!container) return;
    const clampedIndex = Math.max(0, Math.min(WEEK_COUNT - 1, targetIndex));
    container.scrollTo({ left: clampedIndex * container.clientWidth, behavior: 'smooth' });
  };

  const handlePrevWeek = (): void => {
    scrollToWeekIndex(leadingWeekIndex - 1);
    cancelSelection();
  };

  const handleNextWeek = (): void => {
    scrollToWeekIndex(leadingWeekIndex + 1);
    cancelSelection();
  };

  // A row click for a week outside the fixed 0-4 range (reachable only via the mini-calendar's own
  // unrestricted past - or future-beyond-range - browsing) is a no-op on the main grid, since that
  // week simply isn't part of its scrollable content (research.md §8).
  const handleSelectWeek = (weekSunday: YearMonthDay): void => {
    const diffDays = Math.round((toDate(weekSunday).getTime() - toDate(allDays[0]).getTime()) / 86400000);
    const targetIndex = diffDays / 7;
    if (targetIndex < 0 || targetIndex > WEEK_COUNT - 1) return;
    scrollToWeekIndex(targetIndex);
    cancelSelection();
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

  // Computes the leading week (data-model.md's LeadingWeekIndex) from live scroll position -
  // research.md §4: the smallest week index whose Sunday column still has any pixel on screen.
  // Fires on every native scroll event (manual drag/wheel AND a jump's own programmatic smooth
  // scroll alike), only updating state when the computed index actually changes.
  const handleGridScroll = (): void => {
    const container = gridScrollRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth;
    if (containerWidth <= 0) return;
    const columnWidth = containerWidth / 7;
    const scrollLeft = container.scrollLeft;

    let nextIndex = WEEK_COUNT - 1;
    for (let i = 0; i < WEEK_COUNT; i++) {
      if (scrollLeft < i * containerWidth + columnWidth) {
        nextIndex = i;
        break;
      }
    }

    if (nextIndex !== leadingWeekIndex) {
      setWeekSlideDirection(nextIndex > leadingWeekIndex ? 'forward' : 'backward');
      setLeadingWeekIndex(nextIndex);
    }
  };

  const handleToday = (): void => {
    cancelSelection();
    const container = gridScrollRef.current;
    if (!container) return;
    container.scrollTo({ left: 0, top: computeCurrentHourScrollTop(container), behavior: 'smooth' });
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
    const firstDayStartHour = HOURS_START + (minIndex % HOURS_COUNT);
    const lastDayEndHour = HOURS_START + (maxIndex % HOURS_COUNT);

    // Reports the completed span upward to the outer form (FR-014) instead of
    // tracking it in any local state - the in-progress card then renders
    // because it's derived from those same props (research.md §9).
    const { fromAt: nextFromAt, toAt: nextToAt } = CalendarBookingConversionHelper.current.convertPickToDateTimeStrings(
      firstDay,
      firstDayStartHour,
      lastDay,
      lastDayEndHour,
      allDays
    );
    onFromChange(nextFromAt);
    onToChange(nextToAt);
    cancelSelection();
  };

  return (
    <ModalSharedComponent isOpen={isOpen} onClose={onClose} sizeMode="adaptive">
      <div className="ta-teams-calendar-scope relative -m-5 sm:-m-6 h-[calc(100%+2.5rem)] sm:h-[calc(100%+3rem)] overflow-hidden rounded-2xl">
        <style>{`
          .ta-teams-calendar-scope ::-webkit-scrollbar { width: 6px; height: 6px; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-track { background: #f1f5f9; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          .dark .ta-teams-calendar-scope ::-webkit-scrollbar-track { background: #141414; }
          .dark .ta-teams-calendar-scope ::-webkit-scrollbar-thumb { background: #333333; }
          .dark .ta-teams-calendar-scope ::-webkit-scrollbar-thumb:hover { background: #444444; }
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
          className="absolute top-2.5 right-2.5 z-30 p-1.5 rounded-lg text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#292929] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex h-full w-full overflow-hidden font-sans text-slate-900 dark:text-[#f5f5f5] select-none">
          {/* BEGIN: LeftSidebar */}
          <aside className="w-[260px] flex-shrink-0 bg-white dark:bg-[#141414] border-r border-slate-200 dark:border-[#2b2b2b] flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="px-5 pt-4 pb-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Calendar</h1>
              </div>
              <div className="px-5 py-2">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-[#c8c8c8]">
                  <div className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <SlidingLabel slideKey={monthKey} direction={monthSlideDirection} className="font-semibold text-sm text-slate-700 dark:text-[#e1dfdd]">
                      {viewYear} {MONTH_NAMES[viewMonth]}
                    </SlidingLabel>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <button type="button" onClick={handlePrevMonth} aria-label="Previous month" className="hover:text-slate-900 dark:hover:text-white p-0.5 cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </button>
                    <button type="button" onClick={handleNextMonth} aria-label="Next month" className="hover:text-slate-900 dark:hover:text-white p-0.5 cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] grid grid-cols-7 gap-y-1 text-center font-normal text-slate-400 dark:text-[#979797] mb-1">
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
                        const isSelectedWeek = isSameYmd(weekSunday, leadingWeekDays[0]);
                        return (
                          <div
                            key={weekIndex}
                            onClick={() => handleSelectWeek(weekSunday)}
                            className="relative grid grid-cols-7 text-[11px] text-center font-normal rounded-full my-0.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1c1c1c] transition-colors"
                          >
                            {isSelectedWeek && (
                              <motion.div
                                layoutId="ta-week-highlight-pill"
                                className="absolute inset-0 bg-indigo-50 dark:bg-[#28273b] rounded-full"
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
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-600 dark:text-[#d6d6d6]'
                                : 'text-slate-400 dark:text-[#979797]';
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
                  <svg className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-slate-900 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div className="h-px bg-slate-200 dark:bg-[#2b2b2b] mx-3 my-1" />

              <div className="px-5 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#979797] mb-2">
                  Legend
                </div>
                <div className="flex flex-col space-y-1.5">
                  {CALENDAR_LEGEND_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${item.swatchClassName}`} />
                      <span className="text-xs text-slate-600 dark:text-[#c8c8c8]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          {/* END: LeftSidebar */}

          {/* BEGIN: MainContentArea */}
          <main className="flex-1 flex flex-col h-full bg-white dark:bg-[#141414] overflow-hidden">
            {/* BEGIN: TopActionBar */}
            <header className="h-12 border-b border-slate-200 dark:border-[#2b2b2b] flex items-center justify-between px-3 text-xs text-slate-500 dark:text-[#c8c8c8]">
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#292929] text-gray-400 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors" title="Toggle sidebar">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    <rect fill="none" height="16" rx="2" strokeWidth="1.8" width="18" x="3" y="4" />
                    <line strokeWidth="1.8" x1="9" x2="9" y1="4" y2="20" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-[#2b2b2b] hover:bg-slate-100 dark:hover:bg-[#292929] text-slate-700 dark:text-[#e1dfdd] transition-colors cursor-pointer"
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
                  <button type="button" onClick={handlePrevWeek} aria-label="Previous week" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#292929] text-gray-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                  <button type="button" onClick={handleNextWeek} aria-label="Next week" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#292929] text-gray-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-1 pl-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#292929] py-1 px-2 rounded">
                  <SlidingLabel slideKey={weekKey} direction={weekSlideDirection} className="font-semibold text-slate-900 dark:text-white text-xs">
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
            <div
              ref={gridScrollRef}
              onScroll={handleGridScroll}
              className="flex-1 flex flex-col overflow-y-auto overflow-x-auto relative bg-white dark:bg-[#141414]"
            >
              <div className="flex border-b border-slate-200 dark:border-[#2b2b2b] sticky top-0 bg-white dark:bg-[#141414] z-20">
                <div className="w-12 flex-shrink-0 border-r border-slate-200 dark:border-[#2b2b2b] sticky left-0 bg-white dark:bg-[#141414] z-30" />
                <div className="flex flex-shrink-0 w-[500%]">
                  {allDays.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`flex-1 min-w-0 border-r border-slate-200 dark:border-[#2b2b2b] px-3 py-2 flex items-center justify-between ${
                        day.isWeekend ? 'bg-slate-50 dark:bg-[#1a1a1a]' : ''
                      }`}
                    >
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-xl font-normal text-[#5b9bd5]">{day.day}</span>
                        <span className="text-xs text-slate-400 dark:text-[#979797]">{day.weekdayAbbreviation}</span>
                      </div>
                      {!day.isWeekend && <OfficeBuildingIcon className="w-3.5 h-3.5 text-[#7070b8]" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 relative min-h-[2304px]">
                <div className="w-12 flex-shrink-0 flex flex-col text-right text-[11px] text-slate-400 dark:text-[#979797] border-r border-slate-200 dark:border-[#2b2b2b] select-none sticky left-0 bg-white dark:bg-[#141414] z-20">
                  {HOUR_ROWS.map((hour) => (
                    <div key={hour} className="h-24 pr-2 pt-1 border-b border-slate-200 dark:border-[#2b2b2b]">{formatHourLabel12(hour)}</div>
                  ))}
                </div>

                <div className="flex flex-shrink-0 w-[500%]">
                  {allDays.map((day, dayIndex) => {
                    const dayEvents = events.filter((ev) => ev.day === dayIndex);
                    const isToday = isSameYmd(day, todayYmd);
                    return (
                      <div
                        key={dayIndex}
                        className={`flex-1 border-r border-slate-200 dark:border-[#2b2b2b] relative ${day.isWeekend ? 'bg-slate-50 dark:bg-[#1a1a1a]' : ''}`}
                      >
                        {HOUR_ROWS.map((hour) => {
                          const disabled = isSlotDisabled(dayIndex, hour);
                          const isCurrentTimeCell = isToday && hour === currentHour;
                          const index = getSlotIndex(dayIndex, hour);
                          const isStart = !disabled && startSlot?.day === dayIndex && startSlot?.hour === hour;
                          const inPreview =
                            !disabled && !isStart && previewRange !== null && index >= previewRange.lo && index <= previewRange.hi;

                          let slotClassName = 'h-24 border-b border-slate-200 dark:border-[#2b2b2b] relative transition-colors duration-150';
                          if (disabled) {
                            slotClassName += ' bg-slate-100 dark:bg-[#101010] cursor-not-allowed';
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
                              title={disabled ? 'This time has already passed' : undefined}
                              onClick={() => handleSlotClick(dayIndex, hour)}
                              onMouseEnter={() => {
                                if (!disabled) setHoverSlot({ day: dayIndex, hour });
                              }}
                            >
                              {isToday && (
                                <div className="absolute inset-0 pointer-events-none bg-[rgba(91,95,199,0.08)]" />
                              )}
                              {isCurrentTimeCell && (
                                <div className="absolute inset-0 pointer-events-none bg-[rgba(91,95,199,0.18)]" />
                              )}
                              {disabled && (
                                <Lock className="absolute inset-0 m-auto w-3 h-3 text-slate-400/60 dark:text-[#5c5c5c]/60 pointer-events-none" />
                              )}
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
                          const isDowntime = ev.source === 'downtime';
                          const isRealBooking = ev.source === 'uptimeRequest' || ev.source === 'downtime';
                          const cardColors = isDowntime
                            ? { card: 'bg-[#5a2323] border border-[#e35b5b]/50', stripe: 'bg-[#e35b5b]', pill: 'bg-[#7a3232]' }
                            : (ev.source === 'uptimeRequest' && ev.status && BOOKING_STATUS_CARD_STYLES[ev.status]) ||
                              { card: 'bg-[#008eb8] border border-[#006a89]', stripe: 'bg-[#006a89]', pill: 'bg-[#004a60]' };

                          return (
                            <div
                              key={ev.id}
                              style={{ top: topPx, height: heightPx }}
                              onClick={isRealBooking ? () => handleEventCardClick(ev) : undefined}
                              onContextMenu={ev.source === 'inProgress' ? handleInProgressEventContextMenu : handleRealEventContextMenu}
                              className={`absolute inset-x-1 rounded overflow-hidden flex shadow-sm hover:brightness-110 transition-all z-10 ${
                                cardColors.card
                              } ${isRealBooking ? 'cursor-pointer' : ''} ${ev.source === 'inProgress' ? 'ta-booked-event-card' : ''}`}
                            >
                              <div className={`w-1 flex-shrink-0 ${cardColors.stripe}`} />
                              <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden">
                                <div className="flex items-start justify-between gap-1">
                                  <span className="text-xs font-semibold text-white truncate leading-tight">{ev.title}</span>
                                  <span
                                    className={`text-[10px] font-medium text-[#c8c8c8] px-1.5 py-0.5 rounded flex-shrink-0 ${cardColors.pill}`}
                                  >
                                    {formatHourLabel12(ev.startHour)} – {formatHourLabel12(ev.endHour + 1)}
                                  </span>
                                </div>
                                {ev.source === 'uptimeRequest' && ev.message && (
                                  <div className="text-[11px] text-[#c8c8c8] italic leading-tight line-clamp-2">
                                    {ev.message}
                                  </div>
                                )}
                                {(isDowntime || ev.requesterName) && (
                                  <div className="flex items-center text-[11px] text-[#c8c8c8] truncate leading-tight">
                                    <span className={`truncate ${isDowntime ? '' : 'text-white'}`}>
                                      {isDowntime ? 'Downtime' : ev.requesterName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* END: CalendarGridContainer */}
          </main>
          {/* END: MainContentArea */}
        </div>
      </div>

      <ContextMenuSharedComponent
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={handleCloseContextMenu}
        items={contextMenuItems}
      />

      <EnvironmentUptimeRequestDetailModalController
        isOpen={selectedUptimeRequestId !== null}
        onClose={() => setSelectedUptimeRequestId(null)}
        request={selectedUptimeRequest}
      />

      <DowntimeAnnouncementDetailModalController
        isOpen={selectedDowntimeAnnouncementId !== null}
        onClose={() => setSelectedDowntimeAnnouncementId(null)}
        announcement={selectedDowntimeAnnouncement}
      />
    </ModalSharedComponent>
  );
}
