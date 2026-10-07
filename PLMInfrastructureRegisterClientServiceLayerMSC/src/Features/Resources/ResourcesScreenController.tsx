import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, Columns3, ServerOff, FilterX } from 'lucide-react';
import DataTableContainerSharedComponent from '../../Shared/Components/DataTableContainerSharedComponent';
import TableHeaderCellSharedComponent from '../../Shared/Components/TableHeaderCellSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../Shared/Components/CustomSelectSharedComponent';
import ExpandableSearchSharedComponent from '../../Shared/Components/ExpandableSearchSharedComponent';
import ViewEditModeToggleSharedComponent from '../../Shared/Components/ViewEditModeToggleSharedComponent';
import ChatAssistantSharedComponent from '../../Shared/Components/ChatAssistantSharedComponent';
import CopyableTableCellSharedComponent from '../../Shared/Components/CopyableTableCellSharedComponent';
import ApplicationUserPreferenceUtility from '../../Utilities/ApplicationUserPreferenceUtility';
import ApplicationUserPreferenceKeyCON from '../../Constants/ApplicationUserPreferenceKeyCON';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import TableSelectionService from '../../Services/TableSelectionService';
import type ResourceInterfaceModel from '../../Models/ResourceInterfaceModel';
import ResourceColumnCON, { type ResourceColumnDef } from './Constants/ResourceColumnCON';
import ResourceTableUtility from './Utilities/ResourceTableUtility';
import ColumnVisibilityDropdownStaticComponent from './Components/static/ColumnVisibilityDropdownStaticComponent';

export default function ResourcesScreenController(): React.JSX.Element {
  const { data: resources = [], isLoading } = TanstackQueryClientService.current.resources.useResourcesQuery();

  const columnButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState<boolean>(false);

  const handleCloseColumnDropdown = (): void => {
    setIsColumnDropdownOpen(false);
    // Return focus to the trigger — standard disclosure-pattern behavior so
    // keyboard users don't lose their place when the panel closes.
    columnButtonRef.current?.focus();
  };
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(() => {
    const saved = ApplicationUserPreferenceUtility.current.getJSONPreference<string[]>(
      ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_VISIBLE_COLUMNS,
      ResourceColumnCON.ALL_COLUMN_KEYS
    );
    // Locked columns (Hostname, Environment) are always included, even if an
    // older persisted preference somehow excluded them.
    return ResourceTableUtility.current.withLockedColumnsIncluded(saved);
  });

  const handleToggleColumn = (key: string): void => {
    if (ResourceColumnCON.LOCKED_COLUMN_KEYS.has(key)) return;

    setVisibleColumnKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      ApplicationUserPreferenceUtility.current.setJSONPreference(
        ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_VISIBLE_COLUMNS,
        Array.from(next)
      );
      return next;
    });
  };

  const handleClearAllColumns = (): void => {
    // Deliberately in-memory only — unlike individual column toggles, this
    // bulk action does not touch the persisted preference, so a reload
    // brings back whatever was last actually saved, not this cleared state.
    setVisibleColumnKeys(new Set(ResourceColumnCON.LOCKED_COLUMN_KEYS));
  };

  const visibleColumns = ResourceColumnCON.COLUMNS.filter((column) => visibleColumnKeys.has(column.key));

  const [environmentFilter, setEnvironmentFilter] = useState<string>(
    () =>
      ApplicationUserPreferenceUtility.current.getPreference(
        ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_ENVIRONMENT_FILTER
      ) ?? ResourceColumnCON.ALL_ENVIRONMENTS_FILTER_VALUE
  );

  const handleEnvironmentFilterChange = (value: string): void => {
    setEnvironmentFilter(value);
    ApplicationUserPreferenceUtility.current.setPreference(
      ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_ENVIRONMENT_FILTER,
      value
    );
  };

  // Only ever offers tags actually present on at least one machine right now
  // - IG_ConfigurationConstantTBL's full approved list is the right source
  // for an edit dropdown later, but a filter listing tags nothing currently
  // has would just be dead options.
  const environmentFilterOptions: SelectOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    resources.forEach((resource) => {
      const tag = resource.environmentTag;
      if (!tag) return;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });

    const tagOptions: SelectOption[] = Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({
        value: tag,
        label: tag,
        sublabel: `${count} machine${count === 1 ? '' : 's'}`,
      }));

    return [
      { value: ResourceColumnCON.ALL_ENVIRONMENTS_FILTER_VALUE, label: 'All Environments' },
      ...tagOptions,
    ];
  }, [resources]);

  const environmentFilteredResources = useMemo(() => {
    if (environmentFilter === ResourceColumnCON.ALL_ENVIRONMENTS_FILTER_VALUE) return resources;
    return resources.filter((resource) => resource.environmentTag === environmentFilter);
  }, [resources, environmentFilter]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredResources = useMemo(() => {
    const lowerCaseQuery = searchQuery.trim().toLowerCase();
    if (!lowerCaseQuery) return environmentFilteredResources;
    return environmentFilteredResources.filter((resource) =>
      ResourceTableUtility.current.matchesSearchQuery(resource, visibleColumns, lowerCaseQuery)
    );
  }, [environmentFilteredResources, visibleColumns, searchQuery]);

  // Excel-like multi-cell/row/column selection, shared with Configure
  // Subscriptions - see TableSelectionService.ts for the full design.
  // Coordinates are positions within filteredResources/visibleColumns
  // (not tied to any resource's id or column key), so toggling column
  // visibility or filtering rows just changes what the grid addresses, the
  // same way it would in a real spreadsheet.
  const tableSelection = TableSelectionService.current.useTableSelection({
    rowCount: filteredResources.length,
    columnCount: visibleColumns.length,
    getCellValue: (rowIndex, colIndex) => {
      const resource = filteredResources[rowIndex];
      const column = visibleColumns[colIndex];
      if (!resource || !column) return '';
      return ResourceTableUtility.current.getDisplayValue(resource, column.key) ?? '';
    },
  });

  // Presentation only (wraps ResourceTableUtility's plain-data result,
  // dash-placeholder included) - kept local to this component, like
  // AssetSphere's own renderAssetCard, rather than promoted to module scope.
  // Empty cells render a plain <td> (nothing to copy); every other cell is
  // copy-on-click via CopyableTableCellSharedComponent.
  const CELL_CLASS_NAME = 'whitespace-nowrap px-3 py-2 font-mono text-slate-700 dark:text-zinc-300';

  const renderCell = (
    resource: ResourceInterfaceModel,
    column: ResourceColumnDef,
    rowIndex: number,
    colIndex: number
  ): React.ReactNode => {
    const displayValue = ResourceTableUtility.current.getDisplayValue(resource, column.key);
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, colIndex);

    if (displayValue === null) {
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

    return (
      <CopyableTableCellSharedComponent
        key={column.key}
        value={displayValue}
        ariaLabel={`Copy ${column.label}: ${displayValue}`}
        className={CELL_CLASS_NAME}
        selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex)}
        onCellMouseDown={cellHandlers.onMouseDown}
        onCellMouseEnter={cellHandlers.onMouseEnter}
      >
        {displayValue}
      </CopyableTableCellSharedComponent>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Screen-reader-only announcement: sighted users already see the
          table update as they type, but a live-filtering table gives no
          other signal to someone not looking at it. */}
      <p role="status" aria-live="polite" className="sr-only">
        {searchQuery.trim() ? `${filteredResources.length} Resources match "${searchQuery.trim()}"` : ''}
      </p>

      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">
            Infrastructure Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Azure Resources tracked by this register.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ViewEditModeToggleSharedComponent />

          <ExpandableSearchSharedComponent
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search visible columns…"
            ariaLabel="Search Resources"
          />

          <ChatAssistantSharedComponent />

          <div className="relative shrink-0">
            <button
              ref={columnButtonRef}
              type="button"
              onClick={() => setIsColumnDropdownOpen((previous) => !previous)}
              aria-haspopup="dialog"
              aria-expanded={isColumnDropdownOpen}
              aria-controls="column-visibility-dropdown-panel"
              className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hairline-border hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer text-xs font-semibold"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Columns</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
                  isColumnDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <ColumnVisibilityDropdownStaticComponent
              isOpen={isColumnDropdownOpen}
              onClose={handleCloseColumnDropdown}
              visibleColumnKeys={visibleColumnKeys}
              onToggleColumn={handleToggleColumn}
              onClearAll={handleClearAllColumns}
            />
          </div>
        </div>
      </div>

      {resources.length > 0 && (
        <DataTableContainerSharedComponent ref={tableSelection.containerRef}>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="divide-x divide-white/10">
                <TableHeaderCellSharedComponent align="center" className="w-12">
                  SL. NO
                </TableHeaderCellSharedComponent>
                {visibleColumns.map((column, colIndex) =>
                  column.key === ResourceColumnCON.ENVIRONMENT_COLUMN_KEY ? (
                    <TableHeaderCellSharedComponent
                      key={column.key}
                      className="!p-0"
                      {...tableSelection.getColumnHeaderHandlers(colIndex)}
                    >
                      {/* Stops its own mousedown from reaching the <th> above,
                          so a plain click here only opens the filter dropdown
                          instead of also starting a column-select drag.
                          Dragging/Shift+click THROUGH this header (not
                          starting on it) still extends a column selection
                          normally, since only mousedown is stopped here. */}
                      <div onMouseDown={(event) => event.stopPropagation()}>
                        <CustomSelectSharedComponent
                          value={environmentFilter}
                          options={environmentFilterOptions}
                          onChange={handleEnvironmentFilterChange}
                          size="sm"
                          className="w-full"
                          triggerClassName="!h-auto !w-full !bg-transparent dark:!bg-transparent !border-0 !rounded-none !px-3 !py-2.5 !text-white hover:!bg-white/10 !text-[10px] font-mono font-bold uppercase tracking-wider transition-colors !justify-start"
                          chevronClassName="!text-white/60"
                          dropdownClassName="!text-slate-700 dark:!text-zinc-300 normal-case tracking-normal font-sans"
                        />
                      </div>
                    </TableHeaderCellSharedComponent>
                  ) : (
                    <TableHeaderCellSharedComponent key={column.key} {...tableSelection.getColumnHeaderHandlers(colIndex)}>
                      {column.label}
                    </TableHeaderCellSharedComponent>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredResources.map((resource, rowIndex) => (
                <tr key={resource.id} className="divide-x divide-slate-200 dark:divide-zinc-800">
                  <td
                    {...tableSelection.getRowHeaderHandlers(rowIndex)}
                    className="data-table-row-header-cell whitespace-nowrap px-3 py-2 font-mono text-slate-400 dark:text-zinc-500 text-center select-none"
                  >
                    {rowIndex + 1}
                  </td>
                  {visibleColumns.map((column, colIndex) => renderCell(resource, column, rowIndex, colIndex))}
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableContainerSharedComponent>
      )}

      {resources.length > 0 && filteredResources.length === 0 && (
        <EmptyStateSharedComponent
          icon={<FilterX className="w-6 h-6" />}
          title="No matching Resources"
          description="No Resource matches the current Environment filter and/or search."
        />
      )}

      {!isLoading && resources.length === 0 && (
        <EmptyStateSharedComponent
          icon={<ServerOff className="w-6 h-6" />}
          title="No Resources yet"
          description="Sync hasn't run yet, so nothing has been discovered."
        />
      )}
    </div>
  );
}
