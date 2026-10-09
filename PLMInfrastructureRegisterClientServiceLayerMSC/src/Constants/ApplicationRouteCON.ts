export default class ApplicationRouteCON {
  public static readonly ROOT: string = '/';
  public static readonly ENVIRONMENT_OVERVIEW: string = '/environment-overview';

  // "Configure Subscriptions" used to be its own standalone route, reachable
  // only from the Profile Dropdown - that link now opens Settings'
  // "Subscriptions" tab instead, which renders the exact same screen
  // controller, so the old route itself was retired rather than kept
  // alongside a second path to the same screen.
  public static readonly SETTINGS: string = '/settings';
  public static readonly SETTINGS_SUBSCRIPTIONS: string = '/settings/subscriptions';
  public static readonly SETTINGS_EDITING: string = '/settings/editing';
}
