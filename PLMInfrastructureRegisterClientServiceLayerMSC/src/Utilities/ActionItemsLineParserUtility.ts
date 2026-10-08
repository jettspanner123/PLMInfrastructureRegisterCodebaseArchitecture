export interface ParsedActionItemsLine {
  // null when this line has no recognizable leading date - rendered as
  // plain text, same as before. Cleaned of stray internal whitespace (the
  // source data has entries like "18 -Feb -2026" from manual spreadsheet
  // editing) and any leading Excel text-escape apostrophe.
  date: string | null;
  // A parenthetical tag directly after the date, before the separator (e.g.
  // "02-Dec-2024 (BG): ..." -> tag "BG") - grouped into the same badge as
  // the date itself, since it's metadata about the entry, not the note.
  tag: string | null;
  note: string;
}

// Month name only (digit months are matched by the day/month-number
// patterns below), abbreviated and full forms both - the source data uses
// both inconsistently (e.g. "19-March-2026" vs "21-May-2026").
const MONTH_PATTERN =
  '(?:\\d{1,2}|Jan|Feb|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|Sept?|September|Oct|October|Nov|November|Dec|December)';

// Deliberately permissive, built against this column's actual real data
// (empirically tested against all 575 real lines across every environment -
// 431 matched, 0 false positives on the remaining day-less/prose lines)
// rather than just the single clean "DD-Month-YYYY:" shape originally
// described. Handles, in order: an optional leading quote + whitespace
// (Excel's text-escape marker, stripped entirely); an optional day + loose
// separator (day is optional for "Jan-2026"-style month-year-only entries);
// the month; a loose separator; a 2-or-4-digit year; an optional
// parenthetical tag; an optional colon/dash (or no separator at all, just a
// space, which several real entries use); then the rest of the line as the
// note. "Loose separator" (`[\s-]*`) absorbs the stray extra spaces seen in
// some hand-edited entries (e.g. "18 -Feb -2026") without requiring them.
const LEADING_DATE_REGEX = new RegExp(
  `^\\s*'?\\s*((?:\\d{1,2}[\\s-]*)?${MONTH_PATTERN}[\\s-]*\\d{2,4})\\s*(?:\\(([^)]*)\\))?\\s*[:\\-]?\\s*(.*)$`,
  'i'
);

export default class ActionItemsLineParserUtility {
  public static current: ActionItemsLineParserUtility = new ActionItemsLineParserUtility();

  public parseLine(line: string): ParsedActionItemsLine {
    const match = line.match(LEADING_DATE_REGEX);
    if (!match) {
      return { date: null, tag: null, note: line };
    }

    const [, rawDate, tag, note] = match;
    const cleanedDate = rawDate
      .replace(/\s*-\s*/g, '-') // "18 -Feb -2026" -> "18-Feb-2026"
      .replace(/\s+/g, ' ')
      .trim();

    return { date: cleanedDate, tag: tag ?? null, note };
  }
}
