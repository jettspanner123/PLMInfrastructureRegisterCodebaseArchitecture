import React, { useCallback, useEffect, useRef, useState } from 'react';

// A rectangular (row, column) range in a table's own visible-grid coordinate
// space — not tied to any particular table's data shape. Row/column indexes
// are positions within whatever array the caller is currently rendering
// (e.g. filteredResources, visibleColumns), zero-indexed, inclusive on both
// ends. A whole-row selection is just a rectangle spanning every column; a
// whole-column selection is a rectangle spanning every row — there's no
// separate "row selection" or "column selection" type, which keeps the
// copy/highlight logic uniform across all three trigger types (cell, row
// header, column header).
interface TableSelectionRectangle {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

interface TableSelectionPoint {
  row: number;
  col: number;
}

type TableSelectionDragAxis = 'cell' | 'row' | 'column';

const SELECTION_TINT_CLASS_NAME = 'bg-[#0C2086]/10 dark:bg-blue-400/10';

export interface TableSelectionMouseHandlers {
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

export interface UseTableSelectionParams {
  rowCount: number;
  columnCount: number;
  // Returns the raw text for one (row, col) cell, used only to build the
  // tab/newline-separated clipboard payload on Ctrl+C — never rendered.
  getCellValue: (rowIndex: number, columnIndex: number) => string;
}

export interface UseTableSelectionResult {
  // Attach to the table's own scroll/card container — a mousedown outside
  // this element clears the current selection, matching every other
  // dismissible panel in this app (dropdowns, modals).
  containerRef: React.RefObject<HTMLDivElement | null>;
  isCellSelected: (rowIndex: number, columnIndex: number) => boolean;
  // undefined when the cell has no selection-perimeter edge to draw (either
  // unselected, or selected but fully interior to the selection rectangle).
  getCellSelectionBoxShadow: (rowIndex: number, columnIndex: number) => string | undefined;
  // The selection tint's background class (empty string when unselected) —
  // for plain <td>s that aren't CopyableTableCellSharedComponent (the row
  // number column, empty-value cells) and so have no isSelected prop to
  // reach for instead.
  getCellSelectionClassName: (rowIndex: number, columnIndex: number) => string;
  getCellHandlers: (rowIndex: number, columnIndex: number) => TableSelectionMouseHandlers;
  getRowHeaderHandlers: (rowIndex: number) => TableSelectionMouseHandlers;
  getColumnHeaderHandlers: (columnIndex: number) => TableSelectionMouseHandlers;
  clearSelection: () => void;
}

function computeRectangleForAxis(
  axis: TableSelectionDragAxis,
  anchor: TableSelectionPoint,
  focus: TableSelectionPoint,
  rowCount: number,
  columnCount: number
): TableSelectionRectangle {
  if (axis === 'row') {
    return {
      startRow: Math.min(anchor.row, focus.row),
      endRow: Math.max(anchor.row, focus.row),
      startCol: 0,
      endCol: Math.max(0, columnCount - 1),
    };
  }
  if (axis === 'column') {
    return {
      startRow: 0,
      endRow: Math.max(0, rowCount - 1),
      startCol: Math.min(anchor.col, focus.col),
      endCol: Math.max(anchor.col, focus.col),
    };
  }
  return {
    startRow: Math.min(anchor.row, focus.row),
    endRow: Math.max(anchor.row, focus.row),
    startCol: Math.min(anchor.col, focus.col),
    endCol: Math.max(anchor.col, focus.col),
  };
}

// Excel-like multi-cell/row/column selection for this app's data tables.
// Reused across every table that needs it (Resources, Configure
// Subscriptions) rather than built per-screen - the only thing each table
// supplies is its own row/column counts and a way to read a cell's raw text.
//
// Click-vs-drag is handled almost entirely by relying on the browser's own
// native `click` event semantics rather than reimplementing them: a native
// click only fires when the same element receives both mousedown and
// mouseup, so a genuine drag to a different cell never fires `click` on the
// origin cell at all. That's exactly the "plain click copies; drag only
// selects" behavior this app wants - CopyableTableCellSharedComponent's own
// existing onClick-triggered copy (unchanged) ends up naturally scoped to
// "no real drag happened", with one explicit exception this hook can't
// control for: Shift+click targets the SAME element on mousedown and
// mouseup (no drag), so native `click` still fires even though the result
// is a multi-cell range - CopyableTableCellSharedComponent checks
// `event.shiftKey` itself and skips copying in that case.
export default class TableSelectionService {
  public static current: TableSelectionService = new TableSelectionService();

  public useTableSelection({ rowCount, columnCount, getCellValue }: UseTableSelectionParams): UseTableSelectionResult {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [selection, setSelection] = useState<TableSelectionRectangle | null>(null);

    const isPointerDownRef = useRef<boolean>(false);
    const dragAxisRef = useRef<TableSelectionDragAxis>('cell');
    const anchorPointRef = useRef<TableSelectionPoint | null>(null);
    const selectionRef = useRef<TableSelectionRectangle | null>(selection);
    const getCellValueRef = useRef(getCellValue);

    useEffect(() => {
      selectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
      getCellValueRef.current = getCellValue;
    });

    const beginSelectionDrag = useCallback(
      (axis: TableSelectionDragAxis, row: number, col: number, event: React.MouseEvent): void => {
        if (event.shiftKey && anchorPointRef.current) {
          setSelection(computeRectangleForAxis(axis, anchorPointRef.current, { row, col }, rowCount, columnCount));
          return;
        }

        // Suppresses native text selection (the browser's default mousedown
        // behavior over cell text), which would otherwise visually compete
        // with this feature's own selection highlight during a drag.
        event.preventDefault();

        const point: TableSelectionPoint = { row, col };
        anchorPointRef.current = point;
        dragAxisRef.current = axis;
        isPointerDownRef.current = true;
        setSelection(computeRectangleForAxis(axis, point, point, rowCount, columnCount));
      },
      [rowCount, columnCount]
    );

    const continueSelectionDrag = useCallback(
      (row: number, col: number): void => {
        if (!isPointerDownRef.current || !anchorPointRef.current) return;
        setSelection(
          computeRectangleForAxis(dragAxisRef.current, anchorPointRef.current, { row, col }, rowCount, columnCount)
        );
      },
      [rowCount, columnCount]
    );

    useEffect(() => {
      const handleDocumentMouseUp = (): void => {
        isPointerDownRef.current = false;
      };
      document.addEventListener('mouseup', handleDocumentMouseUp);
      return () => document.removeEventListener('mouseup', handleDocumentMouseUp);
    }, []);

    // Clears on a click outside the table — same convention as this app's
    // dropdowns/popovers.
    useEffect(() => {
      const handleDocumentMouseDown = (event: MouseEvent): void => {
        if (!selectionRef.current) return;
        const container = containerRef.current;
        if (container && event.target instanceof Node && !container.contains(event.target)) {
          setSelection(null);
        }
      };
      document.addEventListener('mousedown', handleDocumentMouseDown);
      return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
    }, []);

    // Escape clears the selection; Ctrl/Cmd+C copies it as tab/newline-
    // separated text (pastes directly into Excel/Sheets). Skips the copy
    // when focus is in an editable field or a genuine browser text
    // selection exists, so this never hijacks a normal text copy elsewhere
    // on the page.
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          if (selectionRef.current) setSelection(null);
          return;
        }

        const isCopyShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c';
        if (!isCopyShortcut) return;

        const currentSelection = selectionRef.current;
        if (!currentSelection) return;

        const activeElement = document.activeElement;
        const isEditableFocused =
          activeElement instanceof HTMLElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable);
        if (isEditableFocused) return;
        if (window.getSelection()?.toString()) return;

        event.preventDefault();

        const rows: string[] = [];
        for (let row = currentSelection.startRow; row <= currentSelection.endRow; row++) {
          const cols: string[] = [];
          for (let col = currentSelection.startCol; col <= currentSelection.endCol; col++) {
            cols.push(getCellValueRef.current(row, col));
          }
          rows.push(cols.join('\t'));
        }
        navigator.clipboard.writeText(rows.join('\n')).catch(() => {});
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isCellSelected = useCallback(
      (row: number, col: number): boolean => {
        if (!selection) return false;
        return row >= selection.startRow && row <= selection.endRow && col >= selection.startCol && col <= selection.endCol;
      },
      [selection]
    );

    const getCellSelectionBoxShadow = useCallback(
      (row: number, col: number): string | undefined => {
        if (!selection) return undefined;
        if (row < selection.startRow || row > selection.endRow || col < selection.startCol || col > selection.endCol) {
          return undefined;
        }

        const segments: string[] = [];
        if (row === selection.startRow) segments.push('inset 0 2px 0 0 var(--table-selection-border-color)');
        if (row === selection.endRow) segments.push('inset 0 -2px 0 0 var(--table-selection-border-color)');
        if (col === selection.startCol) segments.push('inset 2px 0 0 0 var(--table-selection-border-color)');
        if (col === selection.endCol) segments.push('inset -2px 0 0 0 var(--table-selection-border-color)');
        return segments.length > 0 ? segments.join(', ') : undefined;
      },
      [selection]
    );

    const getCellSelectionClassName = useCallback(
      (row: number, col: number): string => (isCellSelected(row, col) ? SELECTION_TINT_CLASS_NAME : ''),
      [isCellSelected]
    );

    const getCellHandlers = useCallback(
      (row: number, col: number): TableSelectionMouseHandlers => ({
        onMouseDown: (event: React.MouseEvent) => beginSelectionDrag('cell', row, col, event),
        onMouseEnter: () => continueSelectionDrag(row, col),
      }),
      [beginSelectionDrag, continueSelectionDrag]
    );

    const getRowHeaderHandlers = useCallback(
      (row: number): TableSelectionMouseHandlers => ({
        onMouseDown: (event: React.MouseEvent) => beginSelectionDrag('row', row, 0, event),
        onMouseEnter: () => continueSelectionDrag(row, 0),
      }),
      [beginSelectionDrag, continueSelectionDrag]
    );

    const getColumnHeaderHandlers = useCallback(
      (col: number): TableSelectionMouseHandlers => ({
        onMouseDown: (event: React.MouseEvent) => beginSelectionDrag('column', 0, col, event),
        onMouseEnter: () => continueSelectionDrag(0, col),
      }),
      [beginSelectionDrag, continueSelectionDrag]
    );

    const clearSelection = useCallback((): void => {
      setSelection(null);
    }, []);

    return {
      containerRef,
      isCellSelected,
      getCellSelectionBoxShadow,
      getCellSelectionClassName,
      getCellHandlers,
      getRowHeaderHandlers,
      getColumnHeaderHandlers,
      clearSelection,
    };
  }
}
