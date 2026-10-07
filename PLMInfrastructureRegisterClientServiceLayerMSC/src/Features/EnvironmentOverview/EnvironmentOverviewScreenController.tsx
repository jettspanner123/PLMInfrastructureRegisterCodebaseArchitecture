import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ServerOff, FilterX } from 'lucide-react';
import DataTableContainerSharedComponent from '../../Shared/Components/DataTableContainerSharedComponent';
import TableHeaderCellSharedComponent from '../../Shared/Components/TableHeaderCellSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ExpandableSearchSharedComponent from '../../Shared/Components/ExpandableSearchSharedComponent';
import CopyableTableCellSharedComponent from '../../Shared/Components/CopyableTableCellSharedComponent';
import PrimaryActionButtonSharedComponent from '../../Shared/Components/PrimaryActionButtonSharedComponent';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import TableSelectionService from '../../Services/TableSelectionService';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import EnvironmentOverviewColumnWidthService from './Services/EnvironmentOverviewColumnWidthService';
import EnvironmentOverviewCON, { type EnvironmentOverviewColumnDef } from './Constants/EnvironmentOverviewCON';
import type EnvironmentOverviewInterfaceModel from '../../Models/EnvironmentOverviewInterfaceModel';
import type DraftEnvironmentOverviewRowInterfaceModel from '../../Models/DraftEnvironmentOverviewRowInterfaceModel';
import type CreateEnvironmentOverviewRequestInterfaceModel from '../../Models/CreateEnvironmentOverviewRequestInterfaceModel';

export default function EnvironmentOverviewScreenController(): React.JSX.Element {
  const { data: environments = [], isLoading } =
    TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draftRow, setDraftRow] = useState<DraftEnvironmentOverviewRowInterfaceModel | null>(null);
  const [isDraftInvalid, setIsDraftInvalid] = useState<boolean>(false);
  const environmentInputRef = useRef<HTMLInputElement | null>(null);

  const filteredEnvironments = useMemo(() => {
    const lowerCaseQuery = searchQuery.trim().toLowerCase();
    if (!lowerCaseQuery) return environments;

    return environments.filter((environment) =>
      [
        ...EnvironmentOverviewCON.TEXT_COLUMNS.map((column) => environment[column.key]),
        environment.actionItemsUpdates,
        environment.isDecommissioned ? 'Decommissioned' : 'Live',
      ].some((value) => typeof value === 'string' && value.toLowerCase().includes(lowerCaseQuery))
    );
  }, [environments, searchQuery]);

  // Excel-like multi-cell/row/column selection, shared with Resources and
  // Configure Subscriptions - see TableSelectionService.ts for the full
  // design. Column indexes follow TEXT_COLUMNS, then Action Items, then
  // Status. The draft row below is deliberately NOT part of this - it has
  // real inputs instead of copyable cells, so it isn't selectable/copyable.
  const tableSelection = TableSelectionService.current.useTableSelection({
    rowCount: filteredEnvironments.length,
    columnCount: EnvironmentOverviewCON.TOTAL_COLUMN_COUNT,
    getCellValue: (rowIndex, colIndex) => {
      const environment = filteredEnvironments[rowIndex];
      if (!environment) return '';
      if (colIndex === EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX) return environment.actionItemsUpdates ?? '';
      if (colIndex === EnvironmentOverviewCON.STATUS_COLUMN_INDEX)
        return environment.isDecommissioned ? 'Decommissioned' : 'Live';
      return environment[EnvironmentOverviewCON.TEXT_COLUMNS[colIndex].key]?.toString() ?? '';
    },
  });

  // Excel-style draggable column borders, persisted to localStorage - see
  // EnvironmentOverviewColumnWidthService.ts. Scoped to this one table for
  // now, not a cross-table service like TableSelectionService.
  const columnWidths = EnvironmentOverviewColumnWidthService.current.useColumnWidths(
    EnvironmentOverviewCON.DEFAULT_COLUMN_WIDTHS
  );

  const createMutation = TanstackQueryClientService.current.environmentOverview.useCreateEnvironmentOverviewMutation({
    onSuccess: () => {
      setDraftRow(null);
      setIsDraftInvalid(false);
    },
  });

  // Scrolls to and focuses the draft row the moment it's added - keyed on a
  // boolean (not the draft object itself), since the object gets a new
  // reference on every keystroke and re-scrolling/re-focusing mid-typing
  // would be disruptive. Works in both bounded Table Height modes (scrolls
  // the table's own container) and Extended mode (scrolls the page via
  // scrollIntoView), without needing to know which mode is active.
  const hasDraftRow = draftRow !== null;
  useEffect(() => {
    if (!hasDraftRow) return;
    const container = tableSelection.containerRef.current;
    if (container) {
      if (container.scrollHeight > container.clientHeight) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      } else {
        container.scrollIntoView({ block: 'end', behavior: 'smooth' });
      }
    }
    environmentInputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraftRow]);

  const handleAddEnvironmentClick = (): void => {
    // A second click while a draft is already pending just refocuses it
    // rather than creating a second one.
    if (draftRow) {
      environmentInputRef.current?.focus();
      return;
    }
    setDraftRow(EnvironmentOverviewCON.EMPTY_DRAFT_ROW);
  };

  const handleDraftFieldChange = (field: keyof DraftEnvironmentOverviewRowInterfaceModel, value: string): void => {
    setDraftRow((previous) => (previous ? { ...previous, [field]: value } : previous));
    if (field === 'environment' && isDraftInvalid) setIsDraftInvalid(false);
  };

  const handleDiscardDraft = (): void => {
    setDraftRow(null);
    setIsDraftInvalid(false);
  };

  const handleSaveDraft = (): void => {
    if (!draftRow) return;
    if (!draftRow.environment.trim()) {
      setIsDraftInvalid(true);
      environmentInputRef.current?.focus();
      return;
    }

    const request: CreateEnvironmentOverviewRequestInterfaceModel = {
      environment: draftRow.environment.trim(),
      purpose: draftRow.purpose || null,
      sponsor: draftRow.sponsor || null,
      currentUptimeSchedule: draftRow.currentUptimeSchedule || null,
      priority1: draftRow.priority1 || null,
      priority2: draftRow.priority2 || null,
      priority3: draftRow.priority3 || null,
      actionItemsUpdates: draftRow.actionItemsUpdates || null,
      configurationCustomisationVersion: draftRow.configurationCustomisationVersion || null,
      dnsurl: draftRow.dnsurl || null,
    };
    createMutation.mutate(request);
  };

  // Escape discards the draft; Ctrl/Cmd+Enter saves it. stopPropagation on
  // both stops them from also reaching TableSelectionService's own document-
  // level Escape handler (which would just clear the table selection - a
  // harmless no-op here, but there's no reason to let it fire at all while
  // editing a draft field).
  const handleDraftKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      handleDiscardDraft();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.stopPropagation();
      handleSaveDraft();
    }
  };

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
    column: EnvironmentOverviewColumnDef,
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
          className={EnvironmentOverviewCON.CELL_CLASS_NAME}
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
        className={EnvironmentOverviewCON.CELL_CLASS_NAME}
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
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX);

    return (
      <td
        key="actionItemsUpdates"
        onMouseDown={cellHandlers.onMouseDown}
        onMouseEnter={cellHandlers.onMouseEnter}
        style={{
          boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX),
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
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, EnvironmentOverviewCON.STATUS_COLUMN_INDEX);
    const statusText = environment.isDecommissioned ? 'Decommissioned' : 'Live';

    return (
      <CopyableTableCellSharedComponent
        key="status"
        value={statusText}
        ariaLabel={`Copy Status: ${statusText}`}
        className="px-3 py-2 align-top font-mono text-[11px]"
        selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, EnvironmentOverviewCON.STATUS_COLUMN_INDEX)}
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

  const renderDraftTextCell = (column: EnvironmentOverviewColumnDef): React.ReactNode => {
    const columnWidth = columnWidths.getColumnWidth(column.key);
    const isEnvironmentColumn = column.key === 'environment';
    const fieldKey = column.key as keyof DraftEnvironmentOverviewRowInterfaceModel;

    return (
      <td key={column.key} style={{ width: columnWidth }} className="px-3 py-2 align-top">
        <input
          ref={isEnvironmentColumn ? environmentInputRef : undefined}
          type="text"
          name={`draft-${fieldKey}`}
          aria-label={column.label}
          value={draftRow?.[fieldKey] ?? ''}
          onChange={(event) => handleDraftFieldChange(fieldKey, event.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder={isEnvironmentColumn ? 'Environment name…' : '—'}
          className={`${EnvironmentOverviewCON.DRAFT_INPUT_CLASS_NAME} ${
            isEnvironmentColumn && isDraftInvalid ? '!border-red-400 dark:!border-red-500' : ''
          }`}
        />
      </td>
    );
  };

  const renderDraftActionItemsCell = (): React.ReactNode => (
    <td
      key="actionItemsUpdates"
      style={{ width: columnWidths.getColumnWidth('actionItemsUpdates') }}
      className="px-3 py-2 align-top"
    >
      <textarea
        name="draft-actionItemsUpdates"
        aria-label="Action Items / Updates"
        value={draftRow?.actionItemsUpdates ?? ''}
        onChange={(event) => handleDraftFieldChange('actionItemsUpdates', event.target.value)}
        onKeyDown={handleDraftKeyDown}
        placeholder="—"
        rows={3}
        className={`${EnvironmentOverviewCON.DRAFT_INPUT_CLASS_NAME} resize-y text-[11px] leading-relaxed`}
      />
    </td>
  );

  const renderDraftStatusCell = (): React.ReactNode => (
    <td
      key="status"
      style={{ width: columnWidths.getColumnWidth('status') }}
      className="px-3 py-2 align-top font-mono text-[11px]"
    >
      <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
        Live
      </span>
    </td>
  );

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
          <PrimaryActionButtonSharedComponent label="Add Environment" onClick={handleAddEnvironmentClick} />
        </div>
      </div>

      {(environments.length > 0 || hasDraftRow) && (
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
                {EnvironmentOverviewCON.TEXT_COLUMNS.map((column, colIndex) => (
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
                  {...tableSelection.getColumnHeaderHandlers(EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX)}
                >
                  Action Items / Updates
                  {renderResizeHandle('actionItemsUpdates')}
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent
                  style={{ width: columnWidths.getColumnWidth('status'), position: 'relative' }}
                  {...tableSelection.getColumnHeaderHandlers(EnvironmentOverviewCON.STATUS_COLUMN_INDEX)}
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
                  {EnvironmentOverviewCON.TEXT_COLUMNS.map((column, colIndex) =>
                    renderTextCell(environment, column, rowIndex, colIndex)
                  )}
                  {renderActionItemsCell(environment, rowIndex)}
                  {renderStatusCell(environment, rowIndex)}
                </tr>
              ))}
              {draftRow && (
                <tr className="divide-x divide-slate-200 dark:divide-zinc-800 bg-blue-50/50 dark:bg-blue-500/10">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-300 dark:text-zinc-700 text-center align-top">
                    –
                  </td>
                  {EnvironmentOverviewCON.TEXT_COLUMNS.map((column) => renderDraftTextCell(column))}
                  {renderDraftActionItemsCell()}
                  {renderDraftStatusCell()}
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainerSharedComponent>
      )}

      {draftRow && (
        <div className="flex items-center justify-between px-1 -mt-2">
          <span className="text-[11px] font-mono">
            {isDraftInvalid ? (
              <span className="text-red-500 dark:text-red-400">Environment name is required.</span>
            ) : (
              <span className="text-slate-400 dark:text-zinc-500">Ctrl+Enter to save · Esc to discard</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <ButtonSharedComponent variant="ghost" size="sm" onClick={handleDiscardDraft}>
              Cancel
            </ButtonSharedComponent>
            <PrimaryActionButtonSharedComponent
              label="Done"
              onClick={handleSaveDraft}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>
      )}

      {environments.length > 0 && filteredEnvironments.length === 0 && (
        <EmptyStateSharedComponent
          icon={<FilterX className="w-6 h-6" />}
          title="No matching Environments"
          description="No environment matches the current search."
        />
      )}

      {!isLoading && environments.length === 0 && !hasDraftRow && (
        <EmptyStateSharedComponent
          icon={<ServerOff className="w-6 h-6" />}
          title="No Environments yet"
          description="Nothing has been loaded into the Environment Overview table yet."
        />
      )}
    </div>
  );
}
