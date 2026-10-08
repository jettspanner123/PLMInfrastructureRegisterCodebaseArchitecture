export default class TanstackQueryKeysCON {
  public static readonly RESOURCES: readonly string[] = ['resources'];
  public static readonly RESOURCE_CELL_FORMATS: readonly string[] = ['resource-cell-formats'];
  public static readonly CONFIGURED_SUBSCRIPTIONS: readonly string[] = ['configured-subscriptions'];
  public static readonly AVAILABLE_AZURE_SUBSCRIPTIONS: readonly string[] = ['available-azure-subscriptions'];
  public static readonly ENVIRONMENT_OVERVIEWS: readonly string[] = ['environment-overviews'];
  // Parameterized rather than one static key per field - Status, Sponsor,
  // and any future growable-dropdown field each get their own independently
  // cached/invalidated query key off the same generic Options endpoint.
  public static ENVIRONMENT_OVERVIEW_OPTIONS(fieldName: string): readonly string[] {
    return ['environment-overview-options', fieldName];
  }
}
