import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type FeatureRequestInterfaceModel from '../../../Models/FeatureRequestInterfaceModel';
import type CreateFeatureRequestInputInterfaceModel from '../../../Models/CreateFeatureRequestInputInterfaceModel';
import type UpdateFeatureRequestStatusInputInterfaceModel from '../../../Models/UpdateFeatureRequestStatusInputInterfaceModel';

export default class FeatureRequestsService {
  public static current: FeatureRequestsService = new FeatureRequestsService();

  public async getFeatureRequests(): Promise<FeatureRequestInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/FeatureRequests`);

    if (!response.ok) {
      throw new Error(`Failed to fetch feature requests (HTTP ${response.status}).`);
    }

    const payload: APIResponseInterfaceModel<FeatureRequestInterfaceModel[]> = await response.json();

    if (!payload.status) {
      throw new Error(payload.message || 'Failed to fetch feature requests.');
    }

    return payload.data;
  }

  public async createFeatureRequest(
    request: CreateFeatureRequestInputInterfaceModel
  ): Promise<FeatureRequestInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/FeatureRequests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<FeatureRequestInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to submit feature request.');
    }

    return payload.data;
  }

  public async updateStatus(
    id: string,
    request: UpdateFeatureRequestStatusInputInterfaceModel
  ): Promise<FeatureRequestInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/FeatureRequests/${id}/Status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<FeatureRequestInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update feature request status.');
    }

    return payload.data;
  }

  public async deleteFeatureRequest(id: string): Promise<boolean> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/FeatureRequests/${id}`, {
      method: 'DELETE',
    });

    const payload: APIResponseInterfaceModel<boolean> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to delete feature request.');
    }

    return payload.data;
  }
}
