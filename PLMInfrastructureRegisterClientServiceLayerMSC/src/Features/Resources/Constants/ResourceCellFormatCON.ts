// The 4 fixed background-color choices for the right-click cell-formatting
// context menu - not growable (unlike Status/Sponsor's own option lists),
// per the request's own "4 colors" shape. Persisted as the named `key`, not
// a raw hex value, so the same stored choice renders correctly in both
// light and dark mode via `swatchClassName` below rather than one fixed
// color that would look wrong against a dark canvas.
export interface ResourceCellFormatColorDef {
  key: string;
  label: string;
  // Applied to the formatted cell itself.
  cellClassName: string;
  // A small solid swatch for the context menu's own item icon - a flat,
  // literal color (the same regardless of theme, unlike the cell's own
  // muted/translucent light+dark pair) so the circle unmistakably IS the
  // color its label names, rather than this design system's own muted
  // approximation of it.
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
