// Mirrors the backend's UpdateActionItemRequestDTO field-for-field. Unlike
// AddActionItemRequestInterfaceModel's `note` (just the new entry's text,
// date prefix computed server-side), `replacementLineText` is the FULL line
// - ActionItemsLineParserUtility.buildReplacementLine is what reconstructs
// it (the original line's own date/tag/separator, byte-for-byte, with only
// the note swapped) before this ever reaches the service layer.
export default interface UpdateActionItemRequestInterfaceModel {
  replacementLineText: string;
}
