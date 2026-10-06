export default class ApplicationSearchBarCON {
  // How long an expandable search bar sits idle (no typing) before it
  // auto-collapses back to an icon-only button. Kept as a single named
  // constant (rather than inlined) so a future settings page can turn this
  // into a user-configurable, persisted preference without touching
  // ExpandableSearchSharedComponent itself.
  public static readonly AUTO_COLLAPSE_IDLE_MS: number = 15000;
}
