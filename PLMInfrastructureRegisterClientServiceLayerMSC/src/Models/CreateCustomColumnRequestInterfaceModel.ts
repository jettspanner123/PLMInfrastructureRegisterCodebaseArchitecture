import type { CustomColumnTypeEnumModel } from './CustomColumnTypeEnumModel';

export default interface CreateCustomColumnRequestInterfaceModel {
  relativeToColumnKey: string;
  direction: 'Left' | 'Right';
  columnType: CustomColumnTypeEnumModel;
}
