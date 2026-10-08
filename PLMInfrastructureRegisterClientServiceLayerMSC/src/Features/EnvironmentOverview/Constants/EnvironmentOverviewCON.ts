import type EnvironmentOverviewInterfaceModel from '../../../Models/EnvironmentOverviewInterfaceModel';
import type DraftEnvironmentOverviewRowInterfaceModel from '../../../Models/DraftEnvironmentOverviewRowInterfaceModel';

// Column order and labels mirror the CSV's own column headers verbatim (per
// the naming rule: UI-facing text is exempt from the project's code-
// identifier naming conventions) - see ResourceColumnCON for the same
// pattern on the Resources table.
export interface EnvironmentOverviewColumnDef {
  key: keyof EnvironmentOverviewInterfaceModel;
  label: string;
}

export default class EnvironmentOverviewCON {
  // One entry per real text column, in table order - the one thing NOT in
  // this list is the derived "Status" column (Live/Decommissioned),
  // appended separately since it isn't itself a stored string field.
  public static readonly TEXT_COLUMNS: EnvironmentOverviewColumnDef[] = [
    { key: 'environment', label: 'ENVIRONMENT' },
    { key: 'purpose', label: 'PURPOSE' },
    { key: 'sponsor', label: 'SPONSOR' },
    { key: 'currentUptimeSchedule', label: 'CURRENT UPTIME SCHEDULE' },
    { key: 'priority1', label: 'PRIORITY 1' },
    { key: 'priority2', label: 'PRIORITY 2' },
    { key: 'priority3', label: 'PRIORITY 3' },
    { key: 'configurationCustomisationVersion', label: 'CONFIGURATION & CUSTOMISATION VERSION' },
    { key: 'dnsurl', label: 'DNS URL' },
  ];

  // Action Items / Updates is addressed separately (last column) since its
  // display needs a scrollable fixed-height cell rather than the plain
  // wrapped-text treatment every other column gets - some entries run past
  // 10,000 characters of dated log entries. Derived from TEXT_COLUMNS above,
  // not hand-maintained separately - a class static property can read an
  // earlier static property of the same class during initialization.
  public static readonly ACTION_ITEMS_COLUMN_INDEX: number = EnvironmentOverviewCON.TEXT_COLUMNS.length;
  public static readonly STATUS_COLUMN_INDEX: number = EnvironmentOverviewCON.TEXT_COLUMNS.length + 1;
  public static readonly TOTAL_COLUMN_COUNT: number = EnvironmentOverviewCON.TEXT_COLUMNS.length + 2;

  public static readonly CELL_CLASS_NAME: string =
    'px-3 py-2 align-top whitespace-pre-wrap break-words font-mono text-slate-700 dark:text-zinc-300';

  // The only TEXT_COLUMNS keys Edit Mode lets a user type into directly -
  // Environment, Sponsor, Current Uptime Schedule and Configuration &
  // Customisation Version aren't part of this request and keep their
  // read-only rendering. Maps each editable key to the PascalCase
  // FieldName the backend's generic PUT /{id}/Field endpoint expects (see
  // EnvironmentOverviewAssertion.AssertUpdateFieldRequest on the backend
  // for the matching allow-list).
  public static readonly EDITABLE_TEXT_FIELD_NAMES: Partial<Record<keyof EnvironmentOverviewInterfaceModel, string>> = {
    purpose: 'Purpose',
    priority1: 'Priority1',
    priority2: 'Priority2',
    priority3: 'Priority3',
    dnsurl: 'DNSURL',
  };

  // Action Items / Updates' collapsed-by-default state shows only the first
  // few dated entries (plus any date-less continuation lines bundled in
  // before the next real date) - "See All" reveals the rest. Counts only
  // real dated lines toward this limit; a continuation line never gets cut
  // off mid-entry.
  public static readonly MAX_VISIBLE_ACTION_ITEMS_DATES: number = 3;

  // Starting point only - every one of these is user-resizable (dragging a
  // header's right edge) and persists via EnvironmentOverviewColumnWidthService,
  // which is why these aren't Tailwind max-w-* classes anymore: a fixed CSS cap
  // would fight a user-dragged width wider than it.
  public static readonly DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
    environment: 180,
    purpose: 260,
    sponsor: 140,
    currentUptimeSchedule: 220,
    priority1: 200,
    priority2: 200,
    priority3: 200,
    configurationCustomisationVersion: 200,
    dnsurl: 220,
    actionItemsUpdates: 420,
    status: 110,
  };

  // Styling for the "Add Environment" draft row's inline inputs/textarea -
  // dashed underline while unfocused, solid brand-blue while focused,
  // matching the rest of the table's spare, borderless aesthetic.
  public static readonly DRAFT_INPUT_CLASS_NAME: string =
    'w-full bg-transparent border-b border-dashed border-[#0C2086]/30 dark:border-blue-400/40 focus:border-solid focus:border-[#0C2086] dark:focus:border-blue-400 focus:outline-none font-mono text-xs text-slate-700 dark:text-zinc-300 py-0.5 placeholder:text-slate-300 dark:placeholder:text-zinc-700';

  public static readonly EMPTY_DRAFT_ROW: DraftEnvironmentOverviewRowInterfaceModel = {
    environment: '',
    purpose: '',
    sponsor: '',
    currentUptimeSchedule: '',
    priority1: '',
    priority2: '',
    priority3: '',
    configurationCustomisationVersion: '',
    dnsurl: '',
    actionItemsUpdates: '',
  };
}
