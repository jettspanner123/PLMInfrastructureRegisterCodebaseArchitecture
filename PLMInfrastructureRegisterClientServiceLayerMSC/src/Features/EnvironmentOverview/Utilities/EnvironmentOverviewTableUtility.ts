import type EnvironmentOverviewInterfaceModel from '../../../Models/EnvironmentOverviewInterfaceModel';
import type { MergedEnvironmentOverviewColumnDef } from '../Constants/EnvironmentOverviewCON';

// Mirrors ResourceTableUtility exactly (see that file's own comment for the
// pattern this follows) - kept as its own copy, one per feature, rather than
// generalized into something shared, since the two models' column shapes
// (ResourceColumnDef vs EnvironmentOverviewColumnDef) aren't the same type.
export default class EnvironmentOverviewTableUtility {
  public static current: EnvironmentOverviewTableUtility = new EnvironmentOverviewTableUtility();

  public getDisplayValue(environment: EnvironmentOverviewInterfaceModel, key: string): string | null {
    const value = (environment as unknown as Record<string, unknown>)[key];

    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }

  // Matches the search bar's "free-text across every currently visible
  // column" semantics - a hidden column never contributes a match, so hiding
  // a column via the Columns dropdown also stops searching it.
  public matchesSearchQuery(
    environment: EnvironmentOverviewInterfaceModel,
    columns: MergedEnvironmentOverviewColumnDef[],
    lowerCaseQuery: string
  ): boolean {
    return columns.some((column) => {
      // A custom column's value lives in customCellValues (keyed by its own
      // Guid id), never as a top-level property on environment the way
      // every fixed column's value is.
      const displayValue = column.isCustom
        ? environment.customCellValues[column.key] ?? null
        : this.getDisplayValue(environment, column.key);
      return displayValue !== null && displayValue.toLowerCase().includes(lowerCaseQuery);
    });
  }
}
