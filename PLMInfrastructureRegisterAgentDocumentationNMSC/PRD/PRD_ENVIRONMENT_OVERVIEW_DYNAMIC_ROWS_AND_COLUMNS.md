# PRD: Environment Overview - Dynamic Rows & Columns via Right-Click

## Objective
In Edit Mode on the Environment Overview table, right-clicking any cell should offer four new structural actions - **Add Row Above**, **Add Row Below**, **Add Column To Left**, **Add Column To Right** - fully working and fully persisted in Postgres. Adding a column is a direct, modal-free action: the column appears immediately (after picking its type), the table scrolls it into view if needed, and its header is immediately editable so the user can type its name right there. Separately, right-clicking a **custom column's header** opens its own context menu to rename or delete that column (plus the same Add Column actions, for convenience). This is a genuinely new capability for this table: today every column is a fixed, compile-time-typed field (`Purpose`, `Sponsor`, `Priority1`, ...) with no mechanism for a user to add, rename, or delete an arbitrary one, and rows can only ever be appended at the very end.

## Why This Needs New Infrastructure (not just UI work)
Investigated the current implementation before scoping this:
- **Columns are fully fixed today.** `EnvironmentOverviewNexus` (the backend entity) has one real, typed Postgres column per field. The frontend's column list (`EnvironmentOverviewCON.COLUMNS`) is a hardcoded TypeScript array keyed by `keyof EnvironmentOverviewInterfaceModel` - a compile-time type. There is no dynamic-schema mechanism anywhere in this codebase today.
- **One existing precedent makes this tractable without touching the main table's schema**: cell formatting (bold/italic/colors) already lives in a separate sidecar table (`IG_EnvironmentOverviewCellFormatTBL`) keyed by a plain string `ColumnKey` rather than a real foreign key to an enum or fixed column list. A new column's cells can piggyback on that exact same mechanism with no changes to that system at all.
- **Rows are append-only today.** `DisplayOrder` is assigned via `MAX(DisplayOrder) + 1` on every create - there's no "insert between two existing rows" logic at all.
- **"Environment" is a hard-required field server-side** (a blank value is rejected with a 400) - relevant because a row inserted via right-click has no form to collect it upfront.

These findings directly shaped every decision below, each confirmed with you during grilling.

## Core Features

### 1. Row insertion: "Add Row Above" / "Add Row Below"
- Right-clicking any cell and choosing either option inserts a new, **immediately real, persisted** row directly above or below the clicked row - no draft/unsaved state, no modal.
- The new row is created with an auto-generated placeholder **Environment** name ("New Environment", "New Environment 2", "New Environment 3", ... - picked to not collide with any existing non-deleted row's Environment value) and `Status = "Live"` (matching today's default). Every other field starts blank, exactly like a freshly-appended row today.
- The Environment cell of the new row is immediately focused/editable inline so the user can type the real name right away - no separate "confirm" step.
- **If a multi-row range is selected** when the right-click happens (and the clicked cell is inside that selection), the action applies spreadsheet-style to the whole range: selecting 3 rows and choosing "Add Row Above" inserts 3 new blank rows above the top of the selection. If the right-clicked cell is **outside** the current selection, the existing behavior already collapses the selection to that single cell first, so only a single row is inserted.
- **This replaces today's "Add Environment" toolbar button flow.** That button currently opens an unsaved draft row you must fill in before it's persisted. Per your direction, it's unified onto this same new mechanism: clicking "Add Environment" now immediately creates a real row (same auto-placeholder-name behavior, appended at the very end) rather than opening a draft. The old draft-row state/validation code (`draftRow`, `hasDraftRow`, `EMPTY_DRAFT_ROW`, `renderDraftTextCell`) is removed as part of this change.

### 2. Column insertion: "Add Column To Left" / "Add Column To Right"
- Right-clicking a cell and choosing either option opens a small type-picker submenu: **Text**, **Number**, **Date**, or **Dropdown**.
- Picking a type creates the new column immediately (no further modal): it's inserted at the chosen position, the table auto-scrolls horizontally so it's in view if it wasn't already, and its header text immediately enters edit mode so the user can type its name right there (Enter or blur commits the name; a blank name falls back to a placeholder like "New Column").
- **A column's type is permanent** once created - no later type-change UI. This avoids having to design what happens to existing cell values when a column's type changes.
- **"Environment" always stays the leftmost column.** "Add Column To Left" is unavailable when right-clicking a cell in the Environment column specifically (every other column allows both directions normally).
- **If a multi-column range is selected** when right-clicking inside it, the action applies to the whole range the same way rows do: selecting 3 columns and choosing "Add Column To Right" inserts 3 new columns (each going through its own type-picker, asked one after another) to the right of the selection's rightmost column.
- New columns appear in the existing "Columns" visibility dropdown alongside the fixed ones and can be hidden/shown the same way (they are not locked).
- New columns also get resizable width via the existing drag-to-resize mechanism (which already persists by a generic string column key in `localStorage`, so this needs no changes to support a new column).
- Cell formatting (bold/italic/underline/background & text color, right-click menu) works identically on custom-column cells, by extending the existing format system's column-key allow-list to also accept a live custom column's key.

### 3. Column types and their cells
| Type | Editing | Storage |
|---|---|---|
| **Text** | Same inline text editing as "Purpose" today | Raw string |
| **Number** | Inline numeric input, rejects non-numeric entry | String form of the number (validated at the API boundary) |
| **Date** | Native date picker (`<input type="date">`), no time component, no timezone handling (plain calendar date - this is generic metadata, not an uptime window like the separate Uptime Request feature) | ISO date string (`yyyy-MM-dd`) |
| **Dropdown** | `CustomSelectSharedComponent`, searchable | The selected option's text value |

- **Dropdown options are private to each column** - not shared app-wide, not routed through the existing `ConfigurationConstants` growable-dropdown system (that system is allow-listed by a fixed set of known field names, which a user-created column isn't part of). Each Dropdown-type column gets its own option list, stored alongside its own column definition.
- Adding a new option is inline/free-form while editing a cell - type a new value and it's added to that column's own option list, same "growable list" feel as the existing Status/Sponsor dropdowns, but scoped to just that one column.

### 4. Column header context menu (custom columns only)
- Right-clicking a **custom column's header** opens a new, separate context menu (distinct from the cell-body one): **Rename Column Header**, **Delete Column**, **Add Column To Left**, **Add Column To Right**.
- **Fixed columns are untouched.** Right-clicking a fixed column's header (Purpose, Sponsor, Priority 1, Status, ...) shows no new menu at all - renaming or deleting a real backend field is a far bigger, riskier change than this request, and is explicitly out of scope here.
- **Rename**: choosing "Rename Column Header" (or double-clicking the header text directly, which does the same thing as a shortcut) puts the header into the same inline-edit mode it's already in right after creation - type the new name, Enter or blur commits it via the same endpoint used at creation time.
- **Delete**: choosing "Delete Column" opens the same generic `ConfirmationModalSharedComponent` used everywhere else in this app for destructive actions (no special data-count warning - just the standard "Are you sure?" pattern). Confirming **soft-deletes** the column definition (`IsDeleted`/`DeletedAt`, same convention as every other entity in this app) - it disappears from the table and the Columns visibility dropdown immediately, but its stored cell values are never touched or erased, matching this app's "nothing just disappears" philosophy everywhere else.
- **Add Column To Left/Right** from this menu behaves identically to the cell-body version of the same action - duplicated here purely for convenience so a column can be fully managed from its own header.

### 5. Not included in this build (flagging explicitly, not silently assumed)
- **Reordering an existing column** by drag-and-drop after creation - only the initial Left/Right insertion position is covered.
- **Restoring a deleted custom column** - once soft-deleted, there's no "undo"/restore UI in this build (the data is preserved in the database per above, but nothing in the product surfaces a way to bring the column back without direct database access).
- **Changing a column's type after creation**, and **renaming or deleting a fixed column** - both called out already above.

## Row Ordering - Concurrency Design
Matches the same reasoning you asked for on the Uptime Request ticket numbers: no `SELECT MAX`-style race, no full-table renumbering on every insert.
- `DisplayOrder` changes from an `int` to a `double precision` column. Inserting a row "above" or "below" a specific row computes the **midpoint** between that row's `DisplayOrder` and its new neighbor's (or a value above the max / below the min, for an insert at either end) - no other row is ever touched.
- This is computed **server-side**, inside the same transaction that creates the row, to avoid two concurrent inserts near the same spot computing overlapping values independently.
- At this table's realistic scale (tens to low hundreds of rows, manually edited by people, not machine-generated at volume), floating-point precision is nowhere near a real concern - a double can be bisected dozens of times between the same two neighbors before precision would become an issue.

## Column Ordering Design
Columns need a single, unified ordering scheme that can place a new column anywhere relative to *any* existing column, fixed or custom.
- The existing fixed columns (`Environment`, `Purpose`, `Sponsor`, ... `Status`) get stable, widely-spaced **anchor positions** (1000, 2000, 3000, ...) - a pure frontend convention, no database change needed for them.
- Each custom column stores its own real `Position` (`double precision`) in its row of the new custom-columns table, computed server-side the same way as row ordering: the midpoint between whichever two columns (fixed-anchor or custom) end up as its new neighbors.
- Rendering simply merges the fixed columns (by their anchor constants) and the custom columns (by their stored `Position`) into one sorted list.

## Data Model
Two new tables, following this table's own existing sidecar-table convention (the same shape as `IG_EnvironmentOverviewCellFormatTBL`):

**`IG_EnvironmentOverviewCustomColumnTBL`**
| Column | Type | Notes |
|---|---|---|
| `Id` | `uuid` | Primary key |
| `HeaderName` | `text` | User-editable; defaults to "New Column" if left blank |
| `ColumnType` | `text` | `Text` \| `Number` \| `Date` \| `Dropdown` - permanent after creation |
| `Position` | `double precision` | Unified ordering value (see above) |
| `CreatedAt` | `timestamptz` | |
| `IsDeleted` / `DeletedAt` | `bool` / `timestamptz?` | Soft delete - same global-query-filter convention as every other entity in this app; a deleted column's row is excluded from every normal query automatically |

**`IG_EnvironmentOverviewCustomColumnOptionTBL`** (Dropdown-type columns only)
| Column | Type | Notes |
|---|---|---|
| `Id` | `uuid` | Primary key |
| `CustomColumnId` | `uuid` | FK → `IG_EnvironmentOverviewCustomColumnTBL` |
| `Value` | `text` | One option's text |
| `CreatedAt` | `timestamptz` | Append order |

**`IG_EnvironmentOverviewCustomCellValueTBL`**
| Column | Type | Notes |
|---|---|---|
| `EnvironmentOverviewId` | `uuid` | FK → `IG_EnvironmentOverviewTBL`, part of composite PK |
| `CustomColumnId` | `uuid` | FK → `IG_EnvironmentOverviewCustomColumnTBL`, part of composite PK |
| `Value` | `text?` | Nullable - every type's value stored as its string form, same philosophy as the existing fixed table (every fixed text field is plain nullable `text` today too) |

**Existing table change**: `IG_EnvironmentOverviewTBL.DisplayOrder` changes `int` → `double precision`.

## API Surface (new endpoints)
- `POST /Api/V1/EnvironmentOverview/{id}/InsertRow` - body: `{ direction: "Above" | "Below" }`. Computes the fractional `DisplayOrder` server-side and creates a row with an auto-placeholder Environment name.
- `POST /Api/V1/EnvironmentOverview/CustomColumns` - body: `{ relativeToColumnKey: string, direction: "Left" | "Right", columnType: "Text"|"Number"|"Date"|"Dropdown" }`. Computes `Position` server-side, creates the column.
- `PUT /Api/V1/EnvironmentOverview/CustomColumns/{id}/Header` - body: `{ headerName: string }`. Used both right after creation and for every later rename (same endpoint, same validation).
- `DELETE /Api/V1/EnvironmentOverview/CustomColumns/{id}` - soft-deletes the column (sets `IsDeleted`/`DeletedAt`). Cell values in `IG_EnvironmentOverviewCustomCellValueTBL` are left untouched.
- `POST /Api/V1/EnvironmentOverview/CustomColumns/{id}/Options` - body: `{ value: string }` (Dropdown columns only, append a new option).
- `PUT /Api/V1/EnvironmentOverview/{id}/CustomCells/{customColumnId}` - body: `{ value: string | null }`. Upserts one cell's value; validates the value against the column's `ColumnType` (e.g. rejects non-numeric input for a Number column).
- `GET /Api/V1/EnvironmentOverview/CustomColumns` - returns every custom column (+ its options, if Dropdown) for initial page load.
- The existing `GET` for environment rows is extended to also return each row's custom cell values, so one page load has everything needed to render the full table.

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS (existing MSC architecture)
- Backend: .NET (feature-folder architecture), EF Core migrations
- Database: PostgreSQL (Neon)

## Design Direction
- Cell-body context menu: four new items appear only in Edit Mode, added to the existing `ContextMenuSharedComponent` items list (`contextMenuItems` in `EnvironmentOverviewScreenController.tsx`), grouped together separately from the existing formatting controls.
- Header context menu: a **second, new** `ContextMenuSharedComponent` instance, triggered by a new `onContextMenu` handler on a custom column's header element only (gated on Edit Mode, same as the cell-body one). Fixed-column headers get no new handler at all.
- "Add Column To Left/Right" (from either menu) opens a compact inline type-picker (4 options) rather than a separate modal, consistent with "no modal" across this whole feature.
- Column header rename (whether just-created, via the header menu's "Rename Column Header", or via double-click) and new-row Environment-name edit all reuse the same inline-edit input styling already used for other editable text cells in this table.
- Delete Column reuses the existing `ConfirmationModalSharedComponent` exactly as every other delete flow in this app does (same component, same props shape, same "danger" styling).
- Auto-scroll uses the table's existing scroll container with a smooth `scrollIntoView`-style call, consistent with how reasonable spreadsheet-like tools bring a newly added column/row into view.

## Expected Outcome
In Edit Mode, right-clicking any cell offers Add Row Above/Below and Add Column To Left/Right. Rows insert immediately with a placeholder name ready to rename; columns insert after a quick type pick, scroll into view, and land with their header ready to name. Right-clicking (or double-clicking) a custom column's header lets the user rename it any time, or delete it (with the standard confirmation, soft-deleted so its data is preserved). All of this is genuinely persisted in Postgres, with correct ordering even under concurrent inserts, and fully compatible with the table's existing cell formatting, column visibility, and column-width features.

## Constraints
- No post-creation type change, no drag-to-reorder columns, no restoring a deleted column via the UI - explicitly out of scope for this build (see "Not included" above).
- Renaming/deleting applies to custom columns only - fixed columns (Purpose, Sponsor, Priority 1, etc.) are never renameable or deletable through this feature.
- `Environment` remains permanently the leftmost column and can never be deleted (it isn't a custom column).
- A column's type can never change once created.

## Open Questions For My Draft (please confirm or correct)
1. **Placeholder row naming**: I'm using "New Environment", "New Environment 2", etc., skipping any number already in use by a non-deleted row. Say so if you'd prefer different wording or a different collision strategy.
2. **Blank column name on commit**: if the user clears the header text entirely and clicks away, I default it to "New Column" rather than leaving it blank (since every other column has a label). Let me know if you'd rather it just stay blank/untitled.
3. **Number column precision**: I'm treating "Number" as a general decimal (not integer-only) with no thousands-separator formatting in the cell - plain numeric input/display. Flag if you wanted integer-only or formatted numbers.
4. **Search**: the table's existing search box will also match against custom-column text values (for consistency with how it already searches the fixed text columns), unless you'd rather custom columns be excluded from search.
5. **Max custom columns/rows per insert**: I'm not planning any artificial cap (beyond basic sanity, e.g. not letting a single right-click somehow request thousands of columns from a multi-select) - say so if you want an explicit limit.

## Testing
- Right-click a cell in Edit Mode and confirm all four new items appear only in Edit Mode (not View Mode).
- Add Row Above/Below on a row in the middle of the table; confirm it lands in exactly the right position and survives a refresh.
- Select a 3-row range, right-click inside it, choose Add Row Above; confirm exactly 3 new rows appear above the selection.
- Add a column of each type (Text/Number/Date/Dropdown) to both the left and right of an existing column; confirm it appears in the right position, scrolls into view, and its header is immediately editable.
- Confirm "Add Column To Left" is unavailable/disabled specifically on the Environment column.
- Enter values in a Number column and confirm non-numeric input is rejected; same for Date.
- Add a Dropdown column, add a couple of options inline while editing a cell, confirm they persist and appear for every row's dropdown.
- Apply bold/background color to a custom column's cell via the existing formatting menu; confirm it persists like any fixed column's cell.
- Resize a custom column's width and confirm it persists across a refresh (localStorage).
- Hide/show a custom column via the Columns visibility dropdown.
- Fire several concurrent "Add Row" / "Add Column" requests near the same insertion point and confirm no two land on the same position / no ordering corruption.
- Click the old "Add Environment" button and confirm it now creates a real, immediately-persisted row with a placeholder name instead of an unsaved draft.
- Right-click a custom column's header and confirm the new menu (Rename, Delete, Add Column Left/Right) appears - and confirm right-clicking a **fixed** column's header shows no such menu.
- Double-click a custom column's header and confirm it enters the same inline rename mode as choosing "Rename Column Header" from the menu.
- Rename a custom column, refresh the page, and confirm the new name persisted.
- Delete a custom column that has data in several rows; confirm the standard confirmation modal appears, confirm it disappears from the table and the Columns visibility dropdown after confirming, and confirm (via direct DB check) its cell values are still present in `IG_EnvironmentOverviewCustomCellValueTBL`, not erased.
- Confirm a soft-deleted custom column's `Position` is never reused in a way that corrupts ordering for later-added columns.
