namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models
{
    // The FULL replacement text for this one line, not just an edited note
    // snippet - unlike AddActionItemRequestDTO (whose date prefix is
    // computed server-side from scratch), editing an existing entry must
    // preserve whatever prefix that line already had untouched: a date is a
    // historical fact about when something happened, not something a note
    // typo-fix should silently rewrite. The frontend's
    // ActionItemsLineParserUtility is what actually reconstructs this string
    // (the original line's own date/tag/separator, byte-for-byte, with only
    // the note portion swapped) before calling this endpoint - the server
    // treats it as an opaque replacement, the same way
    // DeleteActionItemAsynchronous treats a line as an opaque thing to
    // remove. No parsing happens on this side.
    public sealed class UpdateActionItemRequestDTO
    {
        public string? ReplacementLineText { get; set; }
    }
}
