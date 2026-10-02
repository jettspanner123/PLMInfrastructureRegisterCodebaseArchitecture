// Mirrors the backend's ConfiguredSubscriptionDTO exactly (camelCase, per
// System.Text.Json's default naming policy).
export default interface ConfiguredSubscriptionInterfaceModel {
  id: string;
  azureSubscriptionId: string;
  displayName: string;
  resourceCount: number;
}
