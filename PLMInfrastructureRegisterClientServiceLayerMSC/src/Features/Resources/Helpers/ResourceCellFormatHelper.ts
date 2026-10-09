import type { CSSProperties } from 'react';
import ResourceCellFormatCON from '../Constants/ResourceCellFormatCON';

// Behavior around ResourceCellFormatCON's own data (telling a fixed color
// apart from a custom one, deriving the inline styles a custom color needs)
// - feature-specific to Resources' own cell-formatting feature, which is
// what puts this in Helpers/ rather than the app-wide Utilities/ folder
// (compare ResourceTableUtility, which is general table-display behavior
// for this same feature, not tied to formatting specifically). Returns
// plain data only (strings, booleans, CSSProperties) - presentation stays
// with the component.
export default class ResourceCellFormatHelper {
  public static current: ResourceCellFormatHelper = new ResourceCellFormatHelper();

  private static readonly HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

  public isCustomColor(colorKey: string | null | undefined): boolean {
    return !!colorKey && ResourceCellFormatHelper.HEX_COLOR_PATTERN.test(colorKey);
  }

  public getCellClassName(colorKey: string | null | undefined): string {
    if (!colorKey || this.isCustomColor(colorKey)) return '';
    return ResourceCellFormatCON.COLORS.find((color) => color.key === colorKey)?.cellClassName ?? '';
  }

  // Only a custom (hex) color needs an inline style - the 4 fixed colors
  // are fully handled by getCellClassName's Tailwind classes instead.
  public getCellStyle(colorKey: string | null | undefined): CSSProperties | undefined {
    if (!this.isCustomColor(colorKey)) return undefined;
    // ~25% opacity, matching the fixed colors' own muted cell tint (a
    // -100/-900 Tailwind shade is similarly low-saturation against its own
    // canvas) - the translucency itself is what keeps a custom color
    // legible against both a white and near-black canvas, not a per-theme
    // color swap the way the fixed ones get.
    return { backgroundColor: this.hexToRgba(colorKey as string, 0.25) };
  }

  // The menu's own swatch icon always wants the literal color at full
  // strength, same as the fixed colors' own vivid swatchClassName.
  public getSwatchStyle(colorKey: string): CSSProperties {
    return { backgroundColor: colorKey };
  }

  public hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');
    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
