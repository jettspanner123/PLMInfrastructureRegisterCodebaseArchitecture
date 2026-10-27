using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities
{
    // Converts between CET wall-clock time and UTC - deliberately a FIXED
    // UTC+1 offset that never shifts for daylight saving (confirmed with
    // the user: not the DST-aware Europe/Berlin interpretation, which would
    // read as UTC+2/CEST in summer). First real timezone conversion in this
    // codebase - the existing Current Uptime Schedule feature only ever
    // appended the literal text "(CET)" to a free-text description; it
    // never actually stored or converted a timezone-aware value.
    public static class CETTimeZoneUtility
    {
        private static readonly TimeSpan _centralEuropeanFixedOffset = TimeSpan.FromHours(1);

        // input: a wall-clock DateTime (any Kind) meant to be read as fixed
        // CET (UTC+1) local time - e.g. straight off a <input
        // type="datetime-local"> value. Returns the equivalent UTC instant
        // (Kind=Utc), ready to store in a `timestamp with time zone` column.
        public static DateTime ToUtc(DateTime centralEuropeanLocalTime)
        {
            DateTime unspecified = DateTime.SpecifyKind(centralEuropeanLocalTime, DateTimeKind.Unspecified);
            return DateTime.SpecifyKind(unspecified - _centralEuropeanFixedOffset, DateTimeKind.Utc);
        }

        public static DateTime FromUtc(DateTime utcDateTime)
        {
            DateTime utc = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
            return DateTime.SpecifyKind(utc + _centralEuropeanFixedOffset, DateTimeKind.Unspecified);
        }
    }
}
