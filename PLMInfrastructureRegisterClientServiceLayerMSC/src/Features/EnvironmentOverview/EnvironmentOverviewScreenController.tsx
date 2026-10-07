import React, { useMemo, useState } from 'react';
import { ServerOff, FilterX } from 'lucide-react';
import DataTableContainerSharedComponent from '../../Shared/Components/DataTableContainerSharedComponent';
import TableHeaderCellSharedComponent from '../../Shared/Components/TableHeaderCellSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ExpandableSearchSharedComponent from '../../Shared/Components/ExpandableSearchSharedComponent';
import CopyableTableCellSharedComponent from '../../Shared/Components/CopyableTableCellSharedComponent';
import TableSelectionService from '../../Services/TableSelectionService';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import EnvironmentOverviewColumnWidthService from './Services/EnvironmentOverviewColumnWidthService';
import type EnvironmentOverviewInterfaceModel from '../../Models/EnvironmentOverviewInterfaceModel';

// One cell per real text column, in table order - the one thing NOT in this
// list is the derived "Status" column (Live/Decommissioned), appended
// separately since it isn't itself a stored string field.
const TEXT_COLUMNS: Array<{ key: keyof EnvironmentOverviewInterfaceModel; label: string }> = [
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
// 10,000 characters of dated log entries.
const ACTION_ITEMS_COLUMN_INDEX = TEXT_COLUMNS.length;
const STATUS_COLUMN_INDEX = TEXT_COLUMNS.length + 1;
const TOTAL_COLUMN_COUNT = TEXT_COLUMNS.length + 2;

const CELL_CLASS_NAME =
  'px-3 py-2 align-top whitespace-pre-wrap break-words font-mono text-slate-700 dark:text-zinc-300';

// Starting point only - every one of these is user-resizable (dragging a
// header's right edge) and persists via EnvironmentOverviewColumnWidthService,
// which is why these aren't Tailwind max-w-* classes anymore: a fixed CSS cap
// would fight a user-dragged width wider than it.
const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
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

export default function EnvironmentOverviewScreenController(): React.JSX.Element {
  const { data: environments = [], isLoading } =
    TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery();

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEnvironments = useMemo(() => {
    const lowerCaseQuery = searchQuery.trim().toLowerCase();
    if (!lowerCaseQuery) return environments;

    return environments.filter((environment) =>
      [
        ...TEXT_COLUMNS.map((column) => environment[column.key]),
        environment.actionItemsUpdates,
        environment.isDecommissioned ? 'Decommissioned' : 'Live',
      ].some((value) => typeof value === 'string' && value.toLowerCase().includes(lowerCaseQuery))
    );
  }, [environments, searchQuery]);

  // Excel-like multi-cell/row/column selection, shared with Resources and
  // Configure Subscriptions - see TableSelectionService.ts for the full
  // design. Column indexes follow TEXT_COLUMNS, then Action Items, then
  // Status.
  const tableSelection = TableSelectionService.current.useTableSelection({
    rowCount: filteredEnvironments.length,
    columnCount: TOTAL_COLUMN_COUNT,
    getCellValue: (rowIndex, colIndex) => {
      const environment = filteredEnvironments[rowIndex];
      if (!environment) return '';
      if (colIndex === ACTION_ITEMS_COLUMN_INDEX) return environment.actionItemsUpdates ?? '';
      if (colIndex === STATUS_COLUMN_INDEX) return environment.isDecommissioned ? 'Decommissioned' : 'Live';
      return environment[TEXT_COLUMNS[colIndex].key]?.toString() ?? '';
    },
  });

  // Excel-style draggable column borders, persisted to localStorage - see
  // EnvironmentOverviewColumnWidthService.ts. Scoped to this one table for
  // now, not a cross-table service like TableSelectionService.
  const columnWidths = EnvironmentOverviewColumnWidthService.current.useColumnWidths(DEFAULT_COLUMN_WIDTHS);

  // A thin drag handle straddling a header's right border - the hit zone is
  // deliberately much wider (16px, 8 on each side of the true border) than
  // the visible line (1-2px), since a pixel-perfect hit zone is frustrating
  // to grab; only the thin inner line is actually drawn, so the extra width
  // costs nothing visually. Transparent until hovered (subtle line) or
  // actively dragged (brighter, thicker line), matching Excel's own "only
  // show it when it matters" treatment.
  const renderResizeHandle = (columnKey: string): React.ReactNode => {
    const isResizing = columnWidths.resizingColumnKey === columnKey;
    return (
      <div
        onMouseDown={(event) => {
          // Stops this from also bubbling into the header's own mousedown
          // (TableSelectionService's column-select-by-header-click) - same
          // reason the Environment column's filter dropdown does this.
          // Without it, every resize drag also started a column selection.
          event.stopPropagation();
          columnWidths.getResizeHandleProps(columnKey).onMouseDown(event);
        }}
        className="absolute inset-y-0 -right-2 w-4 cursor-col-resize select-none z-10 group/resize"
      >
        <div
          className={`absolute inset-y-0 right-2 transition-colors ${
            isResizing ? 'w-0.5 bg-blue-300' : 'w-px bg-transparent group-hover/resize:bg-white/40'
          }`}
        />
      </div>
    );
  };

  const renderTextCell = (
    environment: EnvironmentOverviewInterfaceModel,
    column: (typeof TEXT_COLUMNS)[number],
    rowIndex: number,
    colIndex: number
  ): React.ReactNode => {
    const displayValue = environment[column.key];
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, colIndex);

    const columnWidth = columnWidths.getColumnWidth(column.key);

    if (displayValue === null || displayValue === '') {
      return (
        <td
          key={column.key}
          onMouseDown={cellHandlers.onMouseDown}
          onMouseEnter={cellHandlers.onMouseEnter}
          style={{ boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex), width: columnWidth }}
          className={CELL_CLASS_NAME}
        >
          <span className="text-slate-300 dark:text-zinc-700">—</span>
        </td>
      );
    }

    const stringValue = displayValue.toString();

    return (
      <CopyableTableCellSharedComponent
        key={column.key}
        value={stringValue}
        ariaLabel={`Copy ${column.label}: ${stringValue}`}
        className={CELL_CLASS_NAME}
        selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex)}
        onCellMouseDown={cellHandlers.onMouseDown}
        onCellMouseEnter={cellHandlers.onMouseEnter}
        verticalAlign="top"
        width={columnWidth}
      >
        {stringValue}
      </CopyableTableCellSharedComponent>
    );
  };

  const renderActionItemsCell = (
    environment: EnvironmentOverviewInterfaceModel,
    rowIndex: number
  ): React.ReactNode => {
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, ACTION_ITEMS_COLUMN_INDEX);

    return (
      <td
        key="actionItemsUpdates"
        onMouseDown={cellHandlers.onMouseDown}
        onMouseEnter={cellHandlers.onMouseEnter}
        style={{
          boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, ACTION_ITEMS_COLUMN_INDEX),
          width: columnWidths.getColumnWidth('actionItemsUpdates'),
        }}
        className="px-3 py-2 align-top"
      >
        {environment.actionItemsUpdates ? (
          <div className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-700 dark:text-zinc-300 pr-1">
            {environment.actionItemsUpdates}
          </div>
        ) : (
          <span className="text-slate-300 dark:text-zinc-700">—</span>
        )}
      </td>
    );
  };

  const renderStatusCell = (environment: EnvironmentOverviewInterfaceModel, rowIndex: number): React.ReactNode => {
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, STATUS_COLUMN_INDEX);
    const statusText = environment.isDecommissioned ? 'Decommissioned' : 'Live';

    return (
      <CopyableTableCellSharedComponent
        key="status"
        value={statusText}
        ariaLabel={`Copy Status: ${statusText}`}
        className="px-3 py-2 align-top font-mono text-[11px]"
        selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, STATUS_COLUMN_INDEX)}
        onCellMouseDown={cellHandlers.onMouseDown}
        onCellMouseEnter={cellHandlers.onMouseEnter}
        verticalAlign="top"
        width={columnWidths.getColumnWidth('status')}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              environment.isDecommissioned ? 'bg-slate-400 dark:bg-zinc-600' : 'bg-emerald-500'
            }`}
          />
          {statusText}
        </span>
      </CopyableTableCellSharedComponent>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <p role="status" aria-live="polite" className="sr-only">
        {searchQuery.trim() ? `${filteredEnvironments.length} Environments match "${searchQuery.trim()}"` : ''}
      </p>

      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">
            Environment Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Purpose, ownership, and status for every environment in this register.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExpandableSearchSharedComponent
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search environments…"
            ariaLabel="Search Environment Overview"
          />
        </div>
      </div>

      {environments.length > 0 && (
        <DataTableContainerSharedComponent ref={tableSelection.containerRef}>
          {/* table-fixed is load-bearing, not cosmetic: under the default
              auto layout, an explicit per-cell width is only a soft hint —
              once every column's hinted width is summed past the table's
              own w-full cap, the browser freely compresses whichever
              columns CAN wrap (all of them, since every cell here uses
              whitespace-pre-wrap) right down toward their minimum
              content width (effectively their longest unbreakable word),
              silently ignoring the drag-resized width entirely. Fixed
              layout makes the first row's widths authoritative instead. */}
          <table className="w-full table-fixed border-collapse text-xs">
            <thead>
              <tr className="divide-x divide-white/10">
                <TableHeaderCellSharedComponent align="center" className="w-12">
                  SL. NO
                </TableHeaderCellSharedComponent>
                {TEXT_COLUMNS.map((column, colIndex) => (
                  <TableHeaderCellSharedComponent
                    key={column.key}
                    style={{ width: columnWidths.getColumnWidth(column.key), position: 'relative' }}
                    {...tableSelection.getColumnHeaderHandlers(colIndex)}
                  >
                    {column.label}
                    {renderResizeHandle(column.key)}
                  </TableHeaderCellSharedComponent>
                ))}
                <TableHeaderCellSharedComponent
                  style={{ width: columnWidths.getColumnWidth('actionItemsUpdates'), position: 'relative' }}
                  {...tableSelection.getColumnHeaderHandlers(ACTION_ITEMS_COLUMN_INDEX)}
                >
                  Action Items / Updates
                  {renderResizeHandle('actionItemsUpdates')}
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent
                  style={{ width: columnWidths.getColumnWidth('status'), position: 'relative' }}
                  {...tableSelection.getColumnHeaderHandlers(STATUS_COLUMN_INDEX)}
                >
                  Status
                  {renderResizeHandle('status')}
                </TableHeaderCellSharedComponent>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredEnvironments.map((environment, rowIndex) => (
                <tr key={environment.id} className="divide-x divide-slate-200 dark:divide-zinc-800">
                  <td
                    {...tableSelection.getRowHeaderHandlers(rowIndex)}
                    className="whitespace-nowrap px-3 py-2 font-mono text-slate-400 dark:text-zinc-500 text-center align-top cursor-pointer select-none"
                  >
                    {rowIndex + 1}
                  </td>
                  {TEXT_COLUMNS.map((column, colIndex) => renderTextCell(environment, column, rowIndex, colIndex))}
                  {renderActionItemsCell(environment, rowIndex)}
                  {renderStatusCell(environment, rowIndex)}
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableContainerSharedComponent>
      )}

      {environments.length > 0 && filteredEnvironments.length === 0 && (
        <EmptyStateSharedComponent
          icon={<FilterX className="w-6 h-6" />}
          title="No matching Environments"
          description="No environment matches the current search."
        />
      )}

      {!isLoading && environments.length === 0 && (
        <EmptyStateSharedComponent
          icon={<ServerOff className="w-6 h-6" />}
          title="No Environments yet"
          description="Nothing has been loaded into the Environment Overview table yet."
        />
      )}
    </div>
  );
}
