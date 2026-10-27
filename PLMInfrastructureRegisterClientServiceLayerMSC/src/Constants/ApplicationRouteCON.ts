export default class ApplicationRouteCON {
  public static readonly ROOT: string = '/';
  public static readonly ENVIRONMENT_OVERVIEW: string = '/environment-overview';
  public static readonly FEATURE_REQUESTS: string = '/feature-requests';
  public static readonly ENVIRONMENT_UPTIME_REQUESTS: string = '/environment-uptime-requests';
  // Pattern string reused by both the router's createRoute() and every
  // <Link to="..."> that navigates to one ticket's own page - not itself
  // interpolated, the ticketId is passed separately via `params`.
  public static readonly ENVIRONMENT_UPTIME_REQUEST_DETAIL_PATTERN: string = '/environment-uptime-requests/$ticketId';

  // "Configure Subscriptions" used to be its own standalone route, reachable
  // only from the Profile Dropdown - that link now opens Settings'
  // "Subscriptions" tab instead, which renders the exact same screen
  // controller, so the old route itself was retired rather than kept
  // alongside a second path to the same screen.
  public static readonly SETTINGS: string = '/settings';
  public static readonly SETTINGS_SUBSCRIPTIONS: string = '/settings/subscriptions';
  public static readonly SETTINGS_EDITING: string = '/settings/editing';
}
