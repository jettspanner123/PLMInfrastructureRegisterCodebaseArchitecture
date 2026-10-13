// The 4 original fixed background-color choices for the right-click
// cell-formatting context menu, plus any custom color a user has since
// added via "Add Color" (growable, stored in IG_ConfigurationConstantTBL
// under the "ResourceCellFormatColor" field - see
// ConfigurationConstantsAssertion on the backend). The two kinds are told
// apart by SHAPE, not a flag: a fixed color's key is a plain name
// ("Yellow"), while a custom color's key is always a raw "#RRGGBB" hex
// string - see CellFormatHelper.isCustomColor.
//
// Shared by every table with cell-formatting (Infrastructure Register,
// Environment Overview) - not feature-specific despite living alongside the
// custom-colors list that itself still only has one Resources-rooted
// backend endpoint (see CellFormatHelper's own comment on why that's fine).
//
// Fixed colors are persisted as the named `key`, not a raw hex value, so
// the same stored choice renders correctly in both light and dark mode via
// `cellClassName` (a Tailwind class pair) rather than one fixed color that
// would look wrong against a dark canvas. A custom color has no such pair -
// it's applied via inline style instead (see CellFormatHelper's
// getCellStyle/getSwatchStyle), since Tailwind can't precompile a class for
// a hex value that only exists at runtime.
export interface CellFormatColorDef {
  key: string;
  label: string;
  // Exact hex value for solid 100% background and custom opacity blending
  hexColor: string;
  // Applied to the formatted cell itself.
  cellClassName: string;
  // The context menu's own item icon (a small circle) - a flat, literal
  // color matching what the label itself says ("Red" gets an actually-red
  // circle), not the cell's own muted/translucent tint. Purely an icon
  // identifying which option this is, same role Bold/Italic's own icons
  // play - not a preview of the cell's resulting appearance.
  swatchClassName: string;
}

export interface CellFormatTextColorDef {
  key: string;
  label: string;
  hexColor: string | null;
  swatchClassName: string;
}

export default class CellFormatCON {
  public static readonly COLORS: CellFormatColorDef[] = [
    {
      key: 'Yellow',
      label: 'Yellow',
      hexColor: '#FACC15',
      cellClassName: '',
      swatchClassName: 'bg-yellow-400',
    },
    {
      key: 'Green',
      label: 'Green',
      hexColor: '#22C55E',
      cellClassName: '',
      swatchClassName: 'bg-green-500',
    },
    {
      key: 'Blue',
      label: 'Blue',
      hexColor: '#3B82F6',
      cellClassName: '',
      swatchClassName: 'bg-blue-500',
    },
    {
      key: 'Red',
      label: 'Red',
      hexColor: '#EF4444',
      cellClassName: '',
      swatchClassName: 'bg-red-500',
    },
  ];

  public static readonly TEXT_COLORS: CellFormatTextColorDef[] = [
    {
      key: 'default',
      label: 'Default',
      hexColor: null,
      swatchClassName: 'bg-transparent border border-slate-400 dark:border-zinc-500',
    },
    {
      key: 'white',
      label: 'White',
      hexColor: '#FFFFFF',
      swatchClassName: 'bg-white border border-slate-300 dark:border-zinc-600',
    },
    {
      key: 'black',
      label: 'Black',
      hexColor: '#000000',
      swatchClassName: 'bg-black border border-slate-700 dark:border-zinc-700',
    },
    {
      key: 'red',
      label: 'Red',
      hexColor: '#EF4444',
      swatchClassName: 'bg-red-500',
    },
    {
      key: 'yellow',
      label: 'Yellow',
      hexColor: '#FACC15',
      swatchClassName: 'bg-yellow-400',
    },
    {
      key: 'green',
      label: 'Green',
      hexColor: '#22C55E',
      swatchClassName: 'bg-green-500',
    },
    {
      key: 'orange',
      label: 'Orange',
      hexColor: '#F97316',
      swatchClassName: 'bg-orange-500',
    },
    {
      key: 'violet',
      label: 'Violet',
      hexColor: '#8B5CF6',
      swatchClassName: 'bg-purple-500',
    },
  ];
}
