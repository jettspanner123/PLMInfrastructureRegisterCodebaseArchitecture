import React, { useCallback, useRef } from 'react';
import CardSharedComponent from './CardSharedComponent';
import TableHorizontalScrollPillSharedComponent from './TableHorizontalScrollPillSharedComponent';

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
//
// Forwards its ref to the scroll-area div itself — TableSelectionService
// attaches this as its selection's "outside click clears it" boundary.
const DataTableContainerSharedComponent = React.forwardRef<HTMLDivElement, DataTableContainerSharedComponentProps>(
  function DataTableContainerSharedComponent({ children }, forwardedRef): React.JSX.Element {
    const internalRef = useRef<HTMLDivElement | null>(null);

    const setMergedRef = useCallback(
      (element: HTMLDivElement | null): void => {
        internalRef.current = element;
        if (typeof forwardedRef === 'function') {
          forwardedRef(element);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
        }
      },
      [forwardedRef]
    );

    return (
      <CardSharedComponent className="!p-0 data-table-card">
        <div ref={setMergedRef} className="data-table-scroll-area">
          {children}
        </div>
        <TableHorizontalScrollPillSharedComponent scrollContainerRef={internalRef} />
      </CardSharedComponent>
    );
  }
);

export default DataTableContainerSharedComponent;
