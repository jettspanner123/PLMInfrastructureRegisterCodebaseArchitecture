import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type EnvironmentOverviewInterfaceModel from '../../../Models/EnvironmentOverviewInterfaceModel';
import type CreateEnvironmentOverviewRequestInterfaceModel from '../../../Models/CreateEnvironmentOverviewRequestInterfaceModel';
import type UpdateEnvironmentOverviewStatusRequestInterfaceModel from '../../../Models/UpdateEnvironmentOverviewStatusRequestInterfaceModel';
import type AddEnvironmentOverviewStatusOptionRequestInterfaceModel from '../../../Models/AddEnvironmentOverviewStatusOptionRequestInterfaceModel';
import type AddActionItemRequestInterfaceModel from '../../../Models/AddActionItemRequestInterfaceModel';

export default class EnvironmentOverviewService {
  public static current: EnvironmentOverviewService = new EnvironmentOverviewService();

  public async getEnvironmentOverviews(): Promise<EnvironmentOverviewInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview`);

    if (!response.ok) {
      throw new Error(`Failed to fetch Environment Overviews (HTTP ${response.status}).`);
    }

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel[]> = await response.json();

    if (!payload.status) {
      throw new Error(payload.message || 'Failed to fetch Environment Overviews.');
    }

    return payload.data;
  }

  public async createEnvironmentOverview(
    request: CreateEnvironmentOverviewRequestInterfaceModel
  ): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to create the environment.');
    }

    return payload.data;
  }

  public async getStatusOptions(): Promise<string[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/StatusOptions`);

    const payload: APIResponseInterfaceModel<string[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch Status options.');
    }

    return payload.data;
  }

  public async addStatusOption(request: AddEnvironmentOverviewStatusOptionRequestInterfaceModel): Promise<string[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/StatusOptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<string[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to add the Status option.');
    }

    return payload.data;
  }

  public async updateStatus(
    id: string,
    request: UpdateEnvironmentOverviewStatusRequestInterfaceModel
  ): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}/Status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the Status.');
    }

    return payload.data;
  }

  public async addActionItem(
    id: string,
    request: AddActionItemRequestInterfaceModel
  ): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}/ActionItems`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to add the action item.');
    }

    return payload.data;
  }
}
