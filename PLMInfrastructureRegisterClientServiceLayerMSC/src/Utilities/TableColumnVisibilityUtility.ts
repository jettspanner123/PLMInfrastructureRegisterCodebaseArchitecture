// App-wide: every table with a Columns dropdown (Resources, Environment
// Overview, any future one) needs the same "locked columns always stay
// visible, even if an older persisted preference predates them or somehow
// excluded them" guarantee - this is that one rule, shared rather than
// duplicated per feature, since it's pure set logic with no feature-specific
// behavior at all.
export default class TableColumnVisibilityUtility {
  public static current: TableColumnVisibilityUtility = new TableColumnVisibilityUtility();

  public withLockedColumnsIncluded(keys: Iterable<string>, lockedColumnKeys: Set<string>): Set<string> {
    const next = new Set(keys);
    lockedColumnKeys.forEach((key) => next.add(key));
    return next;
  }
}
