import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type EnvironmentOverviewInterfaceModel from '../../../Models/EnvironmentOverviewInterfaceModel';
import type CreateEnvironmentOverviewRequestInterfaceModel from '../../../Models/CreateEnvironmentOverviewRequestInterfaceModel';
import type UpdateEnvironmentOverviewStatusRequestInterfaceModel from '../../../Models/UpdateEnvironmentOverviewStatusRequestInterfaceModel';
import type AddEnvironmentOverviewOptionRequestInterfaceModel from '../../../Models/AddEnvironmentOverviewOptionRequestInterfaceModel';
import type AddActionItemRequestInterfaceModel from '../../../Models/AddActionItemRequestInterfaceModel';
import type UpdateEnvironmentOverviewFieldRequestInterfaceModel from '../../../Models/UpdateEnvironmentOverviewFieldRequestInterfaceModel';

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

  // Generic growable-dropdown options mechanism - shared by Status, Sponsor,
  // and any future field that needs one, rather than a dedicated
  // getXOptions/addXOption pair per field. fieldName is validated server-
  // side against a fixed allow-list (see EnvironmentOverviewAssertion on the
  // backend).
  public async getOptions(fieldName: string): Promise<string[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/Options/${fieldName}`);

    const payload: APIResponseInterfaceModel<string[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch the options.');
    }

    return payload.data;
  }

  public async addOption(fieldName: string, request: AddEnvironmentOverviewOptionRequestInterfaceModel): Promise<string[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/Options/${fieldName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<string[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to add the option.');
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

  // Soft delete server-side (IsDeleted/DeletedAt, see EnvironmentOverviewNexus)
  // - the frontend never sees that distinction, since a soft-deleted
  // environment just stops coming back from GET at all.
  public async deleteEnvironmentOverview(id: string): Promise<boolean> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}`, {
      method: 'DELETE',
    });

    const payload: APIResponseInterfaceModel<boolean> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to delete the environment.');
    }

    return payload.data;
  }

  public async updateField(
    id: string,
    request: UpdateEnvironmentOverviewFieldRequestInterfaceModel
  ): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}/Field`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the field.');
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

  public async deleteActionItem(id: string, lineIndex: number): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}/ActionItems/${lineIndex}`, {
      method: 'DELETE',
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to delete the action item.');
    }

    return payload.data;
  }
}
