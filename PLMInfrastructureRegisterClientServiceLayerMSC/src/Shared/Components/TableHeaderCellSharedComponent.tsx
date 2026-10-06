import React from 'react';

export interface TableHeaderCellSharedComponentProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  // Wired up by TableSelectionService for column-select-by-header-click —
  // omitted entirely for headers that already host their own interactive
  // control (e.g. the Environment column's filter dropdown), so clicking
  // those keeps doing what they already do instead of also selecting.
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseEnter?: () => void;
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
}: TableHeaderCellSharedComponentProps): React.JSX.Element {
  return (
    <th
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={`data-table-header-cell whitespace-nowrap px-3 py-2.5 font-mono font-bold uppercase tracking-wider text-[10px] text-white bg-[#0C2086] ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${onMouseDown ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      {children}
    </th>
  );
}
