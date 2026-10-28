import type EnvironmentOverviewInterfaceModel from '../../../Models/EnvironmentOverviewInterfaceModel';
import type EnvironmentOverviewCustomColumnInterfaceModel from '../../../Models/EnvironmentOverviewCustomColumnInterfaceModel';

// Column order and labels mirror the CSV's own column headers verbatim (per
// the naming rule: UI-facing text is exempt from the project's code-
// identifier naming conventions) - see ResourceColumnCON for the same
// pattern on the Resources table.
export interface EnvironmentOverviewColumnDef {
  key: keyof EnvironmentOverviewInterfaceModel;
  label: string;
  locked?: boolean;
}

// The table's actual render-time column list is this merged type, not
// EnvironmentOverviewColumnDef alone - one fixed column (key stays a real
// EnvironmentOverviewInterfaceModel property name) or one custom column
// (key is that column's own Guid id) sitting side by side in one single,
// Position-sorted order. See
// EnvironmentOverviewScreenController's own mergedColumns useMemo for how
// FIXED_COLUMN_ANCHORS and each custom column's live Position combine into
// this one list.
export interface MergedEnvironmentOverviewColumnDef {
  key: string;
  label: string;
  locked?: boolean;
  isCustom: boolean;
  customColumn?: EnvironmentOverviewCustomColumnInterfaceModel;
  position: number;
}

export default class EnvironmentOverviewCON {
  // One entry per real text column, in table order - the one thing NOT in
  // this list is the derived "Status" column (Live/Decommissioned),
  // appended separately since it isn't itself a stored string field. Kept
  // separate from COLUMNS below (rather than COLUMNS.filter(...)) since
  // EDITABLE_TEXT_FIELD_NAMES below only ever applies to this subset, never
  // to Action Items/Status.
  public static readonly TEXT_COLUMNS: EnvironmentOverviewColumnDef[] = [
    { key: 'environment', label: 'ENVIRONMENT', locked: true },
    { key: 'purpose', label: 'PURPOSE' },
    { key: 'sponsor', label: 'SPONSOR' },
    { key: 'currentUptimeSchedule', label: 'CURRENT UPTIME SCHEDULE' },
    { key: 'priority1', label: 'PRIORITY 1' },
    { key: 'priority2', label: 'PRIORITY 2' },
    { key: 'priority3', label: 'PRIORITY 3' },
    { key: 'configurationCustomisationVersion', label: 'CONFIGURATION & CUSTOMISATION VERSION' },
    { key: 'dnsurl', label: 'DNS URL' },
  ];

  // The full table's column order for the Columns visibility dropdown (and
  // for computing dynamic table-selection indexes once some are hidden) -
  // TEXT_COLUMNS plus the two specially-rendered columns appended last,
  // matching their fixed position in the table today. Not hand-maintained
  // separately from TEXT_COLUMNS - a class static property can read an
  // earlier static property of the same class during initialization.
  public static readonly COLUMNS: EnvironmentOverviewColumnDef[] = [
    ...EnvironmentOverviewCON.TEXT_COLUMNS,
    { key: 'actionItemsUpdates', label: 'Action Items / Updates' },
    { key: 'status', label: 'Status' },
  ];

  public static readonly ALL_COLUMN_KEYS: string[] = EnvironmentOverviewCON.COLUMNS.map((column) => column.key);

  // Mirrors the backend's own FixedColumnAnchors exactly (both sides are
  // hand-kept in sync, same pattern as EDITABLE_TEXT_FIELD_NAMES already
  // being duplicated frontend/backend) - lets a custom column's own
  // Position value be merged into one single, correctly-ordered column list
  // alongside these fixed ones. Widely spaced so a custom column can always
  // slot in via a midpoint without ever colliding.
  public static readonly FIXED_COLUMN_ANCHORS: Record<string, number> = {
    environment: 1000,
    purpose: 2000,
    sponsor: 3000,
    currentUptimeSchedule: 4000,
    priority1: 5000,
    priority2: 6000,
    priority3: 7000,
    configurationCustomisationVersion: 8000,
    dnsurl: 9000,
    actionItemsUpdates: 10000,
    status: 11000,
  };

  public static readonly LOCKED_COLUMN_KEYS: Set<string> = new Set(
    EnvironmentOverviewCON.COLUMNS.filter((column) => column.locked).map((column) => column.key)
  );

  public static readonly CELL_CLASS_NAME: string =
    'px-3 py-2 align-top whitespace-pre-wrap break-words font-mono text-slate-700 dark:text-zinc-300';

  // The only TEXT_COLUMNS keys Edit Mode lets a user type into directly -
  // Sponsor, Current Uptime Schedule and Configuration & Customisation
  // Version aren't part of this request and keep their read-only rendering
  // (Sponsor has its own bespoke cell renderer - see renderSponsorCell -
  // even though it shares this same backend endpoint). Maps each editable
  // key to the PascalCase FieldName the backend's generic PUT /{id}/Field
  // endpoint expects (see EnvironmentOverviewAssertion.AssertUpdateFieldRequest
  // on the backend for the matching allow-list).
  public static readonly EDITABLE_TEXT_FIELD_NAMES: Partial<Record<keyof EnvironmentOverviewInterfaceModel, string>> = {
    environment: 'Environment',
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

  // Shared styling for every inline-editable input on this table - the
  // dashed-until-focused underline treatment, used by editable fixed-column
  // cells, custom-column cells, and a freshly inserted row/column's own
  // rename input.
  public static readonly DRAFT_INPUT_CLASS_NAME: string =
    'w-full bg-transparent border-b border-dashed border-[#0C2086]/30 dark:border-blue-400/40 focus:border-solid focus:border-[#0C2086] dark:focus:border-blue-400 focus:outline-none font-mono text-xs text-slate-700 dark:text-zinc-300 py-0.5 placeholder:text-slate-300 dark:placeholder:text-zinc-700';
}
