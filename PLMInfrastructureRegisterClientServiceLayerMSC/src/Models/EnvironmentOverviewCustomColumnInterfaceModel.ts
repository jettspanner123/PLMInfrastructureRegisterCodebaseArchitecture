import type { CustomColumnTypeEnumModel } from './CustomColumnTypeEnumModel';

// Mirrors the backend's EnvironmentOverviewCustomColumnDTO field-for-field.
export default interface EnvironmentOverviewCustomColumnInterfaceModel {
  id: string;
  headerName: string;
  columnType: CustomColumnTypeEnumModel;
  position: number;
  // Populated only for Dropdown-type columns.
  options: string[];
}
