import React from 'react';
import CardSharedComponent from './CardSharedComponent';

export interface DataTableContainerSharedComponentProps {
  children: React.ReactNode;
}

// The app-wide edge-to-edge data table shell: a CardSharedComponent with its
// default padding stripped (forced via `!p-0` since Tailwind's cascade order
// can't be trusted to let a bare `p-0` beat the card's own `p-5`), wrapping a
// single scroll container. The actual overflow/max-height/card-clipping
// behavior is driven entirely by index.css's `.data-table-scroll-area` /
// `.data-table-card` rules, reacting to the `table-height-*` class the
// profile dropdown's Table Height control toggles on <html> (see
// ApplicationTableHeightUtility) — not by Tailwind classes here, since that
// preference lives far from every table that needs to react to it, the same
// problem ApplicationLayoutWidthUtility already solves for layout width.
export default function DataTableContainerSharedComponent({
  children,
}: DataTableContainerSharedComponentProps): React.JSX.Element {
  return (
    <CardSharedComponent className="!p-0 data-table-card">
      <div className="data-table-scroll-area">{children}</div>
    </CardSharedComponent>
  );
}
