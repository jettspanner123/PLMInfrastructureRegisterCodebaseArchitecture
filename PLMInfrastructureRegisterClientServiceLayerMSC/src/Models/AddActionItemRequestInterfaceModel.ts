// Mirrors the backend's AddActionItemRequestDTO field-for-field. The date
// prefix is computed and prepended server-side (never client-supplied) -
// see EnvironmentOverviewService.AddActionItemAsynchronous.
export default interface AddActionItemRequestInterfaceModel {
  note: string;
}
