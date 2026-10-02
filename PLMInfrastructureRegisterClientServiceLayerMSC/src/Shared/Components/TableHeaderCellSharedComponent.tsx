import React from 'react';

export interface TableHeaderCellSharedComponentProps {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

// The app-wide "iconic blue" table header treatment — same brand blue
// (#0C2086, matching primary buttons/focus rings) in both light and dark
// mode, deliberately not theme-adjusted. Sticky relative to its nearest
// scrolling ancestor, which must be a bounded, independently-scrolling
// container (see DataTableContainerSharedComponent) — overflow-x-auto alone
// would make that div the sticky boundary anyway, so this only "sticks"
// meaningfully when paired with that container.
export default function TableHeaderCellSharedComponent({
  children,
  align = 'left',
  className = '',
}: TableHeaderCellSharedComponentProps): React.JSX.Element {
  return (
    <th
      className={`sticky top-0 z-10 whitespace-nowrap px-3 py-2.5 font-mono font-bold uppercase tracking-wider text-[10px] text-white bg-[#0C2086] ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
    >
      {children}
    </th>
  );
}
