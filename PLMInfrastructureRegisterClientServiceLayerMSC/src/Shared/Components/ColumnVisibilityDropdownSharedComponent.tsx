import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListX, Search } from 'lucide-react';

export interface ColumnVisibilityDropdownColumnDef {
  key: string;
  label: string;
  locked?: boolean;
}

export interface ColumnVisibilityDropdownSharedComponentProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnVisibilityDropdownColumnDef[];
  visibleColumnKeys: Set<string>;
  onToggleColumn: (key: string) => void;
  onClearAll: () => void;
  // Resources has ~60 columns and benefits from an in-panel search;
  // Environment Overview's much shorter list doesn't need one - defaults on
  // since Resources (the original consumer) already relied on it.
  showSearch?: boolean;
}

export default function ColumnVisibilityDropdownSharedComponent({
  isOpen,
  onClose,
  columns,
  visibleColumnKeys,
  onToggleColumn,
  onClearAll,
  showSearch = true,
}: ColumnVisibilityDropdownSharedComponentProps): React.JSX.Element {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }, 10);
    document.addEventListener('keydown', handleKeyDown);

    // Move focus into the panel so keyboard users don't have to Tab to it -
    // only meaningful when there's a search input to receive it.
    if (showSearch) searchInputRef.current?.focus();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, showSearch]);

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  const filteredColumns = useMemo(() => {
    if (!showSearch) return columns;
    const term = searchTerm.trim().toLowerCase();
    if (!term) return columns;
    return columns.filter((column) => column.label.toLowerCase().includes(term));
  }, [columns, searchTerm, showSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Full Screen Transparent Backdrop Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 z-40 bg-transparent cursor-default pointer-events-auto"
          />

          <motion.div
            ref={dropdownRef}
            id="column-visibility-dropdown-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Column visibility"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-[90vw] max-w-[760px] sm:w-[600px] md:w-[760px] z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 text-xs select-none"
          >
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500 block px-1 pb-2">
              Visible Columns
            </span>

            <div className="flex items-center gap-2 mb-2.5">
              {showSearch && (
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search columns..."
                    aria-label="Search columns"
                    autoComplete="off"
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50 focus:border-[#0C2086] transition-colors"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={onClearAll}
                title="Uncheck all (except locked columns)"
                aria-label="Uncheck all columns, except locked columns"
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <ListX className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto pr-1 columns-2 lg:columns-3 gap-x-3">
              {filteredColumns.length === 0 ? (
                <p className="py-3 px-2 text-center text-slate-400 dark:text-zinc-500">No matching columns</p>
              ) : (
                filteredColumns.map((column, index) => (
                  <label
                    key={column.key}
                    title={column.locked ? 'Always visible — identifies the row' : undefined}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg break-inside-avoid hover:bg-slate-100 dark:hover:bg-zinc-800/80 ${
                      column.locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                    } ${index % 2 === 1 ? 'bg-slate-50 dark:bg-zinc-900/50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumnKeys.has(column.key) || column.locked === true}
                      disabled={column.locked === true}
                      onChange={() => {
                        onToggleColumn(column.key);
                        // Searching implies "I'm looking for this one column" —
                        // once found and toggled, close the panel. onClose()
                        // closing the panel also resets the search term, via
                        // the isOpen effect above.
                        if (showSearch && searchTerm.trim().length > 0) {
                          onClose();
                        }
                      }}
                      className="h-3.5 w-3.5 rounded accent-[#0C2086] cursor-pointer shrink-0 disabled:cursor-not-allowed"
                    />
                    <span className="truncate text-slate-700 dark:text-zinc-300">{column.label}</span>
                  </label>
                ))
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
