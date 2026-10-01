import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
            className="absolute right-0 top-12 w-80 z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 text-xs select-none"
          >
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500 block px-1 pb-2 mb-2 border-b border-slate-100 dark:border-zinc-800/80">
              Visible Columns
            </span>

            <div className="max-h-96 overflow-y-auto space-y-0.5 pr-1">
              {ResourceColumnCON.COLUMNS.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900/60 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumnKeys.has(column.key)}
                    onChange={() => onToggleColumn(column.key)}
                    className="h-3.5 w-3.5 rounded accent-[#0C2086] cursor-pointer shrink-0"
                  />
                  <span className="truncate text-slate-700 dark:text-zinc-300">{column.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
