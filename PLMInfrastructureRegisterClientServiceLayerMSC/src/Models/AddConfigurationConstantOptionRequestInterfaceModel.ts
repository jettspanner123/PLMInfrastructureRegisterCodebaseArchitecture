// Mirrors the backend's AddConfigurationConstantOptionRequestDTO field-for-
// field. Which field's option list this adds to is the fieldName already in
// the request URL (POST /ConfigurationConstants/{fieldName}), so the body
// only needs the new value itself.
export default interface AddConfigurationConstantOptionRequestInterfaceModel {
  value: string;
}
