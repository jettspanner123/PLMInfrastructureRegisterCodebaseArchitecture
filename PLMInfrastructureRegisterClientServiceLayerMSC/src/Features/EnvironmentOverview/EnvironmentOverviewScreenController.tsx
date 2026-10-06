import React, { useMemo, useState } from 'react';
import { ServerOff, FilterX } from 'lucide-react';
import DataTableContainerSharedComponent from '../../Shared/Components/DataTableContainerSharedComponent';
import TableHeaderCellSharedComponent from '../../Shared/Components/TableHeaderCellSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ExpandableSearchSharedComponent from '../../Shared/Components/ExpandableSearchSharedComponent';
import CopyableTableCellSharedComponent from '../../Shared/Components/CopyableTableCellSharedComponent';
import TableSelectionService from '../../Services/TableSelectionService';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
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
  'px-3 py-2 align-top whitespace-pre-wrap break-words font-mono text-slate-700 dark:text-zinc-300 max-w-xs';

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

  const renderTextCell = (
    environment: EnvironmentOverviewInterfaceModel,
    column: (typeof TEXT_COLUMNS)[number],
    rowIndex: number,
    colIndex: number
  ): React.ReactNode => {
    const displayValue = environment[column.key];
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, colIndex);

    if (displayValue === null || displayValue === '') {
      return (
        <td
          key={column.key}
          onMouseDown={cellHandlers.onMouseDown}
          onMouseEnter={cellHandlers.onMouseEnter}
          style={{ boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex) }}
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
        style={{ boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, ACTION_ITEMS_COLUMN_INDEX) }}
        className="px-3 py-2 align-top min-w-[280px]"
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
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="divide-x divide-white/10">
                <TableHeaderCellSharedComponent align="center" className="w-12">
                  SL. NO
                </TableHeaderCellSharedComponent>
                {TEXT_COLUMNS.map((column, colIndex) => (
                  <TableHeaderCellSharedComponent key={column.key} {...tableSelection.getColumnHeaderHandlers(colIndex)}>
                    {column.label}
                  </TableHeaderCellSharedComponent>
                ))}
                <TableHeaderCellSharedComponent {...tableSelection.getColumnHeaderHandlers(ACTION_ITEMS_COLUMN_INDEX)}>
                  Action Items / Updates
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent {...tableSelection.getColumnHeaderHandlers(STATUS_COLUMN_INDEX)}>
                  Status
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
