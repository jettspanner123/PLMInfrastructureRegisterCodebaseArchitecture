import type ResourceCellFormatTargetInterfaceModel from './ResourceCellFormatTargetInterfaceModel';

// Mirrors the backend's UpdateResourceCellFormatRequestDTO field-for-field -
// a merge, not a replace: only the fields actually provided change anything
// for every targeted cell. isBold/isItalic are tri-state (undefined = leave
// as-is); clearBackgroundColor is its own explicit flag since "no color" is
// itself a valid state, not something backgroundColorKey being unset could
// mean on its own.
export default interface UpdateResourceCellFormatRequestInterfaceModel {
  cells: ResourceCellFormatTargetInterfaceModel[];
  isBold?: boolean;
  isItalic?: boolean;
  backgroundColorKey?: string;
  clearBackgroundColor?: boolean;
}
