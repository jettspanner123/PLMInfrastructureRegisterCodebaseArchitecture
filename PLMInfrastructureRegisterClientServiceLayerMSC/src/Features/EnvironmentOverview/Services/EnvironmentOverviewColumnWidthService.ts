import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import ApplicationUserPreferenceUtility from '../../../Utilities/ApplicationUserPreferenceUtility';
import ApplicationUserPreferenceKeyCON from '../../../Constants/ApplicationUserPreferenceKeyCON';

const MIN_COLUMN_WIDTH_PX = 80;

export interface ColumnResizeHandleProps {
  onMouseDown: (event: React.MouseEvent) => void;
}

export interface UseColumnWidthsResult {
  getColumnWidth: (columnKey: string) => number;
  getResizeHandleProps: (columnKey: string) => ColumnResizeHandleProps;
  resizingColumnKey: string | null;
}

// Excel-style draggable column borders for the Environment Overview table,
// persisted to localStorage (via the app's existing preference utility, the
// same one column-visibility and table-height already use) - scoped to this
// one feature for now rather than built as a cross-table service like
// TableSelectionService, since that's explicitly not what was asked for yet.
export default class EnvironmentOverviewColumnWidthService {
  public static current: EnvironmentOverviewColumnWidthService = new EnvironmentOverviewColumnWidthService();

  public useColumnWidths(defaultWidths: Record<string, number>): UseColumnWidthsResult {
    const [widths, setWidths] = useState<Record<string, number>>(() => ({
      ...defaultWidths,
      ...ApplicationUserPreferenceUtility.current.getJSONPreference<Record<string, number>>(
        ApplicationUserPreferenceKeyCON.ENVIRONMENT_OVERVIEW_COLUMN_WIDTHS,
        {}
      ),
    }));

    const [resizingColumnKey, setResizingColumnKey] = useState<string | null>(null);
    const dragStateRef = useRef<{ columnKey: string; startX: number; startWidth: number } | null>(null);

    const getColumnWidth = useCallback(
      (columnKey: string): number => widths[columnKey] ?? defaultWidths[columnKey] ?? MIN_COLUMN_WIDTH_PX,
      [widths, defaultWidths]
    );

    useEffect(() => {
      const handleMouseMove = (event: MouseEvent): void => {
        const drag = dragStateRef.current;
        if (!drag) return;
        const nextWidth = Math.max(MIN_COLUMN_WIDTH_PX, drag.startWidth + (event.clientX - drag.startX));
        setWidths((previous) => ({ ...previous, [drag.columnKey]: nextWidth }));
      };

      const handleMouseUp = (): void => {
        if (!dragStateRef.current) return;
        dragStateRef.current = null;
        setResizingColumnKey(null);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Reads back the latest state rather than closing over `widths`,
        // which would be stale inside this effect's own closure.
        setWidths((current) => {
          ApplicationUserPreferenceUtility.current.setJSONPreference(
            ApplicationUserPreferenceKeyCON.ENVIRONMENT_OVERVIEW_COLUMN_WIDTHS,
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
      (columnKey: string): ColumnResizeHandleProps => ({
        onMouseDown: (event: React.MouseEvent): void => {
          // Suppresses native text selection while dragging - same reason
          // TableSelectionService does this for cell-range dragging.
          event.preventDefault();
          dragStateRef.current = { columnKey, startX: event.clientX, startWidth: getColumnWidth(columnKey) };
          setResizingColumnKey(columnKey);
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        },
      }),
      [getColumnWidth]
    );

    return { getColumnWidth, getResizeHandleProps, resizingColumnKey };
  }
}
