import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CopyableTableCellSharedComponentProps {
  value: string;
  children: React.ReactNode;
  // Cell-specific classes (padding, whitespace, font, color) that would
  // otherwise have lived on the <td> itself - applied to the inner button
  // instead, since the <td> only ever carries `p-0` here.
  className?: string;
  ariaLabel: string;
}

// A table cell whose entire surface is a single native <button> - clicking
// anywhere in the cell copies `value` to the clipboard, including the small
// copy icon that fades in on hover/focus at the cell's end, since it's a
// plain decorative child of that same button rather than an independent
// click target. Deliberately a <button> inside a plain <td> (not a <td>
// with an overridden role/tabIndex) so screen readers still get a real
// table cell for row/column navigation, with a real native button for the
// "this performs an action" part.
export default function CopyableTableCellSharedComponent({
  value,
  children,
  className = '',
  ariaLabel,
}: CopyableTableCellSharedComponentProps): React.JSX.Element {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // Clipboard denied/unavailable — nothing more to do here.
    }

    setIsCopied(true);
    if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <td className="p-0">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={ariaLabel}
        className={`group relative w-full h-full flex items-center text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400 ${className}`}
      >
        <span className="pr-5">{children}</span>
        <span
          className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity ${
            isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
          }`}
        >
          {isCopied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
          )}
        </span>
      </button>
    </td>
  );
}
