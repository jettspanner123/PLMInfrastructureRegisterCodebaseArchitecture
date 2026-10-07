// Mirrors ApplicationTableDensityCON's pattern: a small, fixed set of mode
// strings, not persisted anywhere (unlike Table Density/Height) - this is a
// per-page, resets-on-reload UI toggle with no behavior wired to "Edit" yet.
export default class ViewEditModeCON {
  public static readonly VIEW: string = 'view';
  public static readonly EDIT: string = 'edit';
}
