import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';

// App-wide search, opened by Ctrl/Cmd+K from anywhere - mounted once in
// RootLayout rather than per-page, unlike ExpandableSearchSharedComponent's
// own inline per-page search (which lost this shortcut when this shipped;
// it's still click-to-expand). Presentation only for now: no query
// execution, no results - just the open/close shell and its animation,
// with real search behavior to follow in a later pass.
export default function GlobalSearchModalSharedComponent(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

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
          className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/60 cursor-pointer"
        >
          {/* Off-screen above the viewport at rest (not just -96px, which
              would only cancel out the resting mt-24 and land at the very
              top edge) - a comfortable buffer past that guarantees the bar
              is genuinely out of view before it slides down into place. */}
          <motion.div
            key="global-search-bar"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: -200 }}
            animate={{ y: 0 }}
            exit={{ y: -200 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-24 w-[calc(100%-2rem)] max-w-xl cursor-default"
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
                // level listener below) - guarantees a single Escape press
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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
