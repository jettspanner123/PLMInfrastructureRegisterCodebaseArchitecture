export interface YearMonthDay {
  year: number;
  monthIndex: number; // 0-11
  day: number;
}

export default class YearlyCalendarCON {
  public static readonly MONTH_NAMES: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Sunday-first, matching YEARLY_CALENDAR_VIEW.html's own weekday header order
  // (see specs/015-yearly-calendar research.md §1) - distinct from
  // CustomDatePickerSharedComponent's own Monday-first convention.
  public static readonly WEEKDAY_ABBREVIATIONS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
