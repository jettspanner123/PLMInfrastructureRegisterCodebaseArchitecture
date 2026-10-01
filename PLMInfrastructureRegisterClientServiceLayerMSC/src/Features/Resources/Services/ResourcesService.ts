import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type ResourceInterfaceModel from '../../../Models/ResourceInterfaceModel';

export default class ResourcesService {
  public static current: ResourcesService = new ResourcesService();

  public async getResources(): Promise<ResourceInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Resources`);

    if (!response.ok) {
      throw new Error(`Failed to fetch Resources (HTTP ${response.status}).`);
    }

    const payload: APIResponseInterfaceModel<ResourceInterfaceModel[]> = await response.json();

    if (!payload.status) {
      throw new Error(payload.message || 'Failed to fetch Resources.');
    }

    return payload.data;
  }
}
