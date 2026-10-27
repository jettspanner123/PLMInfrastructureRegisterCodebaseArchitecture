export type FeatureRequestCategoryEnumModel =
  | 'InfrastructureRegister'
  | 'EnvironmentOverview'
  | 'ChatAssistant'
  | 'General';

export const FeatureRequestCategoryEnumModel = {
  InfrastructureRegister: 'InfrastructureRegister',
  EnvironmentOverview: 'EnvironmentOverview',
  ChatAssistant: 'ChatAssistant',
  General: 'General',
} as const;
