export default class TanstackQueryKeysCON {
  public static readonly RESOURCES: readonly string[] = ['resources'];
  public static readonly RESOURCE_CELL_FORMATS: readonly string[] = ['resource-cell-formats'];
  public static readonly CONFIGURED_SUBSCRIPTIONS: readonly string[] = ['configured-subscriptions'];
  public static readonly AVAILABLE_AZURE_SUBSCRIPTIONS: readonly string[] = ['available-azure-subscriptions'];
  public static readonly ENVIRONMENT_OVERVIEWS: readonly string[] = ['environment-overviews'];
  // Parameterized rather than one static key per field - Status, Sponsor,
  // Infrastructure Register's custom colors, and any future growable-
  // dropdown field across the whole app each get their own independently
  // cached/invalidated query key off the same generic Options endpoint.
  public static CONFIGURATION_CONSTANT_OPTIONS(fieldName: string): readonly string[] {
    return ['configuration-constant-options', fieldName];
  }
}
