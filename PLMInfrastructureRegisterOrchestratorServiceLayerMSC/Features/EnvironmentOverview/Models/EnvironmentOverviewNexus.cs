namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // One row per environment from the infrastructure register's own
    // "Environment Overview" sheet - entirely manual data (no Azure/Sync
    // involvement), seeded once from the CSV and meant to be user-editable
    // later. Every column mirrors the CSV verbatim; IsDecommissioned and
    // DisplayOrder are the only two derived values, both added during the
    // seed migration rather than present in the source file itself.
    public sealed class EnvironmentOverviewNexus
    {
        public Guid Id { get; set; }

        // Preserves the CSV's own row order - Postgres doesn't guarantee
        // retrieval order without an explicit ORDER BY, and the source order
        // reflects a deliberate grouping (live environments, then
        // decommissioned ones) worth keeping.
        //
        // double, not int: inserting a row "above" or "below" a specific
        // existing row (see EnvironmentOverviewService.InsertRowAsynchronous)
        // computes the midpoint between that row's DisplayOrder and its new
        // neighbor's, rather than shifting every subsequent row's value by
        // one - no other row is ever touched by an insert, so two concurrent
        // inserts near the same spot can never race against each other.
        public double DisplayOrder { get; set; }

        public string Environment { get; set; } = string.Empty;

        public string? Purpose { get; set; }

        public string? Sponsor { get; set; }

        public string? CurrentUptimeSchedule { get; set; }

        public string? Priority1 { get; set; }

        public string? Priority2 { get; set; }

        public string? Priority3 { get; set; }

        public string? ActionItemsUpdates { get; set; }

        // The raw, full text the user typed into the Current Uptime
        // Schedule modal's own optional Notes field - unbounded, never
        // altered. UptimeScheduleNoteSummary below is what the table cell
        // actually displays; this is what repopulates the modal's textarea
        // for re-editing, so nothing the user wrote is ever lost to
        // summarization.
        public string? UptimeScheduleNote { get; set; }

        // Display-ready version of UptimeScheduleNote - a verbatim copy
        // when the note is short enough already, or an AI-condensed
        // (lossless, just more concise) version when it's long, computed
        // once at save time by EnvironmentOverviewService - never
        // recomputed on every read.
        public string? UptimeScheduleNoteSummary { get; set; }

        public string? ConfigurationCustomisationVersion { get; set; }

        public string? DNSURL { get; set; }

        // Not a compiled enum on purpose - the valid option set is owned by
        // IG_ConfigurationConstantTBL (key "ENVIRONMENT_OVERVIEW_STATUS_OPTIONS",
        // seeded with "Live"/"Decommissioned") so a user can add a new status
        // without a code change/redeploy. Seeded from the CSV's own
        // "DECOMISSIONED ENVIRONMENTS" section-divider: every row below it
        // became "Decommissioned", everything else "Live" - that divider row
        // itself was never a real environment and isn't stored.
        public string Status { get; set; } = string.Empty;

        // Soft delete, not hard - deleting a whole environment is a bigger
        // action than deleting one Action Items line, and the register's
        // general "nothing just disappears" feel (plus the fact Status
        // History rows aren't a real cascading FK today) argued for
        // preserving the row rather than removing it. A global query filter
        // (see ApplicationDatabaseContext.OnModelCreating) excludes
        // IsDeleted rows from every normal query automatically, so this
        // behaves like a hard delete everywhere the app actually reads
        // EnvironmentOverviews - no UI anywhere filters on this directly.
        public bool IsDeleted { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
