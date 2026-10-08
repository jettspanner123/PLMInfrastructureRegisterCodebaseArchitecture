// Mirrors the backend's UpdateEnvironmentOverviewStatusRequestDTO field-for-
// field. changedByClientId is a per-browser random id, not a real user
// identity - see AnonymousClientIdentityUtility.ts.
export default interface UpdateEnvironmentOverviewStatusRequestInterfaceModel {
  status: string;
  changedByClientId: string;
}
