// Mirrors the backend's LegendEntryDTO field-for-field. One entry in the
// Infrastructure Register page's user-manageable legend row - purely a
// labeled reference list (name + color), not tied to any actual
// table-column coloring. System entries (isSystemLegend: true) are locked -
// they can't be edited or deleted.
export default interface LegendEntryInterfaceModel {
  id: string;
  name: string;
  format: 'HEX' | 'RGB';
  color: string;
  isSystemLegend: boolean;
  createdBy: string | null;
  createdAt: string;
}
