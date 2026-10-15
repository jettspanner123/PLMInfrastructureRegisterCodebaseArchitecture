export const UPTIME_SCHEDULE_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface ParsedUptimeSchedule {
  days: string[];
  specialMode: string | null;
  onDemandStatus: string | null;
  startTime: string;
  endTime: string;
}

const EMPTY_PARSED: ParsedUptimeSchedule = {
  days: [],
  specialMode: null,
  onDemandStatus: null,
  startTime: '',
  endTime: '',
};

// Builds and (best-effort) parses the Current Uptime Schedule column's two-
// line text. The real legacy data this replaces was never consistently
// formatted (see the grilling session that designed this feature) - this
// utility only needs to round-trip what it ITSELF writes going forward;
// anything it doesn't recognize when parsing an existing value just opens
// the editor blank rather than guessing wrong, which is safer than silently
// misreading an inconsistent historical value.
export default class UptimeScheduleTextUtility {
  public static current: UptimeScheduleTextUtility = new UptimeScheduleTextUtility();

  // Capital "To" per the user's own example ("Monday To Wednesday (Daily)") -
  // a contiguous run of 2+ days becomes a range, a single day still gets the
  // "(Daily)" suffix (there's no "to" without a second day), and a non-
  // contiguous selection becomes a plain comma list with no suffix at all.
  public formatDaysLine(selectedDays: string[]): string {
    if (selectedDays.length === 0) return '';

    const sortedIndices = selectedDays
      .map((day) => UPTIME_SCHEDULE_WEEKDAYS.indexOf(day))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b);

    if (sortedIndices.length === 0) return '';

    const isContiguous = sortedIndices.every(
      (value, index) => index === 0 || value === sortedIndices[index - 1] + 1
    );

    if (isContiguous) {
      const first = UPTIME_SCHEDULE_WEEKDAYS[sortedIndices[0]];
      const last = UPTIME_SCHEDULE_WEEKDAYS[sortedIndices[sortedIndices.length - 1]];
      return sortedIndices.length === 1 ? `${first} (Daily)` : `${first} To ${last} (Daily)`;
    }

    return sortedIndices.map((index) => UPTIME_SCHEDULE_WEEKDAYS[index]).join(',');
  }

  public formatTimeRange(startTime: string, endTime: string): string {
    return `${startTime} until ${endTime} (CET)`;
  }

  public buildValue(
    specialMode: string | null,
    onDemandStatus: string | null,
    selectedDays: string[],
    startTime: string,
    endTime: string
  ): string {
    if (specialMode) {
      if (specialMode === 'On Demand' && onDemandStatus) {
        return `${specialMode}\n${onDemandStatus}`;
      }
      return specialMode;
    }

    if (selectedDays.length > 0) {
      const line1 = this.formatDaysLine(selectedDays);
      if (startTime && endTime) {
        return `${line1}\n${this.formatTimeRange(startTime, endTime)}`;
      }
      return line1;
    }

    return '';
  }

  public parse(raw: string | null, specialModeOptions: string[]): ParsedUptimeSchedule {
    if (!raw) return EMPTY_PARSED;

    const lines = raw.split('\n').map((line) => line.trim());
    const line1 = lines[0] ?? '';
    const line2 = lines[1];

    const matchedSpecialMode = specialModeOptions.find(
      (option) => option.toLowerCase() === line1.toLowerCase()
    );
    if (matchedSpecialMode) {
      if (matchedSpecialMode === 'On Demand' && line2) {
        return { ...EMPTY_PARSED, specialMode: matchedSpecialMode, onDemandStatus: line2 };
      }
      return { ...EMPTY_PARSED, specialMode: matchedSpecialMode };
    }

    const rangeMatch = line1.match(/^([A-Za-z]+)(?:\s+To\s+([A-Za-z]+))?\s*\(Daily\)$/i);
    if (rangeMatch) {
      const startIndex = UPTIME_SCHEDULE_WEEKDAYS.findIndex(
        (day) => day.toLowerCase() === rangeMatch[1].toLowerCase()
      );
      const endIndex = rangeMatch[2]
        ? UPTIME_SCHEDULE_WEEKDAYS.findIndex((day) => day.toLowerCase() === rangeMatch[2].toLowerCase())
        : startIndex;

      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        const days = UPTIME_SCHEDULE_WEEKDAYS.slice(startIndex, endIndex + 1);
        const { startTime, endTime } = this.parseTimeRange(line2);
        return { days, specialMode: null, onDemandStatus: null, startTime, endTime };
      }
    }

    const commaParts = line1.split(',').map((part) => part.trim());
    if (
      commaParts.length > 1 &&
      commaParts.every((part) => UPTIME_SCHEDULE_WEEKDAYS.some((day) => day.toLowerCase() === part.toLowerCase()))
    ) {
      const days = commaParts.map(
        (part) => UPTIME_SCHEDULE_WEEKDAYS.find((day) => day.toLowerCase() === part.toLowerCase())!
      );
      const { startTime, endTime } = this.parseTimeRange(line2);
      return { days, specialMode: null, onDemandStatus: null, startTime, endTime };
    }

    return EMPTY_PARSED;
  }

  private parseTimeRange(line2: string | undefined): { startTime: string; endTime: string } {
    if (!line2) return { startTime: '', endTime: '' };

    const match = line2.match(/(\d{1,2}:\d{2})\s*(AM|PM)?.*?until\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i);
    if (!match) return { startTime: '', endTime: '' };

    return {
      startTime: this.normalizeTo24Hour(match[1], match[2]),
      endTime: this.normalizeTo24Hour(match[3], match[4]),
    };
  }

  private normalizeTo24Hour(time: string, ampm?: string): string {
    if (!ampm) return time;

    const [hourString, minuteString] = time.split(':');
    let hour = parseInt(hourString, 10);
    if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
    if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;

    return `${String(hour).padStart(2, '0')}:${minuteString}`;
  }
}
