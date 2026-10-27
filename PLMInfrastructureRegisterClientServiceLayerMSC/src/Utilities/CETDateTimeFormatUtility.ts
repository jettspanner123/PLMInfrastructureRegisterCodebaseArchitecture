// "Etc/GMT-1" is a fixed UTC+1 offset with no daylight saving - the IANA tz
// database inverts the sign on Etc/GMT zones (POSIX convention), so this
// name really does mean UTC+1, not UTC-1. Deliberately NOT 'Europe/Berlin'
// (which would flip to UTC+2/CEST every summer) - confirmed with the user
// that "CET" here means a fixed offset, never shifting for DST.
const CENTRAL_EUROPEAN_TIME_ZONE = 'Etc/GMT-1';

// Formats a UTC ISO timestamp (as returned by the backend) into fixed-CET
// (UTC+1, year-round) wall-clock display text, independent of the viewing
// browser's own local timezone - matching how the existing Current Uptime
// Schedule feature already assumes CET rather than the browser's local time.
export default class CETDateTimeFormatUtility {
  public static current: CETDateTimeFormatUtility = new CETDateTimeFormatUtility();

  public formatDateTime(isoUtcTimestamp: string): string {
    const date = new Date(isoUtcTimestamp);
    return new Intl.DateTimeFormat(undefined, {
      timeZone: CENTRAL_EUROPEAN_TIME_ZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
