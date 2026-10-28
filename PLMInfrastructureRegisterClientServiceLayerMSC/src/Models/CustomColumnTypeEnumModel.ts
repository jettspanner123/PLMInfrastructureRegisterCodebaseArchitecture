// Mirrors the backend's CustomColumnTypeEnum exactly (System.Text.Json's
// default enum-to-string serialization) - a fixed, closed set picked once
// at column creation and never changed afterward.
const CustomColumnTypeEnumModel = {
  Text: 'Text',
  Number: 'Number',
  Date: 'Date',
  Dropdown: 'Dropdown',
} as const;

export type CustomColumnTypeEnumModel = (typeof CustomColumnTypeEnumModel)[keyof typeof CustomColumnTypeEnumModel];

export default CustomColumnTypeEnumModel;
