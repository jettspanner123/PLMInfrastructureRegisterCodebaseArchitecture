import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type ConfiguredSubscriptionInterfaceModel from '../../../Models/ConfiguredSubscriptionInterfaceModel';
import type AvailableAzureSubscriptionInterfaceModel from '../../../Models/AvailableAzureSubscriptionInterfaceModel';
import type SubscriptionDeletionResultInterfaceModel from '../../../Models/SubscriptionDeletionResultInterfaceModel';

export default class SubscriptionsService {
  public static current: SubscriptionsService = new SubscriptionsService();

  private readonly baseURL = `${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Subscriptions`;

  public async getConfiguredSubscriptions(): Promise<ConfiguredSubscriptionInterfaceModel[]> {
    const response = await fetch(this.baseURL);
    return this.unwrap<ConfiguredSubscriptionInterfaceModel[]>(response, 'Failed to fetch configured subscriptions.');
  }

  public async getAvailableAzureSubscriptions(): Promise<AvailableAzureSubscriptionInterfaceModel[]> {
    const response = await fetch(`${this.baseURL}/Available`);
    return this.unwrap<AvailableAzureSubscriptionInterfaceModel[]>(
      response,
      'Failed to fetch available Azure subscriptions.'
    );
  }

  public async addSubscription(azureSubscriptionId: string): Promise<ConfiguredSubscriptionInterfaceModel> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ azureSubscriptionId }),
    });
    return this.unwrap<ConfiguredSubscriptionInterfaceModel>(response, 'Failed to add the subscription.');
  }

  public async updateDisplayName(id: string, displayName: string): Promise<ConfiguredSubscriptionInterfaceModel> {
    const response = await fetch(`${this.baseURL}/${id}/DisplayName`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    return this.unwrap<ConfiguredSubscriptionInterfaceModel>(response, 'Failed to update the display name.');
  }

  public async deleteSubscription(id: string): Promise<SubscriptionDeletionResultInterfaceModel> {
    const response = await fetch(`${this.baseURL}/${id}`, { method: 'DELETE' });
    return this.unwrap<SubscriptionDeletionResultInterfaceModel>(response, 'Failed to remove the subscription.');
  }

  private async unwrap<T>(response: Response, fallbackErrorMessage: string): Promise<T> {
    const payload: APIResponseInterfaceModel<T> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || fallbackErrorMessage);
    }

    return payload.data;
  }
}
