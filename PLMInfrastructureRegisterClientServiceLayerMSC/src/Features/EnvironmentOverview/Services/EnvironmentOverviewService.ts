import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type EnvironmentOverviewInterfaceModel from '../../../Models/EnvironmentOverviewInterfaceModel';

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
}
