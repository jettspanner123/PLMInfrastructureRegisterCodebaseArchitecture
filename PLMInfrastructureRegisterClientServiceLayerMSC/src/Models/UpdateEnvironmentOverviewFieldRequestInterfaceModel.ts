// Mirrors the backend's UpdateEnvironmentOverviewFieldRequestDTO field-for-
// field. fieldName must be one of the backend's allow-listed PascalCase
// property names (see EnvironmentOverviewCON.EDITABLE_TEXT_FIELD_NAMES for
// the camelCase-key -> PascalCase-FieldName mapping) - anything else is
// rejected server-side.
export default interface UpdateEnvironmentOverviewFieldRequestInterfaceModel {
  fieldName: string;
  value: string | null;
}
