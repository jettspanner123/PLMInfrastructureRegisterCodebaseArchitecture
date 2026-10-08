// Mirrors the backend's AddEnvironmentOverviewOptionRequestDTO field-for-
// field. Which field's option list this adds to is the fieldName already in
// the request URL (POST /EnvironmentOverview/Options/{fieldName}), so the
// body only needs the new value itself.
export default interface AddEnvironmentOverviewOptionRequestInterfaceModel {
  value: string;
}
