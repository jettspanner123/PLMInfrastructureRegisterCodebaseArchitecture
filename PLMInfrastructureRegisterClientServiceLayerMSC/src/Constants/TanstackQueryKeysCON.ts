export default class TanstackQueryKeysCON {
  public static readonly RESOURCES: readonly string[] = ['resources'];
  public static readonly RESOURCE_CELL_FORMATS: readonly string[] = ['resource-cell-formats'];
  public static readonly RESOURCE_CUSTOM_COLORS: readonly string[] = ['resource-custom-colors'];
  public static readonly RESOURCE_TABLE_LEGENDS: readonly string[] = ['resource-table-legends'];
  public static readonly CONFIGURED_SUBSCRIPTIONS: readonly string[] = ['configured-subscriptions'];
  public static readonly AVAILABLE_AZURE_SUBSCRIPTIONS: readonly string[] = ['available-azure-subscriptions'];
  public static readonly ENVIRONMENT_OVERVIEWS: readonly string[] = ['environment-overviews'];
  public static readonly ENVIRONMENT_OVERVIEW_CELL_FORMATS: readonly string[] = ['environment-overview-cell-formats'];
  // Parameterized rather than one static key per field - Status, Sponsor,
  // Infrastructure Register's custom colors, and any future growable-
  // dropdown field across the whole app each get their own independently
  // cached/invalidated query key off the same generic Options endpoint.
  public static CONFIGURATION_CONSTANT_OPTIONS(fieldName: string): readonly string[] {
    return ['configuration-constant-options', fieldName];
  }

  // Scoped per anonymous client id, same reasoning as CONFIGURATION_CONSTANT_OPTIONS
  // above - one client's conversation list is cached independently of another's.
  // A single conversation's own messages have no equivalent key - loading one
  // from the sidebar is a one-off mutation, not a cached/reactive query (see
  // TanstackQueryClientService.chatAssistant.useLoadConversationMessagesMutation).
  public static CHAT_CONVERSATIONS(clientId: string): readonly string[] {
    return ['chat-conversations', clientId];
  }
}
