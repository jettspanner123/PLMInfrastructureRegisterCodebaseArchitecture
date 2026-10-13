// Mirrors the backend's EnvironmentOverviewCellFormatDTO field-for-field. One
// entry per (environmentOverviewId, columnKey) that has ANY non-default
// formatting - a cell with no matching entry is simply unformatted.
export default interface EnvironmentOverviewCellFormatInterfaceModel {
  environmentOverviewId: string;
  columnKey: string;
  isBold: boolean;
  isItalic: boolean;
  backgroundColorKey: string | null;
  backgroundOpacity: number;
  textColorKey?: string | null;
}
