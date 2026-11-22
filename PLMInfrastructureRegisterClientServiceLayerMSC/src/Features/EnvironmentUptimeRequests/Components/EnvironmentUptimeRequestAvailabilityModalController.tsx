import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
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
// (a Microsoft Teams Calendar mockup). Pure presentation + the mockup's own click/hover slot
// selection interaction - no backend/query wiring, no connection to fromAt/toAt/onFromChange/
// onToChange yet. That reconnection is a deliberately separate, later step.

const HOURS_START = 8;
const HOURS_END = 17;
const HOURS_COUNT = HOURS_END - HOURS_START + 1; // 10
const SLOT_HEIGHT_PX = 96; // h-24

const WORK_WEEK_DAYS: Array<{ dayNumber: number; weekdayAbbreviation: string }> = [
  { dayNumber: 23, weekdayAbbreviation: 'Mon' },
  { dayNumber: 24, weekdayAbbreviation: 'Tue' },
  { dayNumber: 25, weekdayAbbreviation: 'Wed' },
  { dayNumber: 26, weekdayAbbreviation: 'Thu' },
  { dayNumber: 27, weekdayAbbreviation: 'Fri' },
];

const HOUR_ROWS = Array.from({ length: HOURS_COUNT }, (_, index) => HOURS_START + index);

interface TeamsCalendarEvent {
  id: string;
  day: number;
  startHour: number;
  endHour: number; // inclusive
  title: string;
  variant: 'seed' | 'booked';
  striped?: boolean;
  justCreated?: boolean;
}

const SEED_EVENTS: TeamsCalendarEvent[] = [
  { id: 'seed-one-to-one', day: 0, startHour: 10, endHour: 10, title: 'One-to-One', variant: 'seed' },
  { id: 'seed-weekly-sync', day: 2, startHour: 11, endHour: 11, title: 'Infra Team Weekly Sync', variant: 'seed' },
  { id: 'seed-ppt-update', day: 3, startHour: 12, endHour: 12, title: 'Infra Meeting PPT update', variant: 'seed', striped: true },
];

function getSlotIndex(day: number, hour: number): number {
  return day * HOURS_COUNT + (hour - HOURS_START);
}

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
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
  const [startSlot, setStartSlot] = useState<{ day: number; hour: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ day: number; hour: number } | null>(null);
  const [events, setEvents] = useState<TeamsCalendarEvent[]>(SEED_EVENTS);
  const bookedEventCounterRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      setStartSlot(null);
      setHoverSlot(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && startSlot) {
        setStartSlot(null);
        setHoverSlot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, startSlot]);

  const previewRange = useMemo(() => {
    if (!startSlot || !hoverSlot) return null;
    const startIndex = getSlotIndex(startSlot.day, startSlot.hour);
    const hoverIndex = getSlotIndex(hoverSlot.day, hoverSlot.hour);
    return { lo: Math.min(startIndex, hoverIndex), hi: Math.max(startIndex, hoverIndex) };
  }, [startSlot, hoverSlot]);

  const handleSlotClick = (day: number, hour: number): void => {
    if (!startSlot) {
      setStartSlot({ day, hour });
      return;
    }

    const clickedIndex = getSlotIndex(day, hour);
    const startIndex = getSlotIndex(startSlot.day, startSlot.hour);

    if (clickedIndex === startIndex) {
      setStartSlot(null);
      setHoverSlot(null);
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
        variant: 'booked',
        justCreated: true,
      });
    }

    setEvents((prev) => [...prev, ...newEvents]);
    setStartSlot(null);
    setHoverSlot(null);
  };

  return (
    <ModalSharedComponent isOpen={isOpen} onClose={onClose} maxWidth="7xl" heightMode="capped">
      <div className="ta-teams-calendar-scope relative -m-5 sm:-m-6 h-[75vh] max-h-[800px] overflow-hidden rounded-2xl">
        <style>{`
          .ta-teams-calendar-scope ::-webkit-scrollbar { width: 6px; height: 6px; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-track { background: #141414; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-thumb { background: #333333; border-radius: 3px; }
          .ta-teams-calendar-scope ::-webkit-scrollbar-thumb:hover { background: #444444; }
          .ta-striped-left-border {
            background: repeating-linear-gradient(-45deg, #7b83eb, #7b83eb 3px, #2a2b4d 3px, #2a2b4d 6px);
          }
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
                    <span className="font-semibold text-sm text-[#e1dfdd]">2026 November</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <button aria-label="Previous month" className="hover:text-white p-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </button>
                    <button aria-label="Next month" className="hover:text-white p-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] grid grid-cols-7 gap-y-1 text-center font-normal text-[#979797] mb-1">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>

                <div className="grid grid-cols-7 text-[11px] text-center font-normal text-[#d6d6d6] relative">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <span key={d} className="h-6 flex items-center justify-center cursor-pointer hover:bg-[#292929] rounded">{d}</span>
                  ))}
                  {[8, 9, 10, 11, 12, 13, 14].map((d) => (
                    <span key={d} className="h-6 flex items-center justify-center cursor-pointer hover:bg-[#292929] rounded">{d}</span>
                  ))}
                  {[15, 16, 17, 18, 19, 20, 21].map((d) => (
                    <span key={d} className="h-6 flex items-center justify-center cursor-pointer hover:bg-[#292929] rounded">{d}</span>
                  ))}
                  <div className="col-span-7 grid grid-cols-7 bg-[#28273b] rounded-full my-0.5 py-0 items-center">
                    <span className="h-6 flex items-center justify-center bg-[#5b5fc7] text-white font-medium rounded-full cursor-pointer">22</span>
                    {[23, 24, 25, 26, 27, 28].map((d) => (
                      <span key={d} className="h-6 flex items-center justify-center text-white cursor-pointer">{d}</span>
                    ))}
                  </div>
                  {[29, 30].map((d) => (
                    <span key={d} className="h-6 flex items-center justify-center cursor-pointer hover:bg-[#292929] rounded">{d}</span>
                  ))}
                  {[1, 2, 3, 4, 5].map((d) => (
                    <span key={`dec-${d}`} className="h-6 flex items-center justify-center text-[#979797] cursor-pointer hover:bg-[#292929] rounded">{d}</span>
                  ))}
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
                <button className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-[#2b2b2b] hover:bg-[#292929] text-[#e1dfdd] transition-colors">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect height="18" rx="2" strokeWidth="2" width="18" x="3" y="4" />
                    <line strokeWidth="2" x1="16" x2="16" y1="2" y2="6" />
                    <line strokeWidth="2" x1="8" x2="8" y1="2" y2="6" />
                    <line strokeWidth="2" x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <span className="font-normal text-xs">Today</span>
                </button>
                <div className="flex items-center space-x-0.5">
                  <button aria-label="Previous week" className="p-1.5 rounded hover:bg-[#292929] text-gray-400 hover:text-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                  <button aria-label="Next week" className="p-1.5 rounded hover:bg-[#292929] text-gray-400 hover:text-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-1 pl-1 cursor-pointer hover:bg-[#292929] py-1 px-2 rounded">
                  <span className="font-semibold text-white text-xs">23–27 November, 2026</span>
                  <svg className="w-3.5 h-3.5 text-gray-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </header>
            {/* END: TopActionBar */}

            {/* BEGIN: CalendarGridContainer */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-[#141414]">
              <div className="flex border-b border-[#2b2b2b] sticky top-0 bg-[#141414] z-20">
                <div className="w-12 flex-shrink-0 border-r border-[#2b2b2b]" />
                {WORK_WEEK_DAYS.map(({ dayNumber, weekdayAbbreviation }) => (
                  <div key={dayNumber} className="flex-1 min-w-0 border-r border-[#2b2b2b] px-3 py-2 flex items-center justify-between">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-normal text-[#5b9bd5]">{dayNumber}</span>
                      <span className="text-xs text-[#979797]">{weekdayAbbreviation}</span>
                    </div>
                    <OfficeBuildingIcon className="w-3.5 h-3.5 text-[#7070b8]" />
                  </div>
                ))}
              </div>

              <div className="flex flex-1 relative min-h-[960px]">
                <div className="w-12 flex-shrink-0 flex flex-col text-right text-[11px] text-[#979797] border-r border-[#2b2b2b] select-none">
                  {HOUR_ROWS.map((hour) => (
                    <div key={hour} className="h-24 pr-2 pt-1 border-b border-[#2b2b2b]">{hour}</div>
                  ))}
                </div>

                {WORK_WEEK_DAYS.map((_, dayIndex) => {
                  const dayEvents = events.filter((ev) => ev.day === dayIndex);
                  return (
                    <div key={dayIndex} className="flex-1 border-r border-[#2b2b2b] relative">
                      {HOUR_ROWS.map((hour) => {
                        const index = getSlotIndex(dayIndex, hour);
                        const isStart = startSlot?.day === dayIndex && startSlot?.hour === hour;
                        const inPreview = !isStart && previewRange !== null && index >= previewRange.lo && index <= previewRange.hi;

                        let slotClassName = 'h-24 border-b border-[#2b2b2b] relative cursor-pointer transition-colors duration-150';
                        if (isStart) {
                          slotClassName += ' bg-[rgba(91,95,199,0.28)] ta-slot-start-active z-[5]';
                        } else if (inPreview) {
                          slotClassName += ' bg-[rgba(91,95,199,0.22)] shadow-[inset_0_0_0_1px_rgba(123,131,235,0.45)]';
                        } else {
                          slotClassName += ' hover:bg-[rgba(91,95,199,0.12)]';
                        }

                        return (
                          <div
                            key={hour}
                            className={slotClassName}
                            onClick={() => handleSlotClick(dayIndex, hour)}
                            onMouseEnter={() => setHoverSlot({ day: dayIndex, hour })}
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
                        const isSeed = ev.variant === 'seed';

                        return (
                          <div
                            key={ev.id}
                            style={{ top: topPx, height: heightPx }}
                            className={`absolute inset-x-1 bg-[#3d375a] border border-[#5b5fc7]/50 rounded cursor-pointer overflow-hidden flex shadow-sm hover:brightness-110 transition-all z-10 ${ev.justCreated ? 'ta-booked-event-card' : ''}`}
                          >
                            <div className={`w-1 flex-shrink-0 ${ev.striped ? 'ta-striped-left-border' : 'bg-[#7b83eb]'}`} />
                            <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden">
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-xs font-semibold text-white truncate leading-tight">{ev.title}</span>
                                {isSeed ? (
                                  <svg className="w-3.5 h-3.5 text-[#c8c8c8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                  </svg>
                                ) : (
                                  <span className="text-[10px] font-medium text-[#c8c8c8] bg-[#464775] px-1.5 py-0.5 rounded flex-shrink-0">
                                    {formatHourLabel(ev.startHour)} – {formatHourLabel(ev.endHour + 1)}
                                  </span>
                                )}
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
