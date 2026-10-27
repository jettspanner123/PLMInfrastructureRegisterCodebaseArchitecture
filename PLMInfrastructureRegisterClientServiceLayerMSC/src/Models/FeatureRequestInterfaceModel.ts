import type { FeatureRequestCategoryEnumModel } from './FeatureRequestCategoryEnumModel';
import type { FeatureRequestPriorityEnumModel } from './FeatureRequestPriorityEnumModel';
import type { FeatureRequestStatusEnumModel } from './FeatureRequestStatusEnumModel';

export default interface FeatureRequestInterfaceModel {
  id: string;
  title: string;
  description: string;
  category: FeatureRequestCategoryEnumModel;
  priority: FeatureRequestPriorityEnumModel;
  status: FeatureRequestStatusEnumModel;
  requesterName: string;
  createdAt: string;
  updatedAt: string;
}
