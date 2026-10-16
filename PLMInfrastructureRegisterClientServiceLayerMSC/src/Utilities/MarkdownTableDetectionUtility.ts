// A GFM table's delimiter row looks like `| --- | :--- | ---: |` - matching
// it (rather than just looking for any "|") is what lets the chat bubble
// widen only for messages that actually contain a table, not any message
// that happens to mention a pipe character.
const MARKDOWN_TABLE_DELIMITER_ROW_PATTERN = /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/m;

export function containsMarkdownTable(text: string): boolean {
  return MARKDOWN_TABLE_DELIMITER_ROW_PATTERN.test(text);
}
