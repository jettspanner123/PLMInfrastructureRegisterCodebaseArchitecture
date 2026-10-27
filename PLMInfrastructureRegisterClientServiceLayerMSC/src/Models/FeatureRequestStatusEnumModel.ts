export type FeatureRequestStatusEnumModel =
  | 'UnderReview'
  | 'Planned'
  | 'InProgress'
  | 'Completed'
  | 'Declined';

export const FeatureRequestStatusEnumModel = {
  UnderReview: 'UnderReview',
  Planned: 'Planned',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Declined: 'Declined',
} as const;
