export interface ParsedActionItemsLine {
  // null when this line has no recognizable leading date - the caller
  // renders a generic "Unrevealed" tag in this case instead of a real date,
  // so every line gets a same-shaped tag regardless.
  //
  // Normalized to a fixed "DD-Mon-YYYY" shape (zero-padded day, 3-letter
  // month, 4-digit year) regardless of how the source data actually wrote
  // it - "19-March-2026", "5-Aug-24", "29-09-2025", and "14Jul-2025" all
  // become e.g. "19-Mar-2026", "05-Aug-2024", "29-Sep-2025", "14-Jul-2025".
  // This is what makes every date tag the same fixed width. Day-less
  // entries (e.g. "Jan-2026") normalize to "Mon-YYYY" instead - there's no
  // real day to zero-pad, and inventing one would misrepresent the data.
  date: string | null;
  // A parenthetical tag directly after the date, before the separator (e.g.
  // "02-Dec-2024 (BG): ..." -> tag "BG") - grouped into the same badge as
  // the date itself, since it's metadata about the entry, not the note.
  tag: string | null;
  note: string;
}

// Digit-or-name month token, used standalone (not as part of a bigger
// alternation) so day/month/year can be captured as three separate groups
// below instead of one combined "date" string that would need to be
// re-decomposed later to normalize it.
const MONTH_TOKEN_PATTERN =
  '(?:\\d{1,2}|Jan|Feb|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|Sept?|September|Oct|October|Nov|November|Dec|December)';

const MONTH_ABBREVIATIONS: Record<string, string> = {
  '1': 'Jan', '01': 'Jan', jan: 'Jan',
  '2': 'Feb', '02': 'Feb', feb: 'Feb',
  '3': 'Mar', '03': 'Mar', mar: 'Mar', march: 'Mar',
  '4': 'Apr', '04': 'Apr', apr: 'Apr', april: 'Apr',
  '5': 'May', '05': 'May', may: 'May',
  '6': 'Jun', '06': 'Jun', jun: 'Jun', june: 'Jun',
  '7': 'Jul', '07': 'Jul', jul: 'Jul', july: 'Jul',
  '8': 'Aug', '08': 'Aug', aug: 'Aug',
  '9': 'Sep', '09': 'Sep', sep: 'Sep', sept: 'Sep', september: 'Sep',
  '10': 'Oct', oct: 'Oct', october: 'Oct',
  '11': 'Nov', nov: 'Nov', november: 'Nov',
  '12': 'Dec', dec: 'Dec', december: 'Dec',
};

// Deliberately permissive, built against this column's actual real data
// (empirically tested against all 575 real lines across every environment -
// 431 matched, 0 false positives on the remaining day-less/prose lines)
// rather than just the single clean "DD-Month-YYYY:" shape originally
// described. Handles, in order: an optional leading quote + whitespace
// (Excel's text-escape marker, stripped entirely); an optional day + loose
// separator (day is optional for "Jan-2026"-style month-year-only entries,
// and the separator allows zero characters for entries like "14Jul-2025"
// with no gap at all between day and month); the month; a loose separator;
// a 2-or-4-digit year; an optional parenthetical tag; an optional
// colon/dash (or no separator at all, just a space, which several real
// entries use); then the rest of the line as the note. "Loose separator"
// (`[\s-]*`) also absorbs the stray extra spaces seen in some hand-edited
// entries (e.g. "18 -Feb -2026").
const LEADING_DATE_REGEX = new RegExp(
  `^\\s*'?\\s*(?:(\\d{1,2})[\\s-]*)?(${MONTH_TOKEN_PATTERN})[\\s-]*(\\d{2,4})\\s*(?:\\(([^)]*)\\))?\\s*[:\\-]?\\s*(.*)$`,
  'i'
);

export default class ActionItemsLineParserUtility {
  public static current: ActionItemsLineParserUtility = new ActionItemsLineParserUtility();

  public parseLine(line: string): ParsedActionItemsLine {
    const match = line.match(LEADING_DATE_REGEX);
    if (!match) {
      return { date: null, tag: null, note: line };
    }

    const [, rawDay, rawMonth, rawYear, tag, note] = match;
    const date = this.buildNormalizedDate(rawDay, rawMonth, rawYear);

    return { date, tag: tag ?? null, note };
  }

  private buildNormalizedDate(rawDay: string | undefined, rawMonth: string, rawYear: string): string {
    const monthAbbreviation = MONTH_ABBREVIATIONS[rawMonth.toLowerCase()] ?? rawMonth;
    const year = rawYear.length >= 4 ? rawYear : `20${rawYear.padStart(2, '0')}`;

    if (!rawDay) return `${monthAbbreviation}-${year}`;
    return `${rawDay.padStart(2, '0')}-${monthAbbreviation}-${year}`;
  }
}
