import type { CSSProperties } from 'react';
import ResourceCellFormatCON from '../Constants/ResourceCellFormatCON';
import type CustomColorOptionInterfaceModel from '../../../Models/CustomColorOptionInterfaceModel';
import type ResourceCellFormatInterfaceModel from '../../../Models/ResourceCellFormatInterfaceModel';
import type UpdateResourceCellFormatRequestInterfaceModel from '../../../Models/UpdateResourceCellFormatRequestInterfaceModel';

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

  public getCellClassName(_colorKey: string | null | undefined): string {
    return '';
  }

  // Returns exact background color (solid at 100% opacity, or modulated by opacity).
  public getCellStyle(colorKey: string | null | undefined, opacity: number = 100): CSSProperties | undefined {
    if (!colorKey) return undefined;

    let hex: string | undefined;
    if (this.isCustomColor(colorKey)) {
      hex = colorKey;
    } else {
      const fixedColor = ResourceCellFormatCON.COLORS.find((color) => color.key === colorKey);
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

  // A resource cell's BackgroundColorKey is always a literal hex string,
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
    const def = ResourceCellFormatCON.TEXT_COLORS.find(
      (c) => c.key.toLowerCase() === textColorKey.toLowerCase()
    );
    if (def?.hexColor) {
      return { color: def.hexColor };
    }
    return undefined;
  }

  // Mirrors ResourcesService.UpdateCellFormatAsynchronous's own merge-not-
  // replace semantics exactly, so the optimistic cache update (applied
  // instantly, before the request even reaches the server) ends up
  // byte-identical to what the server would compute - only the fields
  // actually present on the request change anything, and a cell that ends
  // up back at fully-default is dropped from the list rather than left
  // behind as a no-op row, matching the backend's own "stay sparse" rule.
  public applyOptimisticUpdate(
    current: ResourceCellFormatInterfaceModel[],
    request: UpdateResourceCellFormatRequestInterfaceModel
  ): ResourceCellFormatInterfaceModel[] {
    const byKey = new Map(current.map((format) => [`${format.resourceId}:${format.columnKey}`, format]));

    for (const target of request.cells) {
      const key = `${target.resourceId}:${target.columnKey}`;
      const existing = byKey.get(key);

      const merged: ResourceCellFormatInterfaceModel = {
        resourceId: target.resourceId,
        columnKey: target.columnKey,
        isBold: request.isBold ?? existing?.isBold ?? false,
        isItalic: request.isItalic ?? existing?.isItalic ?? false,
        backgroundColorKey: request.clearBackgroundColor
          ? null
          : (request.backgroundColorKey ?? existing?.backgroundColorKey ?? null),
        backgroundOpacity: request.clearBackgroundColor
          ? 100
          : (request.backgroundOpacity ?? existing?.backgroundOpacity ?? 100),
        textColorKey: request.clearTextColor || request.textColorKey?.toLowerCase() === 'default'
          ? null
          : (request.textColorKey ?? existing?.textColorKey ?? null),
      };

      const isNowDefault =
        !merged.isBold && !merged.isItalic && merged.backgroundColorKey === null && !merged.textColorKey;

      if (isNowDefault) {
        byKey.delete(key);
      } else {
        byKey.set(key, merged);
      }
    }

    return Array.from(byKey.values());
  }
}
