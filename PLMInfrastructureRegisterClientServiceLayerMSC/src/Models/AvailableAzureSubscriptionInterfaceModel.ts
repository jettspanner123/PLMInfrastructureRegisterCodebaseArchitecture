// A real Azure subscription visible to the app's Azure credentials that
// isn't already in the configured list — the Add-subscription picker's
// source list. Mirrors the backend's AvailableAzureSubscriptionDTO.
export default interface AvailableAzureSubscriptionInterfaceModel {
  azureSubscriptionId: string;
  displayName: string;
}
