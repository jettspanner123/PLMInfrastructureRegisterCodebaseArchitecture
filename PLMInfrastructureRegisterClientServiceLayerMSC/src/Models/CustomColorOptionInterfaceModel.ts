// Mirrors the backend's CustomColorOptionDTO field-for-field. One entry in
// the named, growable custom-color palette offered by the right-click
// formatting menu's "Add Color" option.
export default interface CustomColorOptionInterfaceModel {
  id: string;
  colorName: string;
  format: 'HEX' | 'RGB';
  color: string;
  createdBy: string;
  createdAt: string;
}
