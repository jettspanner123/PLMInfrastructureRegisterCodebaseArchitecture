// Mirrors the backend's UpdateCustomColorOptionRequestDTO field-for-field.
// Which entry this updates is the id already in the request URL
// (PUT /Resources/CellFormats/Colors/{id}), so the body only needs the new
// values themselves.
export default interface UpdateCustomColorOptionRequestInterfaceModel {
  colorName: string;
  format: 'HEX' | 'RGB';
  color: string;
}
