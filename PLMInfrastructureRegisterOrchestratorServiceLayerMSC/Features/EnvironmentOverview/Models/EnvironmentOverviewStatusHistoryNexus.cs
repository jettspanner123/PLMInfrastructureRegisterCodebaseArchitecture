namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // One row per Status change on an EnvironmentOverviewNexus row - append-
    // only, never updated or deleted, so the full change history survives
    // regardless of how many times a given environment's Status is later
    // changed again. Backend-only for now: nothing in the frontend reads
    // this yet, it exists purely so the audit trail isn't lost before a
    // future "view history" feature is built.
    //
    // ChangedByClientId is a per-browser random id (see
    // AnonymousClientIdentityUtility.ts on the frontend), NOT a real user
    // identity - this app has no authentication system yet. It only
    // guarantees "the same browser made these changes", not who that person
    // actually is. Replace with a real user id once auth exists.
    public sealed class EnvironmentOverviewStatusHistoryNexus
    {
        public Guid Id { get; set; }

        public Guid EnvironmentOverviewId { get; set; }

        public string PreviousStatus { get; set; } = string.Empty;

        public string NewStatus { get; set; } = string.Empty;

        public string ChangedByClientId { get; set; } = string.Empty;

        public DateTime ChangedAt { get; set; }
    }
}
