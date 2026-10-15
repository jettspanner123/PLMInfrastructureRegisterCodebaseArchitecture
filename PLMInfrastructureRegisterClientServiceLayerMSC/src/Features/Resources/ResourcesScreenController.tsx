import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, Columns3, ServerOff, FilterX, Bold, Italic, Underline, Ban, Plus } from 'lucide-react';
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
import { useGlobalSearchRowJump } from '../../Services/GlobalSearchNavigationService';
import type ResourceInterfaceModel from '../../Models/ResourceInterfaceModel';
import type ResourceCellFormatTargetInterfaceModel from '../../Models/ResourceCellFormatTargetInterfaceModel';
import type ResourceCellFormatInterfaceModel from '../../Models/ResourceCellFormatInterfaceModel';
import ResourceColumnCON, { type ResourceColumnDef } from './Constants/ResourceColumnCON';
import CellFormatCON from '../../Constants/CellFormatCON';
import CellFormatHelper from '../../Utilities/CellFormatHelper';
import ResourceTableUtility from './Utilities/ResourceTableUtility';
import TableColumnVisibilityUtility from '../../Utilities/TableColumnVisibilityUtility';
import ColumnVisibilityDropdownSharedComponent from '../../Shared/Components/ColumnVisibilityDropdownSharedComponent';
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
    return TableColumnVisibilityUtility.current.withLockedColumnsIncluded(saved, ResourceColumnCON.LOCKED_COLUMN_KEYS);
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

  // One column per distinct "StartStop_*" Azure tag key actually present
  // across the currently-loaded resources - not a fixed list, since the set
  // of tag keys isn't known at compile time (see ResourceColumnCON.COLUMNS'
  // own comment on why these aren't declared there). Always shown, appended
  // after every other visible column - unlike the rest of the table, these
  // aren't part of the Columns-visibility toggle/hide mechanism yet.
  const dynamicStartStopColumns: ResourceColumnDef[] = useMemo(() => {
    const keys = new Set<string>();
    resources.forEach((resource) => {
      if (!resource.startStopTags) return;
      Object.keys(resource.startStopTags).forEach((key) => keys.add(key));
    });
    return Array.from(keys)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({ key, label: key }));
  }, [resources]);

  const visibleColumns = [
    ...ResourceColumnCON.COLUMNS.filter((column) => visibleColumnKeys.has(column.key)),
    ...dynamicStartStopColumns,
  ];

  // One entry per column in ResourceColumnCON.FILTERABLE_COLUMN_KEYS - an
  // empty array means "no filter, show every machine" (the multi-select's own
  // "All ___" row clears back to this), a non-empty array means "show rows
  // whose value for this column is one of these" (OR within the column, AND
  // across different columns' filters below).
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    ResourceColumnCON.FILTERABLE_COLUMN_KEYS.forEach((columnKey) => {
      const preferenceKey = ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_COLUMN_FILTER_KEYS[columnKey];
      initial[columnKey] = ApplicationUserPreferenceUtility.current.getJSONPreference<string[]>(preferenceKey, []);
    });
    return initial;
  });

  const handleColumnFilterChange = (columnKey: string, values: string[]): void => {
    setColumnFilters((previous) => ({ ...previous, [columnKey]: values }));
    const preferenceKey = ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_COLUMN_FILTER_KEYS[columnKey];
    ApplicationUserPreferenceUtility.current.setJSONPreference(preferenceKey, values);
  };

  // Only ever offers values actually present on at least one machine right
  // now - IG_ConfigurationConstantTBL's full approved list is the right
  // source for an edit dropdown later, but a filter listing values nothing
  // currently has would just be dead options.
  const columnFilterOptionsByKey: Record<string, SelectOption[]> = useMemo(() => {
    const result: Record<string, SelectOption[]> = {};
    ResourceColumnCON.FILTERABLE_COLUMN_KEYS.forEach((columnKey) => {
      const counts = new Map<string, number>();
      resources.forEach((resource) => {
        const displayValue = ResourceTableUtility.current.getDisplayValue(resource, columnKey);
        if (displayValue === null) return;
        counts.set(displayValue, (counts.get(displayValue) ?? 0) + 1);
      });
      result[columnKey] = Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([val, count]) => ({
          value: val,
          label: val,
          sublabel: `${count} machine${count === 1 ? '' : 's'}`,
        }));
    });
    return result;
  }, [resources]);

  const columnFilteredResources = useMemo(() => {
    const activeFilters = ResourceColumnCON.FILTERABLE_COLUMN_KEYS.map(
      (columnKey) => [columnKey, columnFilters[columnKey] ?? []] as const
    ).filter(([, values]) => values.length > 0);

    if (activeFilters.length === 0) return resources;

    return resources.filter((resource) =>
      activeFilters.every(([columnKey, values]) => {
        const displayValue = ResourceTableUtility.current.getDisplayValue(resource, columnKey);
        return displayValue !== null && values.includes(displayValue);
      })
    );
  }, [resources, columnFilters]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredResources = useMemo(() => {
    const lowerCaseQuery = searchQuery.trim().toLowerCase();
    if (!lowerCaseQuery) return columnFilteredResources;
    return columnFilteredResources.filter((resource) =>
      ResourceTableUtility.current.matchesSearchQuery(resource, visibleColumns, lowerCaseQuery)
    );
  }, [columnFilteredResources, visibleColumns, searchQuery]);

  // Jumped here from the global search modal (Ctrl/Cmd+K) - clears whatever
  // local filtering would otherwise hide the target row (this page's own
  // search query, every column filter) before scrolling to and flashing it.
  // Only touches local state, never any persisted filter preference itself -
  // a search jump shouldn't silently override what the user had deliberately
  // set as their default filters.
  const { highlightedId: highlightedResourceId } = useGlobalSearchRowJump(
    'resource',
    filteredResources,
    (resource) => resource.id,
    () => {
      setSearchQuery('');
      setColumnFilters({});
    }
  );

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
    const map = new Map<string, ResourceCellFormatInterfaceModel>();
    cellFormats.forEach((format) => {
      map.set(`${format.resourceId}:${format.columnKey}`, format);
    });
    return map;
  }, [cellFormats]);

  const updateCellFormatMutation = TanstackQueryClientService.current.resources.useUpdateResourceCellFormatMutation();

  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // Named custom colors a user has added via "Add Color" - growable, stored
  // the same underlying IG_ConfigurationConstantTBL-backed way as
  // Status/Sponsor's own option lists, but through a dedicated structured
  // endpoint rather than the generic one, since a color needs a name
  // attached and Status/Sponsor never will (see ResourceCellFormatColorService).
  const { data: customColors = [] } = TanstackQueryClientService.current.resources.useCustomColorsQuery();
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
  const isEveryTargetAlready = (
    targets: ResourceCellFormatTargetInterfaceModel[],
    key: 'isBold' | 'isItalic' | 'isUnderline'
  ): boolean =>
    targets.length > 0 &&
    targets.every(
      (target) =>
        cellFormatByKey.get(`${target.resourceId}:${target.columnKey}`)?.[key] === true
    );

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

  const handleToggleUnderline = (): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    updateCellFormatMutation.mutate({ cells: targets, isUnderline: !isEveryTargetAlready(targets, 'isUnderline') });
  };

  const handleSetColor = (colorKey: string): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    updateCellFormatMutation.mutate({ cells: targets, backgroundColorKey: colorKey });
    handleCloseContextMenu();
  };

  const handleClearColor = (): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    updateCellFormatMutation.mutate({ cells: targets, clearBackgroundColor: true });
    handleCloseContextMenu();
  };

  const opacityDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Built fresh on every render (not memoized) - it must reflect whichever
  // cells are selected right now, which changes between the right-click
  // that opens the menu and whichever item the user actually clicks.
  const contextMenuTargets = getSelectedCellTargets();
  const firstTargetFormat =
    contextMenuTargets.length > 0
      ? cellFormatByKey.get(`${contextMenuTargets[0]?.resourceId}:${contextMenuTargets[0]?.columnKey}`)
      : undefined;
  const hasActiveColor = contextMenuTargets.some((target) => {
    const format = cellFormatByKey.get(`${target.resourceId}:${target.columnKey}`);
    return !!format?.backgroundColorKey;
  });
  const currentOpacity = firstTargetFormat?.backgroundOpacity ?? 100;
  const currentTextColorKey = firstTargetFormat?.textColorKey ?? 'default';

  const currentBackgroundColorName = (() => {
    const key = firstTargetFormat?.backgroundColorKey;
    if (!key) return 'None';
    const fixed = CellFormatCON.COLORS.find(
      (c) => c.key.toLowerCase() === key.toLowerCase() || c.hexColor.toLowerCase() === key.toLowerCase()
    );
    if (fixed) return fixed.label;
    const custom = customColors.find(
      (c) =>
        c.colorName.toLowerCase() === key.toLowerCase() ||
        CellFormatHelper.current.getApplicableColorKey(c).toLowerCase() === key.toLowerCase()
    );
    if (custom) return custom.colorName;
    return key;
  })();

  const handleOpacityChange = (newOpacity: number): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;

    if (opacityDebounceTimerRef.current !== null) {
      clearTimeout(opacityDebounceTimerRef.current);
    }

    updateCellFormatMutation.mutate({ cells: targets, backgroundOpacity: newOpacity });
  };

  const handleSetTextColor = (textColorKey: string): void => {
    const targets = getSelectedCellTargets();
    if (targets.length === 0) return;
    if (textColorKey === 'default') {
      updateCellFormatMutation.mutate({ cells: targets, clearTextColor: true });
    } else {
      updateCellFormatMutation.mutate({ cells: targets, textColorKey });
    }
    handleCloseContextMenu();
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'text-formatting',
      label: 'Formatting',
      customRender: () => {
        const isBoldActive = isEveryTargetAlready(contextMenuTargets, 'isBold');
        const isItalicActive = isEveryTargetAlready(contextMenuTargets, 'isItalic');
        const isUnderlineActive = isEveryTargetAlready(contextMenuTargets, 'isUnderline');

        return (
          <div
            className="px-2.5 py-1.5 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              title="Bold"
              onClick={handleToggleBold}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                isBoldActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-200/60 dark:border-zinc-800'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Italic"
              onClick={handleToggleItalic}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                isItalicActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-200/60 dark:border-zinc-800'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Underline"
              onClick={handleToggleUnderline}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                isUnderlineActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-200/60 dark:border-zinc-800'
              }`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      id: 'background-colors',
      label: 'Background Color',
      customRender: () => {
        const isClearSelected = !firstTargetFormat?.backgroundColorKey;
        return (
          <div
            className="px-2.5 py-2 border-t border-slate-100 dark:border-zinc-800/80"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-2.5 flex items-center justify-between">
              <span>Background Color</span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 capitalize">
                {currentBackgroundColorName}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2 justify-items-center">
              <button
                type="button"
                title="Clear background color"
                onClick={handleClearColor}
                className={`relative w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 ${
                  isClearSelected
                    ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 scale-110 z-10'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
              {CellFormatCON.COLORS.map((color) => {
                const isSelected =
                  firstTargetFormat?.backgroundColorKey?.toLowerCase() === color.key.toLowerCase() ||
                  firstTargetFormat?.backgroundColorKey?.toLowerCase() === color.hexColor.toLowerCase();
                return (
                  <button
                    key={color.key}
                    type="button"
                    title={color.label}
                    onClick={() => handleSetColor(color.key)}
                    className={`relative w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      color.swatchClassName
                    } ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 scale-110 z-10'
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                  />
                );
              })}
              {customColors.map((option) => {
                const applicableKey = CellFormatHelper.current.getApplicableColorKey(option);
                const isSelected =
                  firstTargetFormat?.backgroundColorKey?.toLowerCase() === applicableKey.toLowerCase();
                return (
                  <button
                    key={option.colorName}
                    type="button"
                    title={option.colorName}
                    onClick={() => handleSetColor(applicableKey)}
                    style={CellFormatHelper.current.getSwatchStyleForCustomColor(option)}
                    className={`relative w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center ring-1 ring-inset ring-black/10 dark:ring-white/10 ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 scale-110 z-10'
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        );
      },
    },
    ...(hasActiveColor
      ? [
          {
            id: 'opacity-slider',
            label: 'Opacity',
            customRender: () => (
              <div
                className="px-2.5 py-2 space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-zinc-300">
                  <span>Opacity</span>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">{currentOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentOpacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#0C2086] dark:accent-blue-500"
                />
              </div>
            ),
          },
        ]
      : []),
    {
      id: 'add-color',
      label: 'Add Color',
      icon: <Plus className="w-3.5 h-3.5" />,
      onClick: () => setIsAddColorModalOpen(true),
      divider: true,
    },
    {
      id: 'text-colors',
      label: 'Text Color',
      customRender: () => (
        <div
          className="px-2.5 py-2 border-t border-slate-100 dark:border-zinc-800/80"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-2.5 flex items-center justify-between">
            <span>Text Color</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 capitalize">
              {currentTextColorKey}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 justify-items-center">
            {CellFormatCON.TEXT_COLORS.map((tc) => {
              const isSelected = (currentTextColorKey || 'default').toLowerCase() === tc.key.toLowerCase();
              return (
                <button
                  key={tc.key}
                  type="button"
                  title={tc.label}
                  onClick={() => handleSetTextColor(tc.key)}
                  className={`relative w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    tc.swatchClassName
                  } ${
                    isSelected
                      ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 scale-110 z-10'
                      : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                >
                  {tc.key === 'default' && (
                    <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 leading-none">
                      A
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ),
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
      ? `${format.isBold ? 'font-bold' : ''} ${format.isItalic ? 'italic' : ''} ${format.isUnderline ? 'underline underline-offset-2' : ''} ${CellFormatHelper.current.getCellClassName(format.backgroundColorKey)}`
      : '';
    const cellClassName = `${CELL_CLASS_NAME} ${formatClassName}`;
    // Exact color (solid at 100% or opacity modulated) + text color
    const formatStyle = {
      ...CellFormatHelper.current.getCellStyle(format?.backgroundColorKey, format?.backgroundOpacity),
      ...CellFormatHelper.current.getTextStyle(format?.textColorKey),
    };
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

            <ColumnVisibilityDropdownSharedComponent
              isOpen={isColumnDropdownOpen}
              onClose={handleCloseColumnDropdown}
              columns={ResourceColumnCON.COLUMNS}
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
                  ResourceColumnCON.FILTERABLE_COLUMN_KEY_SET.has(column.key) ? (
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
                          multiple
                          values={columnFilters[column.key] ?? []}
                          onChangeMultiple={(values) => handleColumnFilterChange(column.key, values)}
                          options={columnFilterOptionsByKey[column.key] ?? []}
                          placeholder={`All ${column.label}`}
                          searchable
                          size="sm"
                          className="w-full"
                          usePortal={true}
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
                <tr
                  key={resource.id}
                  data-row-id={resource.id}
                  className={`divide-x divide-slate-200 dark:divide-zinc-800 ${
                    highlightedResourceId === resource.id ? 'global-search-row-highlight' : ''
                  }`}
                >
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
        minWidth={216}
      />

      <AddCustomColorModalController
        isOpen={isAddColorModalOpen}
        onClose={() => setIsAddColorModalOpen(false)}
        onCreated={() => {}}
      />
    </div>
  );
}
