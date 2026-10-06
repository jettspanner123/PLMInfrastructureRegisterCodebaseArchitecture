import type ResourceInterfaceModel from '../../../Models/ResourceInterfaceModel';
import ResourceColumnCON, { type ResourceColumnDef } from '../Constants/ResourceColumnCON';

// Behavior for the Resources table that doesn't belong on ResourceColumnCON
// (pure data) or inline in ResourcesScreenController (screen orchestration) -
// matches this app's established Utility singleton pattern, e.g.
// CurrencyFormatterUtility in the AssetSphere/SignForge sibling family this
// project's CODING-RULES.md says its architecture was adapted from. Returns
// plain data only (never JSX) - presentation stays with the component.
export default class ResourceTableUtility {
  public static current: ResourceTableUtility = new ResourceTableUtility();

  // Locked columns (Hostname, Environment) are always included, even if an
  // older persisted column-visibility preference somehow excluded them.
  public withLockedColumnsIncluded(keys: Iterable<string>): Set<string> {
    const next = new Set(keys);
    ResourceColumnCON.LOCKED_COLUMN_KEYS.forEach((key) => next.add(key));
    return next;
  }

  // null means "no value" - left to the caller to render as an em dash, a
  // blank cell, or whatever else fits the context.
  public getDisplayValue(resource: ResourceInterfaceModel, key: string): string | null {
    const value = (resource as unknown as Record<string, unknown>)[key];

    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }

  // Matches the search bar's "free-text across every currently visible
  // column" semantics - a hidden column never contributes a match, so hiding
  // a column via the Columns dropdown also stops searching it.
  public matchesSearchQuery(
    resource: ResourceInterfaceModel,
    columns: ResourceColumnDef[],
    lowerCaseQuery: string
  ): boolean {
    return columns.some((column) => {
      const displayValue = this.getDisplayValue(resource, column.key);
      return displayValue !== null && displayValue.toLowerCase().includes(lowerCaseQuery);
    });
  }
}
