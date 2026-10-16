// Mirrors the backend's AddLegendEntryRequestDTO field-for-field.
export default interface AddLegendEntryRequestInterfaceModel {
  name: string;
  format: 'HEX' | 'RGB';
  color: string;
  createdByClientId: string;
}
