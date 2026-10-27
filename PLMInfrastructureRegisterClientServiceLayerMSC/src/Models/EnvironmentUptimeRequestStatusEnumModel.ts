export type EnvironmentUptimeRequestStatusEnumModel =
  | 'Pending'
  | 'Approved'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export const EnvironmentUptimeRequestStatusEnumModel = {
  Pending: 'Pending',
  Approved: 'Approved',
  Completed: 'Completed',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
} as const;

export default EnvironmentUptimeRequestStatusEnumModel;
