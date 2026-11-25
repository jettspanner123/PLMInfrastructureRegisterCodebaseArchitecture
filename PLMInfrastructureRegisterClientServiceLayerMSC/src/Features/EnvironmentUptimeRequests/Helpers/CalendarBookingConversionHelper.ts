import type { WeekDay, TeamsCalendarEvent, CalendarEventSourceType } from '../Components/EnvironmentUptimeRequestAvailabilityModalController';

const HOURS_START = 0;
const HOURS_END = 23;

// Fixed UTC+1, no daylight saving - same convention CETDateTimeFormatUtility
// already uses for display, and CETTimeZoneUtility uses server-side for the
// reverse (CET-naive -> UTC) direction on create.
const CENTRAL_EUROPEAN_TIME_ZONE = 'Etc/GMT-1';

interface WallClockParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

// Singleton conversion helper between this calendar's day/hour grid model and
// real date/time values, in both directions - specs/009-calendar-backend-
// integration/research.md §7/§9. Every Date this helper either accepts as
// fromAt/toAt or itself constructs is a "CET wall-clock, read through the
// browser's own local Date getters" value (the same convention the rest of
// this file's day math already uses) - never a true UTC instant read with
// browser-local getters, which would silently apply the wrong offset.
export default class CalendarBookingConversionHelper {
  public static current: CalendarBookingConversionHelper = new CalendarBookingConversionHelper();

  // Decomposes one CET wall-clock fromAt/toAt span into one TeamsCalendarEvent
  // per calendar day it touches, clipped to that day's actual hour range.
  // Both inputs must already be "CET wall-clock as local" Dates - see
  // convertUtcToCetWallClockDate (real backend data) / parseNaiveDateTime (the
  // in-progress pick's own naive string) for how to produce one.
  public convertRangeToEvents(
    fromAt: Date,
    toAt: Date,
    allDays: WeekDay[],
    title: string,
    source: CalendarEventSourceType,
    backendId?: string
  ): TeamsCalendarEvent[] {
    const events: TeamsCalendarEvent[] = [];

    // The end boundary is exclusive (a booking ending at 11:00 does not
    // occupy the 11 o'clock hour cell at all) - subtracting one minute before
    // reading the day/hour gives the last actually-occupied minute, which
    // correctly handles both a clean on-the-hour end and a partial-hour one
    // (e.g. ending at 11:30 still occupies the 11 o'clock cell).
    const lastOccupiedMoment = new Date(toAt.getTime() - 60000);
    if (lastOccupiedMoment.getTime() < fromAt.getTime()) {
      return events; // malformed/zero-length span - nothing to render
    }

    const fromDayStart = new Date(fromAt.getFullYear(), fromAt.getMonth(), fromAt.getDate());
    const toDayStart = new Date(lastOccupiedMoment.getFullYear(), lastOccupiedMoment.getMonth(), lastOccupiedMoment.getDate());
    const totalDayOffset = Math.round((toDayStart.getTime() - fromDayStart.getTime()) / 86400000);

    for (let offset = 0; offset <= totalDayOffset; offset++) {
      const current = new Date(fromDayStart);
      current.setDate(current.getDate() + offset);

      const dayIndex = allDays.findIndex(
        (day) => day.year === current.getFullYear() && day.monthIndex === current.getMonth() && day.day === current.getDate()
      );
      if (dayIndex === -1) continue; // outside the calendar's fixed 5-week range - skip, don't clamp

      const startHour = offset === 0 ? fromAt.getHours() : HOURS_START;
      const endHour = offset === totalDayOffset ? lastOccupiedMoment.getHours() : HOURS_END;

      events.push({
        id: backendId ? `${backendId}-${offset}` : `inprogress-${dayIndex}`,
        day: dayIndex,
        startHour,
        endHour,
        title,
        source,
        backendId,
      });
    }

    return events;
  }

  // The reverse of convertRangeToEvents, for the live click-completion path:
  // turns a completed (start day/hour, end day/hour) pick into the naive
  // "YYYY-MM-DDTHH:mm" strings CreateEnvironmentUptimeRequestInputInterfaceModel
  // expects (research.md §9). endHour is inclusive, so the exclusive end
  // boundary is endHour + 1 on the end day.
  public convertPickToDateTimeStrings(
    startDayIndex: number,
    startHour: number,
    endDayIndex: number,
    endHour: number,
    allDays: WeekDay[]
  ): { fromAt: string; toAt: string } {
    const startDay = allDays[startDayIndex];
    const endDay = allDays[endDayIndex];

    return {
      fromAt: this.formatNaiveDateTime(startDay.year, startDay.monthIndex, startDay.day, startHour),
      toAt: this.formatNaiveDateTime(endDay.year, endDay.monthIndex, endDay.day, endHour + 1),
    };
  }

  // Naive "YYYY-MM-DDTHH:mm" -> a CET-wall-clock-as-local Date, by
  // constructing it from the string's own numeric parts - the same technique
  // EnvironmentUptimeRequestFormStaticComponent's own formatSelectedDateTime
  // already uses, deliberately never `new Date(isoString)`, which would apply
  // the browser's own local timezone to a string that is not UTC at all.
  public parseNaiveDateTime(value: string): Date {
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = (timePart ?? '0:0').split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute || 0, 0, 0);
  }

  // A real backend UTC ISO timestamp -> a CET-wall-clock-as-local Date, so it
  // composes with convertRangeToEvents the same way the in-progress pick's
  // own parseNaiveDateTime output already does. Reads the instant's wall-
  // clock parts in the fixed CET zone (not the browser's own local zone) via
  // Intl, then constructs a plain Date from those numbers directly.
  public convertUtcToCetWallClockDate(utcIsoTimestamp: string): Date {
    const parts = this.readCetWallClockParts(new Date(utcIsoTimestamp));
    return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);
  }

  private readCetWallClockParts(instant: Date): WallClockParts {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: CENTRAL_EUROPEAN_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(instant);

    const read = (type: Intl.DateTimeFormatPartTypes): number =>
      Number(formatted.find((part) => part.type === type)?.value ?? 0);

    return {
      year: read('year'),
      month: read('month'),
      day: read('day'),
      hour: read('hour'),
      minute: read('minute'),
    };
  }

  private formatNaiveDateTime(year: number, monthIndex: number, day: number, hour: number): string {
    // hour can be 24 (an inclusive 23 + 1) - new Date() normalizes that into
    // hour 0 of the following day on its own, which is exactly the midnight
    // rollover this needs.
    const normalized = new Date(year, monthIndex, day, hour, 0, 0, 0);
    const pad = (value: number): string => String(value).padStart(2, '0');
    return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}-${pad(normalized.getDate())}T${pad(normalized.getHours())}:00`;
  }
}
