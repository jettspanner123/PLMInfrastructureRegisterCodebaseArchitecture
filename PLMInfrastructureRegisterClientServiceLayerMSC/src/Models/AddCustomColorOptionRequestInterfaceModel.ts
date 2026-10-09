// Mirrors the backend's AddCustomColorOptionRequestDTO field-for-field.
export default interface AddCustomColorOptionRequestInterfaceModel {
  colorName: string;
  format: 'HEX' | 'RGB';
  color: string;
  createdByClientId: string;
}
