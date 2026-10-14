import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import ApplicationUserPreferenceKeyCON from '../../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from '../../Utilities/ApplicationUserPreferenceUtility';
import TableColumnVisibilityUtility from '../../Utilities/TableColumnVisibilityUtility';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import GlobalSearchNavigationService, { type GlobalSearchEntityType } from '../../Services/GlobalSearchNavigationService';
import ResourceColumnCON from '../../Features/Resources/Constants/ResourceColumnCON';
import ResourceTableUtility from '../../Features/Resources/Utilities/ResourceTableUtility';
import EnvironmentOverviewCON from '../../Features/EnvironmentOverview/Constants/EnvironmentOverviewCON';
import EnvironmentOverviewTableUtility from '../../Features/EnvironmentOverview/Utilities/EnvironmentOverviewTableUtility';

const MAX_RESULTS_PER_SECTION = 8;

interface SearchResultColumn {
  key: string;
  label: string;
}

interface SearchResultSection {
  entityType: GlobalSearchEntityType;
  label: string;
  route: string;
  columns: SearchResultColumn[];
  totalCount: number;
  visibleRows: { id: string; getDisplayValue: (columnKey: string) => string | null }[];
}

// App-wide search, opened by Ctrl/Cmd+K from anywhere - mounted once in
// RootLayout rather than per-page, unlike ExpandableSearchSharedComponent's
// own inline per-page search (which lost this shortcut when this shipped;
// it's still click-to-expand).
//
// Matching mirrors each page's own search exactly, column-visibility and
// all: a column a user has hidden on a given page never contributes a match
// here either, read straight from that page's own persisted preference (see
// ResourceTableUtility/EnvironmentOverviewTableUtility - the same
// matchesSearchQuery methods each page's own inline search already calls).
// Clicking a result navigates to its page (if not already there) and hands
// off to GlobalSearchNavigationService, which the destination
// ScreenController's own useGlobalSearchRowJump consumes to clear whatever
// local filtering would hide the row, then scroll to and flash it.
export default function GlobalSearchModalSharedComponent(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: resources = [] } = TanstackQueryClientService.current.resources.useResourcesQuery();
  const { data: environments = [] } = TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isShortcut) {
        // Don't hijack focus away from some other input/textarea the user
        // is actively typing into elsewhere on the page (e.g. a cell
        // mid-edit, or the per-page inline search) - same guard
        // ExpandableSearchSharedComponent used to apply to this same
        // shortcut itself.
        const activeElement = document.activeElement;
        const isTypingElsewhere =
          !isOpen &&
          (activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            (activeElement instanceof HTMLElement && activeElement.isContentEditable));
        if (isTypingElsewhere) return;

        event.preventDefault();
        setIsOpen((previous) => !previous);
        return;
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Locks background page scroll while open, matching
  // ModalSharedComponent's own convention.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Re-read only when the modal opens, not on every keystroke - column
  // visibility rarely changes mid-session, and re-reading localStorage per
  // character typed would be wasted work.
  const resourceVisibleColumns = useMemo(() => {
    const saved = ApplicationUserPreferenceUtility.current.getJSONPreference<string[]>(
      ApplicationUserPreferenceKeyCON.RESOURCE_TABLE_VISIBLE_COLUMNS,
      ResourceColumnCON.ALL_COLUMN_KEYS
    );
    const visibleKeys = TableColumnVisibilityUtility.current.withLockedColumnsIncluded(
      saved,
      ResourceColumnCON.LOCKED_COLUMN_KEYS
    );
    return ResourceColumnCON.COLUMNS.filter((column) => visibleKeys.has(column.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const environmentVisibleColumns = useMemo(() => {
    const saved = ApplicationUserPreferenceUtility.current.getJSONPreference<string[]>(
      ApplicationUserPreferenceKeyCON.ENVIRONMENT_OVERVIEW_TABLE_VISIBLE_COLUMNS,
      EnvironmentOverviewCON.ALL_COLUMN_KEYS
    );
    const visibleKeys = TableColumnVisibilityUtility.current.withLockedColumnsIncluded(
      saved,
      EnvironmentOverviewCON.LOCKED_COLUMN_KEYS
    );
    return EnvironmentOverviewCON.COLUMNS.filter((column) => visibleKeys.has(column.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const lowerCaseQuery = query.trim().toLowerCase();

  const matchedResources = useMemo(() => {
    if (!lowerCaseQuery) return [];
    return resources.filter((resource) =>
      ResourceTableUtility.current.matchesSearchQuery(resource, resourceVisibleColumns, lowerCaseQuery)
    );
  }, [resources, resourceVisibleColumns, lowerCaseQuery]);

  const matchedEnvironments = useMemo(() => {
    if (!lowerCaseQuery) return [];
    return environments.filter((environment) =>
      EnvironmentOverviewTableUtility.current.matchesSearchQuery(environment, environmentVisibleColumns, lowerCaseQuery)
    );
  }, [environments, environmentVisibleColumns, lowerCaseQuery]);

  const resourceSection: SearchResultSection = {
    entityType: 'resource',
    label: 'Infrastructure Register',
    route: ApplicationRouteCON.ROOT,
    columns: resourceVisibleColumns,
    totalCount: matchedResources.length,
    visibleRows: matchedResources.slice(0, MAX_RESULTS_PER_SECTION).map((resource) => ({
      id: resource.id,
      getDisplayValue: (columnKey: string) => ResourceTableUtility.current.getDisplayValue(resource, columnKey),
    })),
  };

  const environmentSection: SearchResultSection = {
    entityType: 'environmentOverview',
    label: 'Environment Overview',
    route: ApplicationRouteCON.ENVIRONMENT_OVERVIEW,
    columns: environmentVisibleColumns,
    totalCount: matchedEnvironments.length,
    visibleRows: matchedEnvironments.slice(0, MAX_RESULTS_PER_SECTION).map((environment) => ({
      id: environment.id,
      getDisplayValue: (columnKey: string) => EnvironmentOverviewTableUtility.current.getDisplayValue(environment, columnKey),
    })),
  };

  // Whichever page is open right now leads - everything else follows.
  const isEnvironmentOverviewCurrent = location.pathname.startsWith(ApplicationRouteCON.ENVIRONMENT_OVERVIEW);
  const sections = isEnvironmentOverviewCurrent
    ? [environmentSection, resourceSection]
    : [resourceSection, environmentSection];

  const handleResultClick = (section: SearchResultSection, id: string): void => {
    if (location.pathname !== section.route) {
      navigate({ to: section.route });
    }
    GlobalSearchNavigationService.requestNavigation(section.entityType, id);
    setIsOpen(false);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="global-search-backdrop"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/60 cursor-pointer overflow-y-auto"
        >
          {/* stopPropagation lives on this one outer wrapper (not per-piece)
              so clicking anywhere in the search bar or results doesn't
              bubble up and close the modal, while clicking the dimmed
              margin around it still does. overflow-y-auto on the backdrop
              above (not here, and not on any inner element) is what makes
              the WHOLE thing scroll together when results run long - the
              per-section tables below only ever scroll horizontally. */}
          <div onClick={(event) => event.stopPropagation()} className="min-h-full px-4 pb-10 cursor-default">
            {/* Off-screen above the viewport at rest (not just -96px, which
                would only cancel out the resting mt-24 and land at the very
                top edge) - a comfortable buffer past that guarantees the bar
                is genuinely out of view before it slides down into place. */}
            <motion.div
              key="global-search-bar"
              initial={{ y: -200 }}
              animate={{ y: 0 }}
              exit={{ y: -200 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-24 w-full max-w-xl"
            >
              <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-white dark:bg-[#0c0c0e] hairline-border-strong shadow-2xl">
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  role="searchbox"
                  aria-label="Global search"
                  autoComplete="off"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  // Handled directly on the input too (not just the window-
                  // level listener above) - guarantees a single Escape press
                  // closes this immediately even while focused, with no
                  // dependence on the keydown actually reaching window first.
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      setIsOpen(false);
                    }
                  }}
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />
                <kbd className="shrink-0 text-[10px] font-mono text-slate-400 dark:text-zinc-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                  ESC
                </kbd>
              </div>
            </motion.div>

            <AnimatePresence>
              {lowerCaseQuery && (
                <motion.div
                  key="global-search-results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="mx-auto mt-3 w-full max-w-4xl space-y-3"
                >
                  {sections.map((section) => (
                    <div
                      key={section.entityType}
                      className="rounded-xl bg-white dark:bg-[#0c0c0e] hairline-border-strong shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{section.label}</span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                          {section.totalCount > 0
                            ? `${section.totalCount} match${section.totalCount === 1 ? '' : 'es'}`
                            : 'No matches'}
                        </span>
                      </div>

                      {section.totalCount > 0 && (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                              <thead>
                                <tr className="divide-x divide-slate-100 dark:divide-zinc-800/80">
                                  {section.columns.map((column) => (
                                    <th
                                      key={column.key}
                                      className="whitespace-nowrap px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500"
                                    >
                                      {column.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                {section.visibleRows.map((row) => (
                                  <tr
                                    key={row.id}
                                    onClick={() => handleResultClick(section, row.id)}
                                    className="divide-x divide-slate-100 dark:divide-zinc-800/80 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                                  >
                                    {section.columns.map((column) => (
                                      <td
                                        key={column.key}
                                        className="whitespace-nowrap px-3 py-1.5 font-mono text-slate-700 dark:text-zinc-300"
                                      >
                                        {row.getDisplayValue(column.key) ?? (
                                          <span className="text-slate-300 dark:text-zinc-700">—</span>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {section.totalCount > MAX_RESULTS_PER_SECTION && (
                            <div className="px-4 py-1.5 text-[11px] text-slate-400 dark:text-zinc-500 border-t border-slate-100 dark:border-zinc-800/80">
                              +{section.totalCount - MAX_RESULTS_PER_SECTION} more matches
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
