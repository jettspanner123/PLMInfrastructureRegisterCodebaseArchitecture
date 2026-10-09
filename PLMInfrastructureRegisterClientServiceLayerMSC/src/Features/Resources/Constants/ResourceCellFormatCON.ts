// The 4 fixed background-color choices for the right-click cell-formatting
// context menu - not growable (unlike Status/Sponsor's own option lists),
// per the request's own "4 colors" shape. Persisted as the named `key`, not
// a raw hex value, so the same stored choice renders correctly in both
// light and dark mode via `cellClassName` below rather than one fixed color
// that would look wrong against a dark canvas.
export interface ResourceCellFormatColorDef {
  key: string;
  label: string;
  // Applied to the formatted cell itself.
  cellClassName: string;
  // The context menu's own item icon (a small circle) - a flat, literal
  // color matching what the label itself says ("Red" gets an actually-red
  // circle), not the cell's own muted/translucent tint. Purely an icon
  // identifying which option this is, same role Bold/Italic's own icons
  // play - not a preview of the cell's resulting appearance.
  swatchClassName: string;
}

export default class ResourceCellFormatCON {
  public static readonly COLORS: ResourceCellFormatColorDef[] = [
    {
      key: 'Yellow',
      label: 'Yellow',
      cellClassName: 'bg-amber-100 dark:bg-amber-900/40',
      swatchClassName: 'bg-yellow-400',
    },
    {
      key: 'Green',
      label: 'Green',
      cellClassName: 'bg-emerald-100 dark:bg-emerald-900/40',
      swatchClassName: 'bg-green-500',
    },
    {
      key: 'Blue',
      label: 'Blue',
      cellClassName: 'bg-sky-100 dark:bg-sky-900/40',
      swatchClassName: 'bg-blue-500',
    },
    {
      key: 'Red',
      label: 'Red',
      cellClassName: 'bg-rose-100 dark:bg-rose-900/40',
      swatchClassName: 'bg-red-500',
    },
  ];

  public static getCellClassName(colorKey: string | null | undefined): string {
    if (!colorKey) return '';
    return ResourceCellFormatCON.COLORS.find((color) => color.key === colorKey)?.cellClassName ?? '';
  }
}
