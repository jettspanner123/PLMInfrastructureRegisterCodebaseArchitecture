import type { FeatureRequestCategoryEnumModel } from './FeatureRequestCategoryEnumModel';
import type { FeatureRequestPriorityEnumModel } from './FeatureRequestPriorityEnumModel';

export default interface CreateFeatureRequestInputInterfaceModel {
  title: string;
  description: string;
  category: FeatureRequestCategoryEnumModel;
  priority: FeatureRequestPriorityEnumModel;
  requesterName: string;
}
