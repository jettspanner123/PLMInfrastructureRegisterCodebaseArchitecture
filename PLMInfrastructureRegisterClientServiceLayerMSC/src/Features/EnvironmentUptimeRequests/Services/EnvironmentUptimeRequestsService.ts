import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type EnvironmentUptimeRequestInterfaceModel from '../../../Models/EnvironmentUptimeRequestInterfaceModel';
import type CreateEnvironmentUptimeRequestInputInterfaceModel from '../../../Models/CreateEnvironmentUptimeRequestInputInterfaceModel';
import type UpdateEnvironmentUptimeRequestStatusRequestInterfaceModel from '../../../Models/UpdateEnvironmentUptimeRequestStatusRequestInterfaceModel';

export default class EnvironmentUptimeRequestsService {
  public static current: EnvironmentUptimeRequestsService = new EnvironmentUptimeRequestsService();

  public async getEnvironmentUptimeRequests(): Promise<EnvironmentUptimeRequestInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentUptimeRequests`);

    const payload: APIResponseInterfaceModel<EnvironmentUptimeRequestInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch uptime requests.');
    }

    return payload.data;
  }

  public async createEnvironmentUptimeRequest(
    request: CreateEnvironmentUptimeRequestInputInterfaceModel
  ): Promise<EnvironmentUptimeRequestInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentUptimeRequests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentUptimeRequestInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to submit uptime request.');
    }

    return payload.data;
  }

  public async updateStatus(
    id: string,
    request: UpdateEnvironmentUptimeRequestStatusRequestInterfaceModel
  ): Promise<EnvironmentUptimeRequestInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentUptimeRequests/${id}/Status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentUptimeRequestInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the uptime request.');
    }

    return payload.data;
  }

  public async deleteEnvironmentUptimeRequest(id: string): Promise<boolean> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentUptimeRequests/${id}`, {
      method: 'DELETE',
    });

    const payload: APIResponseInterfaceModel<boolean> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to delete uptime request.');
    }

    return payload.data;
  }
}
