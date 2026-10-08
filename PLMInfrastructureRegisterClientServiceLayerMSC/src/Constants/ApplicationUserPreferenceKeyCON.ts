export default class ApplicationUserPreferenceKeyCON {
  public static readonly THEME_PREFERENCE: string = 'THEME_PREFERENCE';
  public static readonly LAYOUT_WIDTH_PREFERENCE: string = 'LAYOUT_WIDTH_PREFERENCE';
  public static readonly RESOURCE_TABLE_VISIBLE_COLUMNS: string = 'RESOURCE_TABLE_VISIBLE_COLUMNS';
  public static readonly RESOURCE_TABLE_ENVIRONMENT_FILTER: string = 'RESOURCE_TABLE_ENVIRONMENT_FILTER';
  public static readonly TABLE_HEIGHT_MODE: string = 'TABLE_HEIGHT_MODE';
  public static readonly TABLE_HEIGHT_CUSTOM_PX: string = 'TABLE_HEIGHT_CUSTOM_PX';
  public static readonly TABLE_DENSITY: string = 'TABLE_DENSITY';
  public static readonly ENVIRONMENT_OVERVIEW_COLUMN_WIDTHS: string = 'ENVIRONMENT_OVERVIEW_COLUMN_WIDTHS';
  // A per-browser random id, not a real user identity - this app has no
  // authentication system yet. See AnonymousClientIdentityUtility.ts.
  public static readonly ANONYMOUS_CLIENT_ID: string = 'ANONYMOUS_CLIENT_ID';
}
