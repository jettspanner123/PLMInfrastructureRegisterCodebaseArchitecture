// Mirrors the backend's ResourceCellFormatDTO field-for-field. One entry
// per (resourceId, columnKey) that has ANY non-default formatting - a cell
// with no matching entry is simply unformatted.
export default interface ResourceCellFormatInterfaceModel {
  resourceId: string;
  columnKey: string;
  isBold: boolean;
  isItalic: boolean;
  backgroundColorKey: string | null;
}
