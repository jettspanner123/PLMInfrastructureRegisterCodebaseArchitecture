import React from 'react';

export interface TableHeaderCellSharedComponentProps {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
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
}: TableHeaderCellSharedComponentProps): React.JSX.Element {
  return (
    <th
      className={`data-table-header-cell whitespace-nowrap px-3 py-2.5 font-mono font-bold uppercase tracking-wider text-[10px] text-white bg-[#0C2086] ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
    >
      {children}
    </th>
  );
}
