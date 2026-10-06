import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import ApplicationSearchBarCON from '../../Constants/ApplicationSearchBarCON';

export interface ExpandableSearchSharedComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  // Idle time (ms, no typing) before auto-collapsing back to the icon.
  // Pass 0 to disable auto-collapse entirely. Exists as a prop (default
  // sourced from ApplicationSearchBarCON) so a future settings page can
  // override it without this component needing to change.
  autoCollapseIdleMs?: number;
}

// An icon-only button that expands into a search input — Ctrl/Cmd+K opens
// and focuses it from anywhere while mounted. The search icon is a single
// persistent element at a fixed position throughout (never re-mounted or
// repositioned). Width is driven by Tailwind's own scale (`w-9` collapsed —
// the same token family as `h-9`, guaranteeing a perfect square — `w-56`/
// `sm:w-64` expanded) transitioned via plain CSS, not a Framer-Motion-animated
// raw pixel number: the box is correctly sized from the very first paint,
// with no JS computation standing between it and the DOM. Only the input's
// fade-in is Framer-Motion-driven. Collapses back on Escape, the clear (X)
// button, or after `autoCollapseIdleMs` of no typing — never on blur, so
// clicking elsewhere never silently discards an active search.
export default function ExpandableSearchSharedComponent({
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel = 'Search',
  autoCollapseIdleMs = ApplicationSearchBarCON.AUTO_COLLAPSE_IDLE_MS,
}: ExpandableSearchSharedComponentProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = (): void => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const scheduleAutoCollapse = (): void => {
    clearIdleTimer();
    if (!autoCollapseIdleMs) return;
    idleTimerRef.current = setTimeout(() => setIsExpanded(false), autoCollapseIdleMs);
  };

  const handleExpand = (): void => {
    setIsExpanded(true);
    scheduleAutoCollapse();
  };

  const handleCollapse = (): void => {
    clearIdleTimer();
    setIsExpanded(false);
    // Return focus to the trigger — same disclosure-pattern convention used
    // elsewhere in this app (e.g. the Columns dropdown), so keyboard users
    // don't lose their place when the input unmounts.
    triggerButtonRef.current?.focus();
  };

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  // Unmount cleanup only — intentionally not in the keydown effect's own
  // dependency-driven cleanup, since that one re-runs per isExpanded change.
  useEffect(() => clearIdleTimer, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isSearchShortcut) {
        // Don't hijack focus away from some other input/textarea the user
        // is actively typing into elsewhere on the page.
        const activeElement = document.activeElement;
        const isTypingElsewhere =
          activeElement !== inputRef.current &&
          (activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            (activeElement instanceof HTMLElement && activeElement.isContentEditable));
        if (isTypingElsewhere) return;

        event.preventDefault();
        if (isExpanded) {
          inputRef.current?.focus();
          scheduleAutoCollapse();
        } else {
          handleExpand();
        }
        return;
      }

      if (event.key === 'Escape' && isExpanded) {
        handleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
    scheduleAutoCollapse();
  };

  const hasActiveQuery = value.trim().length > 0;

  return (
    <div
      className={`relative h-9 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hairline-border overflow-hidden shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExpanded ? 'w-56 sm:w-64' : 'w-9'
      }`}
    >
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={handleExpand}
        aria-label={ariaLabel}
        aria-expanded={isExpanded}
        className={`absolute left-0 top-0 h-9 w-9 flex items-center justify-center shrink-0 text-slate-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400 ${
          isExpanded
            ? 'pointer-events-none'
            : 'cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors rounded-lg'
        }`}
      >
        <Search className="w-3.5 h-3.5" />
        {hasActiveQuery && !isExpanded && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0C2086] dark:bg-blue-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.input
            key="expandable-search-input"
            ref={inputRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            type="text"
            role="searchbox"
            aria-label={ariaLabel}
            autoComplete="off"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="absolute inset-0 pl-9 pr-8 h-9 bg-transparent text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
          />
        )}
      </AnimatePresence>

      {isExpanded && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            handleCollapse();
          }}
          aria-label="Clear and close search"
          className="absolute right-0 top-0 h-9 w-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400 rounded-lg"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
