import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import ResourceColumnCON from '../../Constants/ResourceColumnCON';

export interface ColumnVisibilityDropdownStaticComponentProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumnKeys: Set<string>;
  onToggleColumn: (key: string) => void;
}

export default function ColumnVisibilityDropdownStaticComponent({
  isOpen,
  onClose,
  visibleColumnKeys,
  onToggleColumn,
}: ColumnVisibilityDropdownStaticComponentProps): React.JSX.Element {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  const filteredColumns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ResourceColumnCON.COLUMNS;
    return ResourceColumnCON.COLUMNS.filter((column) => column.label.toLowerCase().includes(term));
  }, [searchTerm]);

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
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-[90vw] max-w-[760px] sm:w-[600px] md:w-[760px] z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 text-xs select-none"
          >
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500 block px-1 pb-2">
              Visible Columns
            </span>

            <div className="relative mb-2.5">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search columns..."
                autoComplete="off"
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086]/50 focus:border-[#0C2086] transition-colors"
              />
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
                      onChange={() => onToggleColumn(column.key)}
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
