import type { CSSProperties } from 'react';
import CellFormatCON from '../Constants/CellFormatCON';
import type CustomColorOptionInterfaceModel from '../Models/CustomColorOptionInterfaceModel';

// Behavior around CellFormatCON's own data (telling a fixed color apart
// from a custom one, deriving the inline styles a custom color needs) and
// the merge/sparse semantics every cell-formatting feature's optimistic
// update needs - shared by Infrastructure Register's and Environment
// Overview's right-click cell formatting alike, which is what puts this in
// the app-wide Utilities/ folder rather than one feature's own Helpers/.
// Returns plain data only (strings, booleans, CSSProperties) - presentation
// stays with each feature's own component.
export default class CellFormatHelper {
  public static current: CellFormatHelper = new CellFormatHelper();

  private static readonly HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

  public isCustomColor(colorKey: string | null | undefined): boolean {
    return !!colorKey && CellFormatHelper.HEX_COLOR_PATTERN.test(colorKey);
  }

  public getCellClassName(_colorKey: string | null | undefined): string {
    return '';
  }

  // Returns exact background color (solid at 100% opacity, or modulated by opacity).
  // Works uniformly for the 4 fixed colors (using CellFormatCON.COLORS' hexColor)
  // and custom hex colors.
  public getCellStyle(colorKey: string | null | undefined, opacity: number = 100): CSSProperties | undefined {
    if (!colorKey) return undefined;

    let hex: string | undefined;
    if (this.isCustomColor(colorKey)) {
      hex = colorKey;
    } else {
      const fixedColor = CellFormatCON.COLORS.find((color) => color.key === colorKey);
      hex = fixedColor?.hexColor;
    }

    if (!hex) return undefined;

    const clampedOpacity = Math.max(0, Math.min(100, opacity));
    if (clampedOpacity === 100) {
      return { backgroundColor: hex };
    }
    return { backgroundColor: this.hexToRgba(hex, clampedOpacity / 100) };
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

  public rgbComponentsToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }

  // The custom-colors list menu item's own swatch icon - unlike the cell it
  // gets applied to (always a literal hex BackgroundColorKey, see
  // getApplicableColorKey below), this renders the color exactly as the user
  // entered it, RGB triple included.
  public getSwatchStyleForCustomColor(option: CustomColorOptionInterfaceModel): CSSProperties {
    if (option.format === 'RGB') return { backgroundColor: `rgb(${option.color})` };
    return { backgroundColor: option.color };
  }

  // A formatted cell's BackgroundColorKey is always a literal hex string,
  // regardless of how the color it displays was originally entered - this is
  // the one place an RGB-entered custom color gets normalized to hex, right
  // before it's written onto a cell.
  public getApplicableColorKey(option: CustomColorOptionInterfaceModel): string {
    if (option.format === 'RGB') {
      const [r, g, b] = option.color.split(',').map(Number);
      return this.rgbComponentsToHex(r, g, b);
    }
    return option.color;
  }

  public getTextStyle(textColorKey?: string | null): CSSProperties | undefined {
    if (!textColorKey || textColorKey.toLowerCase() === 'default') return undefined;
    const def = CellFormatCON.TEXT_COLORS.find(
      (c) => c.key.toLowerCase() === textColorKey.toLowerCase()
    );
    if (def?.hexColor) {
      return { color: def.hexColor };
    }
    return undefined;
  }

  // Mirrors the backend's own merge-not-replace semantics exactly (see
  // ResourcesService.UpdateCellFormatAsynchronous and its Environment
  // Overview counterpart), so an optimistic cache update - applied instantly,
  // before the request even reaches the server - ends up byte-identical to
  // what the server would compute: only the fields actually present on the
  // request change anything, and a cell that ends up back at fully-default
  // is dropped from the list rather than left behind as a no-op row,
  // matching the backend's own "stay sparse" rule.
  //
  // Generic over which entity a cell belongs to (ResourceId vs.
  // EnvironmentOverviewId) via `idField` + `buildFormat`, rather than two
  // near-identical copies of this merge/prune logic - the id field's NAME
  // still differs per feature (matching each one's own backend DTO), only
  // the algorithm itself is shared.
  public computeMergedSparseList<
    TIdField extends string,
    TFormat extends Record<TIdField, string> & {
      columnKey: string;
      isBold: boolean;
      isItalic: boolean;
      backgroundColorKey: string | null;
      backgroundOpacity: number;
      textColorKey?: string | null;
    },
    TTarget extends Record<TIdField, string> & { columnKey: string },
  >(
    current: TFormat[],
    targets: TTarget[],
    idField: TIdField,
    buildFormat: (
      target: TTarget,
      style: {
        isBold: boolean;
        isItalic: boolean;
        backgroundColorKey: string | null;
        backgroundOpacity: number;
        textColorKey?: string | null;
      }
    ) => TFormat,
    overrides: {
      isBold?: boolean;
      isItalic?: boolean;
      backgroundColorKey?: string;
      backgroundOpacity?: number;
      clearBackgroundColor?: boolean;
      textColorKey?: string;
      clearTextColor?: boolean;
    }
  ): TFormat[] {
    const keyOf = (item: Record<TIdField, string> & { columnKey: string }): string =>
      `${item[idField]}:${item.columnKey}`;

    const byKey = new Map(current.map((format) => [keyOf(format), format]));

    for (const target of targets) {
      const key = keyOf(target);
      const existing = byKey.get(key);

      const style = {
        isBold: overrides.isBold ?? existing?.isBold ?? false,
        isItalic: overrides.isItalic ?? existing?.isItalic ?? false,
        backgroundColorKey: overrides.clearBackgroundColor
          ? null
          : (overrides.backgroundColorKey ?? existing?.backgroundColorKey ?? null),
        backgroundOpacity: overrides.clearBackgroundColor
          ? 100
          : (overrides.backgroundOpacity ?? existing?.backgroundOpacity ?? 100),
        textColorKey: overrides.clearTextColor || overrides.textColorKey?.toLowerCase() === 'default'
          ? null
          : (overrides.textColorKey ?? existing?.textColorKey ?? null),
      };

      const isNowDefault =
        !style.isBold && !style.isItalic && style.backgroundColorKey === null && !style.textColorKey;

      if (isNowDefault) {
        byKey.delete(key);
      } else {
        byKey.set(key, buildFormat(target, style));
      }
    }

    return Array.from(byKey.values());
  }
}
