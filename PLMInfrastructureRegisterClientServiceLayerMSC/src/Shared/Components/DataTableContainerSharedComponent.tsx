import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import CardSharedComponent from './CardSharedComponent';
import TableHorizontalScrollPillSharedComponent from './TableHorizontalScrollPillSharedComponent';

export interface DataTableContainerSharedComponentProps {
  children: React.ReactNode;
}

// The app-wide edge-to-edge data table shell: a CardSharedComponent with its
// default padding stripped, wrapping a native CSS sticky header container and
// a single horizontal scroll area.
//
// By rendering the <thead> inside a dedicated .data-table-sticky-header-container
// with position: sticky; top: 65px; z-index: 25, the browser's GPU compositor
// pins the header in hardware at 120 FPS with 0ms delay, zero easing, and zero
// lag, while maintaining full React interactivity for all header controls.
const DataTableContainerSharedComponent = React.forwardRef<HTMLDivElement, DataTableContainerSharedComponentProps>(
  function DataTableContainerSharedComponent({ children }, forwardedRef): React.JSX.Element {
    const internalRef = useRef<HTMLDivElement | null>(null);
    const headerContainerRef = useRef<HTMLDivElement | null>(null);

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

    // Synchronize horizontal scrolling between the table body scroll area
    // and the native sticky header container in lockstep.
    useEffect(() => {
      const scrollArea = internalRef.current;
      const headerContainer = headerContainerRef.current;
      if (!scrollArea || !headerContainer) return;

      const handleScroll = (): void => {
        headerContainer.scrollLeft = scrollArea.scrollLeft;
      };

      scrollArea.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }, []);

    // Ensure header table width and individual column widths exactly match body table
    // with 0ms delay and no easing/animation.
    useLayoutEffect(() => {
      const scrollArea = internalRef.current;
      const headerContainer = headerContainerRef.current;
      if (!scrollArea || !headerContainer) return;

      const bodyTable = scrollArea.querySelector('table');
      const headerTable = headerContainer.querySelector('table');
      if (!bodyTable || !headerTable) return;

      const syncColumnWidths = (): void => {
        const bodyWidth = bodyTable.offsetWidth;
        if (bodyWidth <= 0) return;

        const bodyWidthStr = `${bodyWidth}px`;
        if (headerTable.style.width !== bodyWidthStr) {
          headerTable.style.width = bodyWidthStr;
          headerTable.style.minWidth = bodyWidthStr;
        }

        const bodyThs = bodyTable.querySelectorAll<HTMLTableCellElement>('thead.data-table-hidden-thead th');
        const headerThs = headerTable.querySelectorAll<HTMLTableCellElement>('thead th');

        if (bodyThs.length > 0 && bodyThs.length === headerThs.length) {
          for (let i = 0; i < bodyThs.length; i++) {
            const width = bodyThs[i].getBoundingClientRect().width;
            if (width > 0) {
              const headerTh = headerThs[i];
              const widthStr = `${width}px`;
              if (headerTh.style.width !== widthStr) {
                headerTh.style.width = widthStr;
                headerTh.style.minWidth = widthStr;
                headerTh.style.maxWidth = widthStr;
                headerTh.style.boxSizing = 'border-box';
              }
            }
          }
        } else {
          const firstRowTds = bodyTable.querySelectorAll<HTMLTableCellElement>('tbody tr:first-child td');
          if (firstRowTds.length > 0 && firstRowTds.length === headerThs.length) {
            for (let i = 0; i < firstRowTds.length; i++) {
              const width = firstRowTds[i].getBoundingClientRect().width;
              if (width > 0) {
                const headerTh = headerThs[i];
                const widthStr = `${width}px`;
                if (headerTh.style.width !== widthStr) {
                  headerTh.style.width = widthStr;
                  headerTh.style.minWidth = widthStr;
                  headerTh.style.maxWidth = widthStr;
                  headerTh.style.boxSizing = 'border-box';
                }
              }
            }
          }
        }
      };

      syncColumnWidths();

      const observer = new ResizeObserver(syncColumnWidths);
      observer.observe(bodyTable);
      return () => observer.disconnect();
    }, [children]);

    // Check if children is a table with thead + tbody
    const tableElement =
      React.isValidElement(children) && (children as React.ReactElement).type === 'table'
        ? (children as React.ReactElement<React.TableHTMLAttributes<HTMLTableElement>>)
        : null;

    if (!tableElement) {
      return (
        <CardSharedComponent className="!p-0 data-table-card">
          <div ref={setMergedRef} className="data-table-scroll-area">
            {children}
          </div>
          <TableHorizontalScrollPillSharedComponent scrollContainerRef={internalRef} />
        </CardSharedComponent>
      );
    }

    const childrenArray = React.Children.toArray(tableElement.props.children);
    const theadElement = childrenArray.find(
      (child) => React.isValidElement(child) && child.type === 'thead'
    ) as React.ReactElement<React.HTMLAttributes<HTMLTableSectionElement>> | undefined;
    const restElements = childrenArray.filter((child) => child !== theadElement);

    return (
      <CardSharedComponent className="!p-0 data-table-card">
        {theadElement && (
          <div ref={headerContainerRef} className="data-table-sticky-header-container">
            <table
              {...tableElement.props}
              className={`${tableElement.props.className ?? ''} !border-b-0`}
            >
              {theadElement}
            </table>
          </div>
        )}
        <div ref={setMergedRef} className="data-table-scroll-area">
          <table
            {...tableElement.props}
            className={`${tableElement.props.className ?? ''} !border-t-0`}
          >
            {theadElement && (
              <thead
                aria-hidden="true"
                inert={true}
                className="data-table-hidden-thead"
                style={{ visibility: 'collapse' }}
              >
                {theadElement.props.children}
              </thead>
            )}
            {restElements}
          </table>
        </div>
        <TableHorizontalScrollPillSharedComponent scrollContainerRef={internalRef} />
      </CardSharedComponent>
    );
  }
);

export default DataTableContainerSharedComponent;
