import React from 'react';

export interface TableHeaderCellSharedComponentProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  // Wired up by TableSelectionService for column-select-by-header-click —
  // passed on every header, including ones that also host their own
  // interactive control (e.g. the Environment column's filter dropdown).
  // That control is responsible for stopping its own mousedown from
  // bubbling here (see ResourcesScreenController), so a plain click on it
  // still only opens the dropdown; dragging/Shift+click through this
  // header still extends a column selection either way.
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  // Escape hatch for a dynamic per-render value Tailwind's JIT can't see at
  // build time (e.g. a user-dragged column width in px) — inert for every
  // caller that doesn't pass it. Also the only reliable way to set
  // `position` on this element specifically: `.data-table-header-cell`
  // itself sets `position: static` in index.css, and a plain Tailwind
  // `relative` class on the same element loses that fight (identical
  // specificity, decided by stylesheet order, not by which one looks more
  // specific to a human reader) — inline style is the one thing that wins
  // regardless. A caller that needs to absolutely-position something inside
  // this header (e.g. EnvironmentOverviewScreenController's column-resize
  // handles) must pass `{ position: 'relative' }` here, not a className.
  style?: React.CSSProperties;
}

// The app-wide "iconic blue" table header treatment — same brand blue
// (#0C2086, matching primary buttons/focus rings) in both light and dark
// mode, deliberately not theme-adjusted. Stickiness itself (position, top
// offset, z-index) comes from the `.data-table-header-cell` class in
// index.css, which reacts to the current Table Height preference: sticky to
// the top of the table's own bounded scroll box in Limited/Custom, or a
// plain (non-sticky) header in Extended mode — a sticky header there isn't
// achievable in CSS, since Extended's box has contained horizontal scroll
// but deliberately no height cap (see index.css's comment for why).
export default function TableHeaderCellSharedComponent({
  children,
  align = 'left',
  className = '',
  onMouseDown,
  onMouseEnter,
  style,
}: TableHeaderCellSharedComponentProps): React.JSX.Element {
  return (
    <th
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      style={style}
      className={`data-table-header-cell whitespace-nowrap px-3 py-2.5 font-mono font-bold uppercase tracking-wider text-[10px] text-white bg-[#0C2086] ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${onMouseDown ? 'data-table-column-header-cell--selectable select-none' : ''} ${className}`}
    >
      {children}
    </th>
  );
}
