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
  // Wired up by TableSelectionService — see its own file for the full
  // click-vs-drag design. In short: a plain click (mousedown+mouseup on
  // this same button, no Shift) still copies exactly as before, since the
  // browser's native `click` event only fires in that case; Shift is
  // checked explicitly below because Shift+click targets the same element
  // too (so `click` still fires) even though it means "extend the
  // selection", not "copy this one cell".
  selectionBoxShadow?: string;
  onCellMouseDown?: (event: React.MouseEvent) => void;
  onCellMouseEnter?: () => void;
  // Right-click cell formatting (Resources' Infrastructure Register table) -
  // inert everywhere else, since this just forwards to the inner button's
  // own onContextMenu when provided.
  onCellContextMenu?: (event: React.MouseEvent) => void;
  // 'center' (default) matches every existing table's short, single-line
  // cells. 'top' is for tables whose content regularly wraps to several
  // lines (e.g. Environment Overview) — centering a multi-line block reads
  // oddly, and the copy icon's own position changes to match (pinned to the
  // cell's top-right corner instead of vertically centered, since centering
  // it over a tall block would float it awkwardly mid-text).
  verticalAlign?: 'center' | 'top';
  // Same escape hatch as TableHeaderCellSharedComponent's `style` prop — a
  // dynamic per-render pixel width (e.g. a user-dragged column width)
  // Tailwind's JIT can't see at build time. Inert when omitted.
  width?: number;
  // A second, independent escape hatch for the inner button specifically
  // (not the outer <td>, which is what the plain `style` object baked into
  // this component already covers via selectionBoxShadow/width) - for a
  // value Tailwind's JIT can't precompile a class for at all, such as a
  // user-entered custom color that only exists at runtime (Resources' own
  // cell-formatting feature).
  buttonStyle?: React.CSSProperties;
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
  selectionBoxShadow,
  onCellMouseDown,
  onCellMouseEnter,
  onCellContextMenu,
  verticalAlign = 'center',
  width,
  buttonStyle,
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    // Shift+click targets this same button on both mousedown and mouseup
    // (no drag), so native `click` fires here too — but it means "extend
    // the selection to this cell", not "copy this one cell".
    if (event.shiftKey) return;
    void handleCopy();
  };

  return (
    // h-px (height: 1px) looks pointless but is load-bearing: a table cell
    // never gives its children a resolvable percentage height (CSS's
    // percentage-height rule needs a "definite" height, and a <td> stretched
    // only by the row's own content doesn't count as one) - any explicit
    // height, however small, makes browsers treat it as definite, and the
    // row's real stretched height is still what's actually used. Without
    // this, the button's own h-full silently resolves to "auto" and the
    // button only ever grows to its own content's height, matching its row
    // only by coincidence on tables where every cell's content is similarly
    // short (which is exactly why this went unnoticed until a table with
    // genuinely mixed row heights - Environment Overview - exposed it).
    <td className="p-0 h-px" style={{ boxShadow: selectionBoxShadow, width }}>
      <button
        type="button"
        onMouseDown={onCellMouseDown}
        onMouseEnter={onCellMouseEnter}
        onContextMenu={onCellContextMenu}
        onClick={handleClick}
        aria-label={ariaLabel}
        style={buttonStyle}
        className={`group relative w-full h-full flex ${
          verticalAlign === 'top' ? 'items-start' : 'items-center'
        } text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400 ${className}`}
      >
        <span className="pr-5">{children}</span>
        <span
          className={`pointer-events-none absolute right-1.5 transition-opacity ${
            verticalAlign === 'top' ? 'top-1.5' : 'top-1/2 -translate-y-1/2'
          } ${isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
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
