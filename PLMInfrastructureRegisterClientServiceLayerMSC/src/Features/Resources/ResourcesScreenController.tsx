import React, { useRef, useState } from 'react';
import { ChevronDown, Columns3, ServerOff } from 'lucide-react';
import CardSharedComponent from '../../Shared/Components/CardSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ApplicationUserPreferenceUtility from '../../Utilities/ApplicationUserPreferenceUtility';
import ApplicationUserPreferenceKeyCON from '../../Constants/ApplicationUserPreferenceKeyCON';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import type ResourceInterfaceModel from '../../Models/ResourceInterfaceModel';
import ResourceColumnCON from './Constants/ResourceColumnCON';
import ColumnVisibilityDropdownStaticComponent from './Components/static/ColumnVisibilityDropdownStaticComponent';

function getResourceCellValue(resource: ResourceInterfaceModel, key: string): React.ReactNode {
  const value = (resource as unknown as Record<string, unknown>)[key];

  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-300 dark:text-zinc-700">—</span>;
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

const ALL_COLUMN_KEYS: string[] = ResourceColumnCON.COLUMNS.map((column) => column.key);
const LOCKED_COLUMN_KEYS: Set<string> = new Set(
  ResourceColumnCON.COLUMNS.filter((column) => column.locked).map((column) => column.key)
);

function withLockedColumnsIncluded(keys: Iterable<string>): Set<string> {
  const next = new Set(keys);
  LOCKED_COLUMN_KEYS.forEach((key) => next.add(key));
  return next;
}

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
      ALL_COLUMN_KEYS
    );
    // Locked columns (Hostname, Environment) are always included, even if an
    // older persisted preference somehow excluded them.
    return withLockedColumnsIncluded(saved);
  });

  const handleToggleColumn = (key: string): void => {
    if (LOCKED_COLUMN_KEYS.has(key)) return;

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
    setVisibleColumnKeys(new Set(LOCKED_COLUMN_KEYS));
  };

  const visibleColumns = ResourceColumnCON.COLUMNS.filter((column) => visibleColumnKeys.has(column.key));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">
            Infrastructure Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Azure Resources tracked by this register.
          </p>
        </div>

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

      {resources.length > 0 && (
        <CardSharedComponent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="divide-x divide-slate-200 dark:divide-zinc-800 border-b border-slate-200 dark:border-zinc-800">
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap px-3 py-2.5 text-left font-mono font-bold uppercase tracking-wider text-[10px] text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-900/60"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {resources.map((resource) => (
                  <tr key={resource.id} className="divide-x divide-slate-200 dark:divide-zinc-800">
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-zinc-300"
                      >
                        {getResourceCellValue(resource, column.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardSharedComponent>
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
