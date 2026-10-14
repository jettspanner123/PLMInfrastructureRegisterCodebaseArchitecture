import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import ApplicationUserPreferenceUtility from '../../../Utilities/ApplicationUserPreferenceUtility';
import ApplicationUserPreferenceKeyCON from '../../../Constants/ApplicationUserPreferenceKeyCON';

const MIN_ROW_HEIGHT_PX = 36;

export interface RowResizeHandleProps {
  onMouseDown: (event: React.MouseEvent) => void;
  onDoubleClick: (event: React.MouseEvent) => void;
}

export interface UseRowHeightsResult {
  getRowHeight: (rowId: string) => number | undefined;
  getResizeHandleProps: (rowId: string, getRowElement?: () => HTMLElement | null) => RowResizeHandleProps;
  resetRowHeight: (rowId: string) => void;
  resizingRowId: string | null;
}

// Excel-style draggable row height borders for the Environment Overview table,
// persisted to localStorage via ApplicationUserPreferenceUtility. Keyed by
// row ID (or 'draft' for a new draft row). Double-clicking the resize handle
// resets the row to its natural auto height.
export default class EnvironmentOverviewRowHeightService {
  public static current: EnvironmentOverviewRowHeightService = new EnvironmentOverviewRowHeightService();

  public useRowHeights(defaultHeights: Record<string, number> = {}): UseRowHeightsResult {
    const [heights, setHeights] = useState<Record<string, number>>(() => ({
      ...defaultHeights,
      ...ApplicationUserPreferenceUtility.current.getJSONPreference<Record<string, number>>(
        ApplicationUserPreferenceKeyCON.ENVIRONMENT_OVERVIEW_ROW_HEIGHTS,
        {}
      ),
    }));

    const [resizingRowId, setResizingRowId] = useState<string | null>(null);
    const dragStateRef = useRef<{ rowId: string; startY: number; startHeight: number } | null>(null);

    const getRowHeight = useCallback(
      (rowId: string): number | undefined => heights[rowId] ?? defaultHeights[rowId],
      [heights, defaultHeights]
    );

    const resetRowHeight = useCallback((rowId: string): void => {
      setHeights((previous) => {
        const next = { ...previous };
        delete next[rowId];
        ApplicationUserPreferenceUtility.current.setJSONPreference(
          ApplicationUserPreferenceKeyCON.ENVIRONMENT_OVERVIEW_ROW_HEIGHTS,
          next
        );
        return next;
      });
    }, []);

    useEffect(() => {
      const handleMouseMove = (event: MouseEvent): void => {
        const drag = dragStateRef.current;
        if (!drag) return;
        const nextHeight = Math.max(MIN_ROW_HEIGHT_PX, drag.startHeight + (event.clientY - drag.startY));
        setHeights((previous) => ({ ...previous, [drag.rowId]: nextHeight }));
      };

      const handleMouseUp = (): void => {
        if (!dragStateRef.current) return;
        dragStateRef.current = null;
        setResizingRowId(null);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        setHeights((current) => {
          ApplicationUserPreferenceUtility.current.setJSONPreference(
            ApplicationUserPreferenceKeyCON.ENVIRONMENT_OVERVIEW_ROW_HEIGHTS,
            current
          );
          return current;
        });
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    const getResizeHandleProps = useCallback(
      (rowId: string, getRowElement?: () => HTMLElement | null): RowResizeHandleProps => ({
        onMouseDown: (event: React.MouseEvent): void => {
          event.preventDefault();
          event.stopPropagation();

          let initialHeight = heights[rowId] ?? defaultHeights[rowId];
          if (!initialHeight) {
            const tr = getRowElement ? getRowElement() : (event.currentTarget as HTMLElement).closest('tr');
            if (tr) {
              initialHeight = tr.getBoundingClientRect().height;
            }
          }
          if (!initialHeight) {
            initialHeight = MIN_ROW_HEIGHT_PX;
          }

          dragStateRef.current = { rowId, startY: event.clientY, startHeight: initialHeight };
          setResizingRowId(rowId);
          document.body.style.cursor = 'row-resize';
          document.body.style.userSelect = 'none';
        },
        onDoubleClick: (event: React.MouseEvent): void => {
          event.preventDefault();
          event.stopPropagation();
          resetRowHeight(rowId);
        },
      }),
      [heights, defaultHeights, resetRowHeight]
    );

    return { getRowHeight, getResizeHandleProps, resetRowHeight, resizingRowId };
  }
}
