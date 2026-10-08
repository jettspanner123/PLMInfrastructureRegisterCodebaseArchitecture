import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ServerOff, FilterX, Plus, Trash2 } from 'lucide-react';
import DataTableContainerSharedComponent from '../../Shared/Components/DataTableContainerSharedComponent';
import TableHeaderCellSharedComponent from '../../Shared/Components/TableHeaderCellSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ExpandableSearchSharedComponent from '../../Shared/Components/ExpandableSearchSharedComponent';
import CopyableTableCellSharedComponent from '../../Shared/Components/CopyableTableCellSharedComponent';
import ViewEditModeToggleSharedComponent from '../../Shared/Components/ViewEditModeToggleSharedComponent';
import PrimaryActionButtonSharedComponent from '../../Shared/Components/PrimaryActionButtonSharedComponent';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import CustomSelectSharedComponent from '../../Shared/Components/CustomSelectSharedComponent';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import CreateOptionModalController from './Components/CreateOptionModalController';
import TableSelectionService from '../../Services/TableSelectionService';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import EnvironmentOverviewColumnWidthService from './Services/EnvironmentOverviewColumnWidthService';
import EnvironmentOverviewCON, { type EnvironmentOverviewColumnDef } from './Constants/EnvironmentOverviewCON';
import ViewEditModeCON from '../../Constants/ViewEditModeCON';
import AnonymousClientIdentityUtility from '../../Utilities/AnonymousClientIdentityUtility';
import ActionItemsLineParserUtility from '../../Utilities/ActionItemsLineParserUtility';
import type EnvironmentOverviewInterfaceModel from '../../Models/EnvironmentOverviewInterfaceModel';
import type DraftEnvironmentOverviewRowInterfaceModel from '../../Models/DraftEnvironmentOverviewRowInterfaceModel';
import type CreateEnvironmentOverviewRequestInterfaceModel from '../../Models/CreateEnvironmentOverviewRequestInterfaceModel';

export default function EnvironmentOverviewScreenController(): React.JSX.Element {
  const { data: environments = [], isLoading } =
    TanstackQueryClientService.current.environmentOverview.useEnvironmentOverviewsQuery();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draftRow, setDraftRow] = useState<DraftEnvironmentOverviewRowInterfaceModel | null>(null);
  const [isDraftInvalid, setIsDraftInvalid] = useState<boolean>(false);
  const environmentInputRef = useRef<HTMLInputElement | null>(null);

  // Which rows' Action Items / Updates column is showing every entry rather
  // than just the first few dated ones - per-row since each row's history is
  // independent. Resets on reload (not persisted) - matches Edit Mode's own
  // "resets on reload" convention for this screen's other transient UI state.
  const [expandedActionItemsRowIds, setExpandedActionItemsRowIds] = useState<Set<string>>(new Set());
  const actionItemsScrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Which row has an active "Add Entry" draft open - only one at a time
  // across the whole table (clicking "+ Add Entry" elsewhere closes any
  // other open draft), matching how only one modal/dropdown is normally
  // open at once elsewhere in this app. Edit-Mode-gated: "Add Entry" itself
  // only renders while Edit Mode is active, matching Status editing's own
  // precedent on this screen.
  const [actionItemDraftRowId, setActionItemDraftRowId] = useState<string | null>(null);
  const [actionItemDraftText, setActionItemDraftText] = useState<string>('');
  const [actionItemDraftError, setActionItemDraftError] = useState<string | null>(null);
  const actionItemDraftInputRef = useRef<HTMLTextAreaElement | null>(null);

  // The one Action Items entry currently pending delete confirmation, if
  // any - lineIndex doubles as both "position in the currently-displayed
  // list" and "position in the full stored list", since every visible line
  // is always a genuine prefix of the full list (see
  // getVisibleActionItemsLines). lineText is kept only for the confirmation
  // modal's own preview text, not sent to the server.
  const [deletingActionItem, setDeletingActionItem] = useState<{
    rowId: string;
    lineIndex: number;
    lineText: string;
  } | null>(null);

  // Lifted (not self-contained) specifically on this screen, unlike Resources
  // - the Status column needs to know whether Edit Mode is active to decide
  // between its read-only copyable cell and its editable dropdown.
  const [editMode, setEditMode] = useState<string>(ViewEditModeCON.VIEW);
  const isEditMode = editMode === ViewEditModeCON.EDIT;

  // Which row's Status dropdown is mid-update (disables that one dropdown
  // and shows a pending indicator) and which row most recently failed (shows
  // an inline error under that row's cell, auto-clearing after a few
  // seconds) - keyed by row id since in principle more than one row could be
  // mid-edit, even though only one dropdown is normally open at a time.
  const [pendingStatusRowId, setPendingStatusRowId] = useState<string | null>(null);
  const [statusErrorByRowId, setStatusErrorByRowId] = useState<{ rowId: string; message: string } | null>(null);
  const statusErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Which row + field (Status or Sponsor) opened the "Add New Option" modal
  // - null when the modal isn't open. Lets onCreated below know which row to
  // immediately select+save the new option onto, combining SignForge's own
  // "auto-select the newly created option" pattern with this screen's
  // "selecting a dropdown value saves immediately" behavior. Shared across
  // every growable-dropdown field rather than one target/open pair per
  // field, since only one of these modals is ever open at a time.
  const [optionModalTarget, setOptionModalTarget] = useState<{ fieldName: string; rowId: string } | null>(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState<boolean>(false);

  // Which cells (keyed "<rowId>:<columnKey>") are mid-save after a blur, and
  // the most recent field-save failure, if any - unlike Status (one
  // dropdown open at a time), several Purpose/Priority/DNS URL cells across
  // different rows could plausibly be mid-save at once, so pending state is
  // a Set rather than a single row id.
  const [pendingFieldEditKeys, setPendingFieldEditKeys] = useState<Set<string>>(new Set());
  const [fieldEditErrorByKey, setFieldEditErrorByKey] = useState<{ key: string; message: string } | null>(null);
  const fieldEditErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (statusErrorTimerRef.current !== null) clearTimeout(statusErrorTimerRef.current);
      if (fieldEditErrorTimerRef.current !== null) clearTimeout(fieldEditErrorTimerRef.current);
    };
  }, []);

  const { data: statusOptions = [] } =
    TanstackQueryClientService.current.environmentOverview.useOptionsQuery('Status');
  const statusSelectOptions = useMemo(
    () => statusOptions.map((option) => ({ value: option, label: option })),
    [statusOptions]
  );

  const { data: sponsorOptions = [] } =
    TanstackQueryClientService.current.environmentOverview.useOptionsQuery('Sponsor');
  const sponsorSelectOptions = useMemo(
    () => sponsorOptions.map((option) => ({ value: option, label: option })),
    [sponsorOptions]
  );

  const filteredEnvironments = useMemo(() => {
    const lowerCaseQuery = searchQuery.trim().toLowerCase();
    if (!lowerCaseQuery) return environments;

    return environments.filter((environment) =>
      [
        ...EnvironmentOverviewCON.TEXT_COLUMNS.map((column) => environment[column.key]),
        environment.actionItemsUpdates,
        environment.status,
      ].some((value) => typeof value === 'string' && value.toLowerCase().includes(lowerCaseQuery))
    );
  }, [environments, searchQuery]);

  // Excel-like multi-cell/row/column selection, shared with Resources and
  // Configure Subscriptions - see TableSelectionService.ts for the full
  // design. Column indexes follow TEXT_COLUMNS, then Action Items, then
  // Status. The draft row below is deliberately NOT part of this - it has
  // real inputs instead of copyable cells, so it isn't selectable/copyable.
  const tableSelection = TableSelectionService.current.useTableSelection({
    rowCount: filteredEnvironments.length,
    columnCount: EnvironmentOverviewCON.TOTAL_COLUMN_COUNT,
    getCellValue: (rowIndex, colIndex) => {
      const environment = filteredEnvironments[rowIndex];
      if (!environment) return '';
      if (colIndex === EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX) return environment.actionItemsUpdates ?? '';
      if (colIndex === EnvironmentOverviewCON.STATUS_COLUMN_INDEX) return environment.status;
      return environment[EnvironmentOverviewCON.TEXT_COLUMNS[colIndex].key]?.toString() ?? '';
    },
  });

  // Excel-style draggable column borders, persisted to localStorage - see
  // EnvironmentOverviewColumnWidthService.ts. Scoped to this one table for
  // now, not a cross-table service like TableSelectionService.
  const columnWidths = EnvironmentOverviewColumnWidthService.current.useColumnWidths(
    EnvironmentOverviewCON.DEFAULT_COLUMN_WIDTHS
  );

  const createMutation = TanstackQueryClientService.current.environmentOverview.useCreateEnvironmentOverviewMutation({
    onSuccess: () => {
      setDraftRow(null);
      setIsDraftInvalid(false);
    },
  });

  const updateStatusMutation = TanstackQueryClientService.current.environmentOverview.useUpdateEnvironmentStatusMutation({
    onSuccess: () => {
      setPendingStatusRowId(null);
    },
    onError: (error) => {
      setPendingStatusRowId((currentRowId) => {
        if (currentRowId) {
          if (statusErrorTimerRef.current !== null) clearTimeout(statusErrorTimerRef.current);
          setStatusErrorByRowId({ rowId: currentRowId, message: error.message });
          statusErrorTimerRef.current = setTimeout(() => setStatusErrorByRowId(null), 4000);
        }
        return null;
      });
    },
  });

  // Fires the moment a Status option is picked - no separate confirm step.
  // The cell keeps showing its last known-good value until the server
  // responds (no optimistic update), so a failure never looks like a
  // silent revert - it just never visually changed in the first place.
  const handleStatusChange = (rowId: string, newStatus: string): void => {
    setPendingStatusRowId(rowId);
    updateStatusMutation.mutate({
      id: rowId,
      request: { status: newStatus, changedByClientId: AnonymousClientIdentityUtility.current.getOrCreateClientId() },
    });
  };

  const handleOpenOptionModal = (fieldName: string, rowId: string): void => {
    setOptionModalTarget({ fieldName, rowId });
    setIsOptionModalOpen(true);
  };

  // Sponsor saves immediately on selection, same UX as Status - it goes
  // through the generic Field endpoint (handleFieldSave) rather than
  // Status's own dedicated UpdateStatus+history mechanism, since Sponsor
  // carries none of Status's audit-trail requirement.
  const handleSponsorChange = (rowId: string, newSponsor: string, previousSponsor: string | null): void => {
    handleFieldSave(rowId, 'sponsor', 'Sponsor', newSponsor, previousSponsor);
  };

  const handleOptionCreated = (newValue: string): void => {
    if (!optionModalTarget) return;

    const { fieldName, rowId } = optionModalTarget;
    if (fieldName === 'Status') {
      handleStatusChange(rowId, newValue);
    } else if (fieldName === 'Sponsor') {
      const environment = environments.find((candidate) => candidate.id === rowId);
      handleSponsorChange(rowId, newValue, environment?.sponsor ?? null);
    }
    setOptionModalTarget(null);
  };

  const updateFieldMutation = TanstackQueryClientService.current.environmentOverview.useUpdateFieldMutation();

  // Shared by every field that persists through the generic Field endpoint -
  // Purpose/Priority/DNS URL's textareas call this on blur (the user's own
  // confirmed choice over an explicit save button), Sponsor's dropdown calls
  // it immediately on selection (matching Status's own save-on-select UX).
  // Skips the request entirely when the trimmed value didn't actually
  // change, since a blur that didn't edit anything (or a dropdown re-
  // selecting its own current value) would otherwise fire a no-op save.
  // Empty string and null are treated as equivalent "nothing here" states
  // for this comparison, matching UpdateFieldAsynchronous's own
  // normalisation on the backend. Pending/error state is tracked per call
  // (not via the mutation hook's own onSuccess/onError) since several of
  // these cells could be mid-save at once.
  const handleFieldSave = (
    rowId: string,
    columnKey: keyof EnvironmentOverviewInterfaceModel,
    fieldName: string,
    rawValue: string,
    originalValue: string | null
  ): void => {
    const trimmedNewValue = rawValue.trim();
    const trimmedOriginalValue = (originalValue ?? '').trim();
    if (trimmedNewValue === trimmedOriginalValue) return;

    const cellKey = `${rowId}:${String(columnKey)}`;
    setPendingFieldEditKeys((previous) => new Set(previous).add(cellKey));
    setFieldEditErrorByKey((current) => (current?.key === cellKey ? null : current));

    updateFieldMutation.mutate(
      { id: rowId, request: { fieldName, value: trimmedNewValue || null } },
      {
        onSuccess: () => {
          setPendingFieldEditKeys((previous) => {
            const next = new Set(previous);
            next.delete(cellKey);
            return next;
          });
        },
        onError: (error) => {
          setPendingFieldEditKeys((previous) => {
            const next = new Set(previous);
            next.delete(cellKey);
            return next;
          });
          if (fieldEditErrorTimerRef.current !== null) clearTimeout(fieldEditErrorTimerRef.current);
          setFieldEditErrorByKey({
            key: cellKey,
            message: error instanceof Error ? error.message : 'Failed to update the field.',
          });
          fieldEditErrorTimerRef.current = setTimeout(() => {
            setFieldEditErrorByKey((current) => (current?.key === cellKey ? null : current));
          }, 4000);
        },
      }
    );
  };

  const addActionItemMutation = TanstackQueryClientService.current.environmentOverview.useAddActionItemMutation({
    onSuccess: () => {
      setActionItemDraftRowId(null);
      setActionItemDraftText('');
      setActionItemDraftError(null);
    },
    onError: (error) => {
      setActionItemDraftError(error.message);
    },
  });

  // Same three-letter-month format ActionItemsLineParserUtility normalizes
  // every other date to, and the exact format the backend actually persists
  // (EnvironmentOverviewService.AddActionItemAsynchronous) - so the draft
  // preview shown before saving looks identical to how it'll render after.
  const getTodayFormattedDate = (): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${months[today.getMonth()]}-${today.getFullYear()}`;
  };

  const handleOpenActionItemDraft = (rowId: string): void => {
    setActionItemDraftRowId(rowId);
    setActionItemDraftText('');
    setActionItemDraftError(null);
  };

  const handleDiscardActionItemDraft = (): void => {
    setActionItemDraftRowId(null);
    setActionItemDraftText('');
    setActionItemDraftError(null);
  };

  const handleSaveActionItemDraft = (): void => {
    if (!actionItemDraftRowId) return;
    const trimmedNote = actionItemDraftText.trim();
    if (!trimmedNote) {
      setActionItemDraftError('A note is required.');
      return;
    }
    addActionItemMutation.mutate({ id: actionItemDraftRowId, request: { note: trimmedNote } });
  };

  // Escape discards the draft; Ctrl/Cmd+Enter saves it. stopPropagation on
  // both for the exact same reason the Add Environment draft row does this -
  // stops TableSelectionService's own document-level Escape handler from
  // also firing (a harmless no-op here, but no reason to let it run at all
  // while editing a draft field).
  const handleActionItemDraftKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      handleDiscardActionItemDraft();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.stopPropagation();
      handleSaveActionItemDraft();
    }
  };

  useEffect(() => {
    if (actionItemDraftRowId) actionItemDraftInputRef.current?.focus();
  }, [actionItemDraftRowId]);

  const deleteActionItemMutation = TanstackQueryClientService.current.environmentOverview.useDeleteActionItemMutation({
    onSuccess: () => {
      setDeletingActionItem(null);
    },
  });

  const handleRequestDeleteActionItem = (rowId: string, lineIndex: number, lineText: string): void => {
    setDeletingActionItem({ rowId, lineIndex, lineText });
  };

  const handleConfirmDeleteActionItem = async (): Promise<void> => {
    if (!deletingActionItem) return;
    await deleteActionItemMutation.mutateAsync({
      id: deletingActionItem.rowId,
      lineIndex: deletingActionItem.lineIndex,
    });
  };

  const handleToggleActionItemsExpanded = (rowId: string): void => {
    setExpandedActionItemsRowIds((previous) => {
      const next = new Set(previous);
      if (next.has(rowId)) {
        next.delete(rowId);
        // Collapsing can leave the cell's own scroll position further down
        // than the now-shorter content allows - reset it so "Show Less"
        // actually shows the first few entries again, not an empty-looking
        // scrolled-past view.
        const scrollEl = actionItemsScrollRefs.current.get(rowId);
        if (scrollEl) scrollEl.scrollTop = 0;
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  // Splits a cell's full line list into what the collapsed view shows: every
  // line up through the Nth real dated line, PLUS any date-less continuation
  // lines that follow it - stopping only once the (N+1)th real date would
  // begin. A continuation line is never cut off mid-entry, matching the
  // explicit "every line is crucial" requirement - only whole dated entries
  // (and everything that precedes the next one) are ever hidden.
  const getVisibleActionItemsLines = (allLines: string[]): { visibleLines: string[]; hasMore: boolean } => {
    const visibleLines: string[] = [];
    let realDateCount = 0;

    for (const line of allLines) {
      const parsed = ActionItemsLineParserUtility.current.parseLine(line);
      if (parsed.date !== null) {
        realDateCount += 1;
        if (realDateCount > EnvironmentOverviewCON.MAX_VISIBLE_ACTION_ITEMS_DATES) {
          return { visibleLines, hasMore: true };
        }
      }
      visibleLines.push(line);
    }

    return { visibleLines, hasMore: false };
  };

  // Scrolls to and focuses the draft row the moment it's added - keyed on a
  // boolean (not the draft object itself), since the object gets a new
  // reference on every keystroke and re-scrolling/re-focusing mid-typing
  // would be disruptive. Works in both bounded Table Height modes (scrolls
  // the table's own container) and Extended mode (scrolls the page via
  // scrollIntoView), without needing to know which mode is active.
  const hasDraftRow = draftRow !== null;
  useEffect(() => {
    if (!hasDraftRow) return;
    const container = tableSelection.containerRef.current;
    if (container) {
      if (container.scrollHeight > container.clientHeight) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      } else {
        container.scrollIntoView({ block: 'end', behavior: 'smooth' });
      }
    }
    environmentInputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDraftRow]);

  const handleAddEnvironmentClick = (): void => {
    // A second click while a draft is already pending just refocuses it
    // rather than creating a second one.
    if (draftRow) {
      environmentInputRef.current?.focus();
      return;
    }
    setDraftRow(EnvironmentOverviewCON.EMPTY_DRAFT_ROW);
  };

  const handleDraftFieldChange = (field: keyof DraftEnvironmentOverviewRowInterfaceModel, value: string): void => {
    setDraftRow((previous) => (previous ? { ...previous, [field]: value } : previous));
    if (field === 'environment' && isDraftInvalid) setIsDraftInvalid(false);
  };

  const handleDiscardDraft = (): void => {
    setDraftRow(null);
    setIsDraftInvalid(false);
  };

  const handleSaveDraft = (): void => {
    if (!draftRow) return;
    if (!draftRow.environment.trim()) {
      setIsDraftInvalid(true);
      environmentInputRef.current?.focus();
      return;
    }

    const request: CreateEnvironmentOverviewRequestInterfaceModel = {
      environment: draftRow.environment.trim(),
      purpose: draftRow.purpose || null,
      sponsor: draftRow.sponsor || null,
      currentUptimeSchedule: draftRow.currentUptimeSchedule || null,
      priority1: draftRow.priority1 || null,
      priority2: draftRow.priority2 || null,
      priority3: draftRow.priority3 || null,
      actionItemsUpdates: draftRow.actionItemsUpdates || null,
      configurationCustomisationVersion: draftRow.configurationCustomisationVersion || null,
      dnsurl: draftRow.dnsurl || null,
    };
    createMutation.mutate(request);
  };

  // Escape discards the draft; Ctrl/Cmd+Enter saves it. stopPropagation on
  // both stops them from also reaching TableSelectionService's own document-
  // level Escape handler (which would just clear the table selection - a
  // harmless no-op here, but there's no reason to let it fire at all while
  // editing a draft field).
  const handleDraftKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      handleDiscardDraft();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.stopPropagation();
      handleSaveDraft();
    }
  };

  // A thin drag handle straddling a header's right border - the hit zone is
  // deliberately much wider (16px, 8 on each side of the true border) than
  // the visible line (1-2px), since a pixel-perfect hit zone is frustrating
  // to grab; only the thin inner line is actually drawn, so the extra width
  // costs nothing visually. Transparent until hovered (subtle line) or
  // actively dragged (brighter, thicker line), matching Excel's own "only
  // show it when it matters" treatment.
  const renderResizeHandle = (columnKey: string): React.ReactNode => {
    const isResizing = columnWidths.resizingColumnKey === columnKey;
    return (
      <div
        onMouseDown={(event) => {
          // Stops this from also bubbling into the header's own mousedown
          // (TableSelectionService's column-select-by-header-click) - same
          // reason the Environment column's filter dropdown does this.
          // Without it, every resize drag also started a column selection.
          event.stopPropagation();
          columnWidths.getResizeHandleProps(columnKey).onMouseDown(event);
        }}
        className="absolute inset-y-0 -right-2 w-4 cursor-col-resize select-none z-10 group/resize"
      >
        <div
          className={`absolute inset-y-0 right-2 transition-colors ${
            isResizing ? 'w-0.5 bg-blue-300' : 'w-px bg-transparent group-hover/resize:bg-white/40'
          }`}
        />
      </div>
    );
  };

  // Purpose/Priority1-3/DNS URL's Edit Mode rendering - an uncontrolled
  // textarea (defaultValue, not value) rather than React-controlled state
  // per keystroke: the DOM owns what's typed, so an unrelated re-render
  // elsewhere in the table (another row's pending/error state changing)
  // can't reset a user's in-progress typing in this cell. The key stays
  // tied to the row+column, never to the value itself, so React doesn't
  // force a remount mid-typing either.
  const renderEditableTextCell = (
    environment: EnvironmentOverviewInterfaceModel,
    column: EnvironmentOverviewColumnDef,
    fieldName: string,
    columnWidth: number
  ): React.ReactNode => {
    const cellKey = `${environment.id}:${column.key}`;
    const isPending = pendingFieldEditKeys.has(cellKey);
    const cellError = fieldEditErrorByKey?.key === cellKey ? fieldEditErrorByKey.message : null;
    const currentValue = (environment[column.key] as string | null) ?? '';

    return (
      <td key={column.key} style={{ width: columnWidth }} className="px-3 py-2 align-top">
        <textarea
          key={cellKey}
          defaultValue={currentValue}
          disabled={isPending}
          rows={2}
          aria-label={column.label}
          onBlur={(event) =>
            handleFieldSave(environment.id, column.key, fieldName, event.target.value, currentValue)
          }
          className={EnvironmentOverviewCON.DRAFT_INPUT_CLASS_NAME}
        />
        {cellError && <p className="mt-1 text-[10px] text-rose-500">{cellError}</p>}
      </td>
    );
  };

  const renderTextCell = (
    environment: EnvironmentOverviewInterfaceModel,
    column: EnvironmentOverviewColumnDef,
    rowIndex: number,
    colIndex: number
  ): React.ReactNode => {
    const displayValue = environment[column.key];
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, colIndex);

    const columnWidth = columnWidths.getColumnWidth(column.key);

    if (isEditMode && column.key === 'sponsor') {
      return renderSponsorCell(environment, columnWidth);
    }

    const editableFieldName = EnvironmentOverviewCON.EDITABLE_TEXT_FIELD_NAMES[column.key];
    if (isEditMode && editableFieldName) {
      return renderEditableTextCell(environment, column, editableFieldName, columnWidth);
    }

    if (displayValue === null || displayValue === '') {
      return (
        <td
          key={column.key}
          onMouseDown={cellHandlers.onMouseDown}
          onMouseEnter={cellHandlers.onMouseEnter}
          style={{ boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex), width: columnWidth }}
          className={EnvironmentOverviewCON.CELL_CLASS_NAME}
        >
          <span className="text-slate-300 dark:text-zinc-700">—</span>
        </td>
      );
    }

    const stringValue = displayValue.toString();

    return (
      <CopyableTableCellSharedComponent
        key={column.key}
        value={stringValue}
        ariaLabel={`Copy ${column.label}: ${stringValue}`}
        className={EnvironmentOverviewCON.CELL_CLASS_NAME}
        selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, colIndex)}
        onCellMouseDown={cellHandlers.onMouseDown}
        onCellMouseEnter={cellHandlers.onMouseEnter}
        verticalAlign="top"
        width={columnWidth}
      >
        {stringValue}
      </CopyableTableCellSharedComponent>
    );
  };

  // Most lines in this column follow a "DATE: NOTE" convention (dated
  // history entries, newest-first) - ActionItemsLineParserUtility splits
  // each line into its leading date (if any, normalized to a fixed-width
  // "DD-Mon-YYYY" shape) and the rest. Every line gets a same-shaped tag
  // regardless - a line with no recognizable leading date gets a generic
  // "Unrevealed" tag instead of a real date, rather than being left as bare
  // plain text, since every line is treated as equally worth keeping visible.
  const renderActionItemsLine = (rowId: string, line: string, lineIndex: number): React.ReactNode => {
    const parsed = ActionItemsLineParserUtility.current.parseLine(line);
    const hasDate = parsed.date !== null;

    return (
      <div key={lineIndex} className="flex items-start gap-1.5 group/action-item">
        <span
          className={`shrink-0 mt-px inline-flex items-center justify-center min-w-[72px] rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap ${
            hasDate ? 'bg-[#0C2086] dark:bg-blue-600' : 'bg-slate-400 dark:bg-zinc-600'
          }`}
        >
          {hasDate ? (
            <>
              {parsed.date}
              {parsed.tag ? ` (${parsed.tag})` : ''}
            </>
          ) : (
            'Unrevealed'
          )}
        </span>
        <span className="flex-1 whitespace-pre-wrap break-words">{parsed.note}</span>
        {isEditMode && (
          <button
            type="button"
            onClick={() => handleRequestDeleteActionItem(rowId, lineIndex, line)}
            aria-label="Delete this entry"
            className="shrink-0 mt-px text-slate-300 dark:text-zinc-700 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover/action-item:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  // The "+ Add Entry" control at the very top of a row's cell, or (while a
  // draft is active for this row) the draft itself - today's date in a
  // non-editable pill matching every other entry's own tag, plus a focused
  // textarea for the note. Edit-Mode-gated: never rendered in View Mode,
  // same as the Status column's own editing affordance.
  const renderActionItemDraftOrButton = (rowId: string): React.ReactNode => {
    if (actionItemDraftRowId !== rowId) {
      return (
        <button
          type="button"
          onClick={() => handleOpenActionItemDraft(rowId)}
          className="flex items-center gap-1 font-bold text-[#0C2086] dark:text-blue-400 hover:opacity-80 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Entry
        </button>
      );
    }

    return (
      <div className="flex items-start gap-1.5">
        <span className="shrink-0 mt-px inline-flex items-center justify-center min-w-[72px] rounded-full bg-[#0C2086] dark:bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap">
          {getTodayFormattedDate()}
        </span>
        <div className="flex-1 min-w-0">
          <textarea
            ref={actionItemDraftInputRef}
            name="draft-action-item-note"
            aria-label="New action item note"
            value={actionItemDraftText}
            onChange={(event) => {
              setActionItemDraftText(event.target.value);
              if (actionItemDraftError) setActionItemDraftError(null);
            }}
            onKeyDown={handleActionItemDraftKeyDown}
            placeholder="Type a note…"
            rows={2}
            className="w-full bg-transparent border-b border-dashed border-[#0C2086]/30 dark:border-blue-400/40 focus:border-solid focus:border-[#0C2086] dark:focus:border-blue-400 focus:outline-none resize-y whitespace-pre-wrap break-words placeholder:text-slate-300 dark:placeholder:text-zinc-700"
          />
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[9px]">
              {actionItemDraftError ? (
                <span className="text-rose-500 dark:text-rose-400">{actionItemDraftError}</span>
              ) : (
                <span className="text-slate-400 dark:text-zinc-500">Ctrl+Enter to save · Esc to discard</span>
              )}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscardActionItemDraft}
                className="font-bold text-slate-400 dark:text-zinc-500 hover:opacity-80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveActionItemDraft}
                disabled={addActionItemMutation.isPending || !actionItemDraftText.trim()}
                className="font-bold underline text-[#0C2086] dark:text-blue-400 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {addActionItemMutation.isPending ? 'Saving…' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActionItemsCell = (
    environment: EnvironmentOverviewInterfaceModel,
    rowIndex: number
  ): React.ReactNode => {
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX);
    const isExpanded = expandedActionItemsRowIds.has(environment.id);
    const allLines = environment.actionItemsUpdates ? environment.actionItemsUpdates.split('\n') : [];
    const { visibleLines, hasMore } = isExpanded
      ? { visibleLines: allLines, hasMore: false }
      : getVisibleActionItemsLines(allLines);

    return (
      <td
        key="actionItemsUpdates"
        onMouseDown={cellHandlers.onMouseDown}
        onMouseEnter={cellHandlers.onMouseEnter}
        style={{
          boxShadow: tableSelection.getCellSelectionBoxShadow(rowIndex, EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX),
          width: columnWidths.getColumnWidth('actionItemsUpdates'),
        }}
        className="px-3 py-2 align-top"
      >
        {allLines.length > 0 || isEditMode ? (
          <div
            ref={(el) => {
              if (el) actionItemsScrollRefs.current.set(environment.id, el);
              else actionItemsScrollRefs.current.delete(environment.id);
            }}
            className="max-h-40 overflow-y-auto space-y-2 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-zinc-300 pr-1"
          >
            {isEditMode && renderActionItemDraftOrButton(environment.id)}
            {visibleLines.map((line, lineIndex) => renderActionItemsLine(environment.id, line, lineIndex))}
            {hasMore && (
              <button
                type="button"
                onClick={() => handleToggleActionItemsExpanded(environment.id)}
                className="block ml-auto font-bold underline text-[#0C2086] dark:text-blue-400 hover:opacity-80 cursor-pointer"
              >
                See All
              </button>
            )}
            {isExpanded && (
              <button
                type="button"
                onClick={() => handleToggleActionItemsExpanded(environment.id)}
                className="block ml-auto font-bold underline text-[#0C2086] dark:text-blue-400 hover:opacity-80 cursor-pointer"
              >
                Show Less
              </button>
            )}
          </div>
        ) : (
          <span className="text-slate-300 dark:text-zinc-700">—</span>
        )}
      </td>
    );
  };

  const renderStatusCell = (environment: EnvironmentOverviewInterfaceModel, rowIndex: number): React.ReactNode => {
    const cellHandlers = tableSelection.getCellHandlers(rowIndex, EnvironmentOverviewCON.STATUS_COLUMN_INDEX);
    const statusText = environment.status;

    if (isEditMode) {
      const isPending = pendingStatusRowId === environment.id;
      const rowError = statusErrorByRowId?.rowId === environment.id ? statusErrorByRowId.message : null;

      return (
        <td
          key="status"
          style={{ width: columnWidths.getColumnWidth('status') }}
          className="px-3 py-2 align-top"
        >
          <CustomSelectSharedComponent
            value={environment.status}
            onChange={(newStatus) => handleStatusChange(environment.id, newStatus)}
            options={statusSelectOptions}
            searchable
            size="sm"
            disabled={isPending}
            // Status is this table's last (rightmost) column - a left-
            // anchored panel would grow further right and overflow past the
            // table/viewport edge, since the trigger itself is much
            // narrower than the panel's own min-width.
            dropdownAnchor="right"
            footerAction={{
              label: 'Add New Status',
              icon: <Plus className="w-3.5 h-3.5" />,
              onClick: () => handleOpenOptionModal('Status', environment.id),
            }}
          />
          {rowError && <p className="mt-1 text-[10px] text-rose-500">{rowError}</p>}
        </td>
      );
    }

    return (
      <CopyableTableCellSharedComponent
        key="status"
        value={statusText}
        ariaLabel={`Copy Status: ${statusText}`}
        className="px-3 py-2 align-top font-mono text-[11px]"
        selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, EnvironmentOverviewCON.STATUS_COLUMN_INDEX)}
        onCellMouseDown={cellHandlers.onMouseDown}
        onCellMouseEnter={cellHandlers.onMouseEnter}
        verticalAlign="top"
        width={columnWidths.getColumnWidth('status')}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              environment.status === 'Live' ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-zinc-600'
            }`}
          />
          {statusText}
        </span>
      </CopyableTableCellSharedComponent>
    );
  };

  // Sponsor's Edit Mode rendering - same searchable-dropdown + "Add New"
  // mechanism as Status, but saved through the generic Field endpoint
  // (handleFieldSave/updateFieldMutation) rather than Status's own dedicated
  // UpdateStatus+history mechanism, since Sponsor carries no audit-trail
  // requirement. Pending/error state is the same Set-keyed one
  // Purpose/Priority/DNS URL's textareas already use, not Status's own
  // single-row pendingStatusRowId.
  const renderSponsorCell = (environment: EnvironmentOverviewInterfaceModel, columnWidth: number): React.ReactNode => {
    const cellKey = `${environment.id}:sponsor`;
    const isPending = pendingFieldEditKeys.has(cellKey);
    const cellError = fieldEditErrorByKey?.key === cellKey ? fieldEditErrorByKey.message : null;

    return (
      <td key="sponsor" style={{ width: columnWidth }} className="px-3 py-2 align-top">
        <CustomSelectSharedComponent
          value={environment.sponsor ?? ''}
          onChange={(newSponsor) => handleSponsorChange(environment.id, newSponsor, environment.sponsor)}
          options={sponsorSelectOptions}
          searchable
          size="sm"
          disabled={isPending}
          footerAction={{
            label: 'Add New Sponsor',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => handleOpenOptionModal('Sponsor', environment.id),
          }}
        />
        {cellError && <p className="mt-1 text-[10px] text-rose-500">{cellError}</p>}
      </td>
    );
  };

  const renderDraftTextCell = (column: EnvironmentOverviewColumnDef): React.ReactNode => {
    const columnWidth = columnWidths.getColumnWidth(column.key);
    const isEnvironmentColumn = column.key === 'environment';
    const fieldKey = column.key as keyof DraftEnvironmentOverviewRowInterfaceModel;

    return (
      <td key={column.key} style={{ width: columnWidth }} className="px-3 py-2 align-top">
        <input
          ref={isEnvironmentColumn ? environmentInputRef : undefined}
          type="text"
          name={`draft-${fieldKey}`}
          aria-label={column.label}
          value={draftRow?.[fieldKey] ?? ''}
          onChange={(event) => handleDraftFieldChange(fieldKey, event.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder={isEnvironmentColumn ? 'Environment name…' : '—'}
          className={`${EnvironmentOverviewCON.DRAFT_INPUT_CLASS_NAME} ${
            isEnvironmentColumn && isDraftInvalid ? '!border-red-400 dark:!border-red-500' : ''
          }`}
        />
      </td>
    );
  };

  const renderDraftActionItemsCell = (): React.ReactNode => (
    <td
      key="actionItemsUpdates"
      style={{ width: columnWidths.getColumnWidth('actionItemsUpdates') }}
      className="px-3 py-2 align-top"
    >
      <textarea
        name="draft-actionItemsUpdates"
        aria-label="Action Items / Updates"
        value={draftRow?.actionItemsUpdates ?? ''}
        onChange={(event) => handleDraftFieldChange('actionItemsUpdates', event.target.value)}
        onKeyDown={handleDraftKeyDown}
        placeholder="—"
        rows={3}
        className={`${EnvironmentOverviewCON.DRAFT_INPUT_CLASS_NAME} resize-y text-[11px] leading-relaxed`}
      />
    </td>
  );

  const renderDraftStatusCell = (): React.ReactNode => (
    <td
      key="status"
      style={{ width: columnWidths.getColumnWidth('status') }}
      className="px-3 py-2 align-top font-mono text-[11px]"
    >
      <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
        Live
      </span>
    </td>
  );

  return (
    <div className="flex flex-col gap-6">
      <p role="status" aria-live="polite" className="sr-only">
        {searchQuery.trim() ? `${filteredEnvironments.length} Environments match "${searchQuery.trim()}"` : ''}
      </p>

      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">
            Environment Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Purpose, ownership, and status for every environment in this register.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ViewEditModeToggleSharedComponent value={editMode} onChange={setEditMode} />

          <ExpandableSearchSharedComponent
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search environments…"
            ariaLabel="Search Environment Overview"
          />
          <PrimaryActionButtonSharedComponent label="Add Environment" onClick={handleAddEnvironmentClick} />
        </div>
      </div>

      {(environments.length > 0 || hasDraftRow) && (
        <DataTableContainerSharedComponent ref={tableSelection.containerRef}>
          {/* table-fixed is load-bearing, not cosmetic: under the default
              auto layout, an explicit per-cell width is only a soft hint —
              once every column's hinted width is summed past the table's
              own w-full cap, the browser freely compresses whichever
              columns CAN wrap (all of them, since every cell here uses
              whitespace-pre-wrap) right down toward their minimum
              content width (effectively their longest unbreakable word),
              silently ignoring the drag-resized width entirely. Fixed
              layout makes the first row's widths authoritative instead. */}
          <table className="w-full table-fixed border-collapse text-xs">
            <thead>
              <tr className="divide-x divide-white/10">
                <TableHeaderCellSharedComponent align="center" className="w-12">
                  SL. NO
                </TableHeaderCellSharedComponent>
                {EnvironmentOverviewCON.TEXT_COLUMNS.map((column, colIndex) => (
                  <TableHeaderCellSharedComponent
                    key={column.key}
                    style={{ width: columnWidths.getColumnWidth(column.key), position: 'relative' }}
                    {...tableSelection.getColumnHeaderHandlers(colIndex)}
                  >
                    {column.label}
                    {renderResizeHandle(column.key)}
                  </TableHeaderCellSharedComponent>
                ))}
                <TableHeaderCellSharedComponent
                  style={{ width: columnWidths.getColumnWidth('actionItemsUpdates'), position: 'relative' }}
                  {...tableSelection.getColumnHeaderHandlers(EnvironmentOverviewCON.ACTION_ITEMS_COLUMN_INDEX)}
                >
                  Action Items / Updates
                  {renderResizeHandle('actionItemsUpdates')}
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent
                  style={{ width: columnWidths.getColumnWidth('status'), position: 'relative' }}
                  {...tableSelection.getColumnHeaderHandlers(EnvironmentOverviewCON.STATUS_COLUMN_INDEX)}
                >
                  Status
                  {renderResizeHandle('status')}
                </TableHeaderCellSharedComponent>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredEnvironments.map((environment, rowIndex) => (
                <tr key={environment.id} className="divide-x divide-slate-200 dark:divide-zinc-800">
                  <td
                    {...tableSelection.getRowHeaderHandlers(rowIndex)}
                    className="whitespace-nowrap px-3 py-2 font-mono text-slate-400 dark:text-zinc-500 text-center align-top cursor-pointer select-none"
                  >
                    {rowIndex + 1}
                  </td>
                  {EnvironmentOverviewCON.TEXT_COLUMNS.map((column, colIndex) =>
                    renderTextCell(environment, column, rowIndex, colIndex)
                  )}
                  {renderActionItemsCell(environment, rowIndex)}
                  {renderStatusCell(environment, rowIndex)}
                </tr>
              ))}
              {draftRow && (
                <tr className="divide-x divide-slate-200 dark:divide-zinc-800 bg-blue-50/50 dark:bg-blue-500/10">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-300 dark:text-zinc-700 text-center align-top">
                    –
                  </td>
                  {EnvironmentOverviewCON.TEXT_COLUMNS.map((column) => renderDraftTextCell(column))}
                  {renderDraftActionItemsCell()}
                  {renderDraftStatusCell()}
                </tr>
              )}
            </tbody>
          </table>
        </DataTableContainerSharedComponent>
      )}

      {draftRow && (
        <div className="flex items-center justify-between px-1 -mt-2">
          <span className="text-[11px] font-mono">
            {isDraftInvalid ? (
              <span className="text-red-500 dark:text-red-400">Environment name is required.</span>
            ) : (
              <span className="text-slate-400 dark:text-zinc-500">Ctrl+Enter to save · Esc to discard</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <ButtonSharedComponent variant="ghost" size="sm" onClick={handleDiscardDraft}>
              Cancel
            </ButtonSharedComponent>
            <PrimaryActionButtonSharedComponent
              label="Done"
              onClick={handleSaveDraft}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>
      )}

      {environments.length > 0 && filteredEnvironments.length === 0 && (
        <EmptyStateSharedComponent
          icon={<FilterX className="w-6 h-6" />}
          title="No matching Environments"
          description="No environment matches the current search."
        />
      )}

      {!isLoading && environments.length === 0 && !hasDraftRow && (
        <EmptyStateSharedComponent
          icon={<ServerOff className="w-6 h-6" />}
          title="No Environments yet"
          description="Nothing has been loaded into the Environment Overview table yet."
        />
      )}

      <CreateOptionModalController
        isOpen={isOptionModalOpen}
        onClose={() => {
          setIsOptionModalOpen(false);
          setOptionModalTarget(null);
        }}
        fieldName={optionModalTarget?.fieldName ?? 'Status'}
        title={optionModalTarget?.fieldName === 'Sponsor' ? 'Create Sponsor' : 'Create Status'}
        subtitle={
          optionModalTarget?.fieldName === 'Sponsor'
            ? 'Adds a new option to the Sponsor dropdown for every environment.'
            : 'Adds a new option to the Status dropdown for every environment.'
        }
        inputLabel={optionModalTarget?.fieldName === 'Sponsor' ? 'Sponsor Name' : 'Status Name'}
        inputPlaceholder={optionModalTarget?.fieldName === 'Sponsor' ? 'e.g. Jane Doe' : 'e.g. Maintenance'}
        onCreated={handleOptionCreated}
      />

      <ConfirmationModalSharedComponent
        isOpen={deletingActionItem !== null}
        onClose={() => setDeletingActionItem(null)}
        onConfirm={handleConfirmDeleteActionItem}
        title="Delete Entry"
        description={
          deletingActionItem && (
            <>
              <p>This will permanently delete this entry:</p>
              <p className="mt-2 italic text-slate-500 dark:text-zinc-400 whitespace-pre-wrap break-words">
                "
                {deletingActionItem.lineText.length > 150
                  ? `${deletingActionItem.lineText.slice(0, 150)}…`
                  : deletingActionItem.lineText}
                "
              </p>
              <p className="mt-2">This cannot be undone.</p>
            </>
          )
        }
        confirmText="Delete Entry"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteActionItemMutation.isPending}
        maxWidth="md"
      />
    </div>
  );
}
