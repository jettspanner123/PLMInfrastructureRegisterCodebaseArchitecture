import React, { useRef, useState } from 'react';
import { ChevronDown, Columns3, ServerOff } from 'lucide-react';
import CardSharedComponent from '../../Shared/Components/CardSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ApplicationUserPreferenceUtility from '../../Utilities/ApplicationUserPreferenceUtility';
import ApplicationUserPreferenceKeyCON from '../../Constants/ApplicationUserPreferenceKeyCON';
import ResourceColumnCON from './Constants/ResourceColumnCON';
import ColumnVisibilityDropdownStaticComponent from './Components/static/ColumnVisibilityDropdownStaticComponent';

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
    const next = new Set(LOCKED_COLUMN_KEYS);
    ApplicationUserPreferenceUtility.current.setJSONPreference(
      ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_VISIBLE_COLUMNS,
      Array.from(next)
    );
    setVisibleColumnKeys(next);
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
              {/* Rows render here once Sync populates Resources — each <tr> should carry
                  the same divide-x divide-slate-200 dark:divide-zinc-800 vertical dividers
                  as the header row, so the grid reads as one consistent spreadsheet, and
                  should only render cells for `visibleColumns`, in that same order. */}
            </tbody>
          </table>
        </div>
      </CardSharedComponent>

      <EmptyStateSharedComponent
        icon={<ServerOff className="w-6 h-6" />}
        title="No Resources yet"
        description="Sync hasn't run yet, so nothing has been discovered."
      />
    </div>
  );
}
