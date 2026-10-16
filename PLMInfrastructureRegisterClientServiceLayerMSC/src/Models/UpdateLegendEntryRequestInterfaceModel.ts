// Mirrors the backend's UpdateLegendEntryRequestDTO field-for-field. Which
// entry this updates is the id already in the request URL
// (PUT /Resources/Legends/{id}), so the body only needs the new values
// themselves.
export default interface UpdateLegendEntryRequestInterfaceModel {
  name: string;
  format: 'HEX' | 'RGB';
  color: string;
}
