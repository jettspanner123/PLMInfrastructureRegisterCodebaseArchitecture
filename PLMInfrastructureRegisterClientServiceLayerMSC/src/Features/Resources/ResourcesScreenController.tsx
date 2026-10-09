import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, Columns3, ServerOff, FilterX, Bold, Italic, X, Plus } from 'lucide-react';
import DataTableContainerSharedComponent from '../../Shared/Components/DataTableContainerSharedComponent';
import TableHeaderCellSharedComponent from '../../Shared/Components/TableHeaderCellSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../Shared/Components/CustomSelectSharedComponent';
import ExpandableSearchSharedComponent from '../../Shared/Components/ExpandableSearchSharedComponent';
import ViewEditModeToggleSharedComponent from '../../Shared/Components/ViewEditModeToggleSharedComponent';
import ChatAssistantSharedComponent from '../../Shared/Components/ChatAssistantSharedComponent';
import CopyableTableCellSharedComponent from '../../Shared/Components/CopyableTableCellSharedComponent';
import ContextMenuSharedComponent, { type ContextMenuItem } from '../../Shared/Components/ContextMenuSharedComponent';
import ApplicationUserPreferenceUtility from '../../Utilities/ApplicationUserPreferenceUtility';
import ApplicationUserPreferenceKeyCON from '../../Constants/ApplicationUserPreferenceKeyCON';
import ViewEditModeCON from '../../Constants/ViewEditModeCON';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import TableSelectionService from '../../Services/TableSelectionService';
import type ResourceInterfaceModel from '../../Models/ResourceInterfaceModel';
import type ResourceCellFormatTargetInterfaceModel from '../../Models/ResourceCellFormatTargetInterfaceModel';
import ResourceColumnCON, { type ResourceColumnDef } from './Constants/ResourceColumnCON';
import ResourceCellFormatCON from './Constants/ResourceCellFormatCON';
import ResourceTableUtility from './Utilities/ResourceTableUtility';
import ColumnVisibilityDropdownStaticComponent from './Components/static/ColumnVisibilityDropdownStaticComponent';
import AddCustomColorModalController from './Components/AddCustomColorModalController';

export default function ResourcesScreenController(): React.JSX.Element {
  const { data: resources = [], isLoading } = TanstackQueryClientService.current.resources.useResourcesQuery();

  // Lifted (not self-contained) specifically because right-click cell
  // formatting needs to know whether Edit Mode is active - this screen had
  // nothing to react to it before now, see ViewEditModeToggleSharedComponent's
  // own doc comment.
  const [editMode, setEditMode] = useState<string>(ViewEditModeCON.VIEW);
  const isEditMode = editMode === ViewEditModeCON.EDIT;

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

  // Right-click cell formatting (bold/italic/background color) - Edit-Mode
  // gated, the first real behavior this screen has ever had react to that
  // toggle. Formats are fetched as their own flat list and merged in here by
  // "<resourceId>:<columnKey>", independent of GetAllResources entirely.
  const { data: cellFormats = [] } = TanstackQueryClientService.current.resources.useResourceCellFormatsQuery();
  const cellFormatByKey = useMemo(() => {
    const map = new Map<string, { isBold: boolean; isItalic: boolean; backgroundColorKey: string | null }>();
    cellFormats.forEach((format) => {
      map.set(`${format.resourceId}:${format.columnKey}`, {
        isBold: format.isBold,
        isItalic: format.isItalic,
        backgroundColorKey: format.backgroundColorKey,
      });
    });
    return map;
  }, [cellFormats]);

  const updateCellFormatMutation = TanstackQueryClientService.current.resources.useUpdateResourceCellFormatMutation();

  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // Custom colors a user has added via "Add Color" - growable, shared
  // across every table that ever gets this feature (not just Resources),
  // stored the same way Status/Sponsor's own option lists are.
  const { data: customColors = [] } =
    TanstackQueryClientService.current.configurationConstants.useOptionsQuery('ResourceCellFormatColor');
  const [isAddColorModalOpen, setIsAddColorModalOpen] = useState<boolean>(false);

  // Every (resourceId, columnKey) pair the current selection rectangle
  // covers - computed fresh each time rather than captured once when the
  // menu opened, so it always reflects whatever selectCell/drag last set.
  const getSelectedCellTargets = (): ResourceCellFormatTargetInterfaceModel[] => {
    const selection = tableSelection.selection;
    if (!selection) return [];

    const targets: ResourceCellFormatTargetInterfaceModel[] = [];
    for (let row = selection.startRow; row <= selection.endRow; row++) {
      const resource = filteredResources[row];
      if (!resource) continue;
      for (let col = selection.startCol; col <= selection.endCol; col++) {
        const column = visibleColumns[col];
        if (!column) continue;
        targets.push({ resourceId: resource.id, columnKey: column.key });
      }
    }
    return targets;
  };

  // Excel-like: right-clicking a cell that isn't already part of the
  // current selection selects just that one cell first; right-clicking
  // inside an existing multi-cell selection keeps all of it. Does nothing
  // outside Edit Mode - the native browser menu shows as normal.
  const handleCellContextMenu = (event: React.MouseEvent, rowIndex: number, colIndex: number): void => {
    if (!isEditMode) return;
    event.preventDefault();

    if (!tableSelection.isCellSelected(rowIndex, colIndex)) {
      tableSelection.selectCell(rowIndex, colIndex);
    }

    setContextMenu({ isOpen: true, x: event.clientX, y: event.clientY });
  };

  const handleCloseContextMenu = (): void => {
    setContextMenu((previous) => ({ ...previous, isOpen: false }));
  };

  // Word-processor convention for a selection with mixed existing state: if
  // any targeted cell doesn't already have the attribute, turn it ON for
  // every targeted cell; only turn it OFF for all of them once every one
  // already has it.
  const isEveryTargetAlready = (targets: ResourceCellFormatTargetInterfaceModel[], key: 'isBold' | 'isItalic'): boolean =>
    targets.length > 0 && targets.every((target) => cellFormatByKey.get(`${target.resourceId}:${target.columnKey}`)?.[key] === true);

  const handleToggleBold = (): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    updateCellFormatMutation.mutate({ cells: targets, isBold: !isEveryTargetAlready(targets, 'isBold') });
  };

  const handleToggleItalic = (): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    updateCellFormatMutation.mutate({ cells: targets, isItalic: !isEveryTargetAlready(targets, 'isItalic') });
  };

  const handleSetColor = (colorKey: string): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    updateCellFormatMutation.mutate({ cells: targets, backgroundColorKey: colorKey });
  };

  const handleClearColor = (): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    updateCellFormatMutation.mutate({ cells: targets, clearBackgroundColor: true });
  };

  // Built fresh on every render (not memoized) - it must reflect whichever
  // cells are selected right now, which changes between the right-click
  // that opens the menu and whichever item the user actually clicks.
  const contextMenuTargets = getSelectedCellTargets();
  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'bold',
      label: 'Bold',
      icon: <Bold className="w-3.5 h-3.5" />,
      onClick: handleToggleBold,
      shortcut: isEveryTargetAlready(contextMenuTargets, 'isBold') ? '✓' : undefined,
    },
    {
      id: 'italic',
      label: 'Italic',
      icon: <Italic className="w-3.5 h-3.5" />,
      onClick: handleToggleItalic,
      shortcut: isEveryTargetAlready(contextMenuTargets, 'isItalic') ? '✓' : undefined,
    },
    ...ResourceCellFormatCON.COLORS.map((color, index) => ({
      id: `color-${color.key}`,
      label: color.label,
      // inline-block, not the bare default (inline) a <span> gets otherwise
      // - width/height are no-ops on an inline box with no text content, so
      // without it this collapses to 0x0 and the color never actually
      // shows, unlike Bold/Italic's own <svg> icons (a replaced element,
      // which respects width/height even while still display:inline).
      icon: (
        <span
          className={`inline-block w-3.5 h-3.5 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10 ${color.swatchClassName}`}
        />
      ),
      onClick: () => handleSetColor(color.key),
      divider: index === 0,
    })),
    // Custom (hex) colors - same icon treatment as the 4 fixed ones, just
    // an inline style instead of a Tailwind class, since the hex value only
    // exists at runtime.
    ...customColors.map((hex) => ({
      id: `color-${hex}`,
      label: hex,
      icon: (
        <span
          className="inline-block w-3.5 h-3.5 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10"
          style={ResourceCellFormatCON.getSwatchStyle(hex)}
        />
      ),
      onClick: () => handleSetColor(hex),
    })),
    {
      id: 'add-color',
      label: 'Add Color',
      icon: <Plus className="w-3.5 h-3.5" />,
      onClick: () => setIsAddColorModalOpen(true),
    },
    {
      id: 'clear-color',
      label: 'Clear Color',
      icon: <X className="w-3.5 h-3.5" />,
      onClick: handleClearColor,
      divider: true,
    },
  ];

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

    const format = cellFormatByKey.get(`${resource.id}:${column.key}`);
    const formatClassName = format
      ? `${format.isBold ? 'font-bold' : ''} ${format.isItalic ? 'italic' : ''} ${ResourceCellFormatCON.getCellClassName(format.backgroundColorKey)}`
      : '';
    const cellClassName = `${CELL_CLASS_NAME} ${formatClassName}`;
    // Only a custom (hex) color needs this - the 4 fixed colors are fully
    // handled by formatClassName's Tailwind classes above.
    const formatStyle = ResourceCellFormatCON.getCellStyle(format?.backgroundColorKey);
    const onCellContextMenu = (event: React.MouseEvent): void => handleCellContextMenu(event, rowIndex, colIndex);

    if (displayValue === null) {
      return (
        <td
          key={column.key}
          onMouseDown={cellHandlers.onMouseDown}
          onMouseEnter={cellHandlers.onMouseEnter}
          onContextMenu={onCellContextMenu}
          style={{ boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex), ...formatStyle }}
          className={cellClassName}
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
        className={cellClassName}
        buttonStyle={formatStyle}
        selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex)}
        onCellMouseDown={cellHandlers.onMouseDown}
        onCellMouseEnter={cellHandlers.onMouseEnter}
        onCellContextMenu={onCellContextMenu}
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
          <ViewEditModeToggleSharedComponent value={editMode} onChange={setEditMode} />

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

      <ContextMenuSharedComponent
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={handleCloseContextMenu}
        items={contextMenuItems}
      />

      <AddCustomColorModalController
        isOpen={isAddColorModalOpen}
        onClose={() => setIsAddColorModalOpen(false)}
        onCreated={() => {}}
      />
    </div>
  );
}
