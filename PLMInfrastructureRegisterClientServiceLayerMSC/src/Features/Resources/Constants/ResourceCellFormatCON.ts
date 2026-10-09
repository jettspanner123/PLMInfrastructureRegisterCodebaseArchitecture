// The 4 fixed background-color choices for the right-click cell-formatting
// context menu - not growable (unlike Status/Sponsor's own option lists),
// per the request's own "4 colors" shape. Persisted as the named `key`, not
// a raw hex value, so the same stored choice renders correctly in both
// light and dark mode via `cellClassName` below rather than one fixed color
// that would look wrong against a dark canvas.
export interface ResourceCellFormatColorDef {
  key: string;
  label: string;
  // Applied to the formatted cell itself - also reused as-is for the
  // context menu's own item icon (a small circle), so that preview is an
  // honest match for the color the cell will actually become, not a
  // separate, more vivid stand-in for it.
  cellClassName: string;
}

export default class ResourceCellFormatCON {
  public static readonly COLORS: ResourceCellFormatColorDef[] = [
    {
      key: 'Yellow',
      label: 'Yellow',
      cellClassName: 'bg-amber-100 dark:bg-amber-900/40',
    },
    {
      key: 'Green',
      label: 'Green',
      cellClassName: 'bg-emerald-100 dark:bg-emerald-900/40',
    },
    {
      key: 'Blue',
      label: 'Blue',
      cellClassName: 'bg-sky-100 dark:bg-sky-900/40',
    },
    {
      key: 'Red',
      label: 'Red',
      cellClassName: 'bg-rose-100 dark:bg-rose-900/40',
    },
  ];

  public static getCellClassName(colorKey: string | null | undefined): string {
    if (!colorKey) return '';
    return ResourceCellFormatCON.COLORS.find((color) => color.key === colorKey)?.cellClassName ?? '';
  }
}
