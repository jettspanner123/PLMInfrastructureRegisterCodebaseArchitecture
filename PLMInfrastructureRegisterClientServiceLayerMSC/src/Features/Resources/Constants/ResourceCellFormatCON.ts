import type { CSSProperties } from 'react';

// The 4 original fixed background-color choices for the right-click
// cell-formatting context menu, plus any custom color a user has since
// added via "Add Color" (growable, stored in IG_ConfigurationConstantTBL
// under the "ResourceCellFormatColor" field - see
// ConfigurationConstantsAssertion on the backend). The two kinds are told
// apart by SHAPE, not a flag: a fixed color's key is a plain name
// ("Yellow"), while a custom color's key is always a raw "#RRGGBB" hex
// string - see isCustomColor below.
//
// Fixed colors are persisted as the named `key`, not a raw hex value, so
// the same stored choice renders correctly in both light and dark mode via
// `cellClassName` (a Tailwind class pair) rather than one fixed color that
// would look wrong against a dark canvas. A custom color has no such pair -
// it's applied via inline style instead (see getCellStyle/getSwatchStyle),
// since Tailwind can't precompile a class for a hex value that only exists
// at runtime.
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

  private static readonly HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

  public static isCustomColor(colorKey: string | null | undefined): boolean {
    return !!colorKey && ResourceCellFormatCON.HEX_COLOR_PATTERN.test(colorKey);
  }

  public static getCellClassName(colorKey: string | null | undefined): string {
    if (!colorKey || ResourceCellFormatCON.isCustomColor(colorKey)) return '';
    return ResourceCellFormatCON.COLORS.find((color) => color.key === colorKey)?.cellClassName ?? '';
  }

  // Only a custom (hex) color needs an inline style - the 4 fixed colors
  // are fully handled by getCellClassName's Tailwind classes instead.
  public static getCellStyle(colorKey: string | null | undefined): CSSProperties | undefined {
    if (!ResourceCellFormatCON.isCustomColor(colorKey)) return undefined;
    // ~25% opacity, matching the fixed colors' own muted cell tint (a
    // -100/-900 Tailwind shade is similarly low-saturation against its own
    // canvas) - the translucency itself is what keeps a custom color
    // legible against both a white and near-black canvas, not a per-theme
    // color swap the way the fixed ones get.
    return { backgroundColor: ResourceCellFormatCON.hexToRgba(colorKey as string, 0.25) };
  }

  // The menu's own swatch icon always wants the literal color at full
  // strength, same as the fixed colors' own vivid swatchClassName.
  public static getSwatchStyle(colorKey: string): CSSProperties {
    return { backgroundColor: colorKey };
  }

  public static hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');
    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
