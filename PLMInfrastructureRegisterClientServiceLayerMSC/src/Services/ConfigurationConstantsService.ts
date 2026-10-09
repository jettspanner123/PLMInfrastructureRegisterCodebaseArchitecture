import ApplicationNetworkAPIConfiguration from '../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../Models/APIResponseInterfaceModel';
import type AddConfigurationConstantOptionRequestInterfaceModel from '../Models/AddConfigurationConstantOptionRequestInterfaceModel';

// Generic growable-dropdown options mechanism, shared by every feature that
// needs one - Environment Overview's Status/Sponsor dropdowns, Infrastructure
// Register's custom color palette, any future one - rather than a dedicated
// getXOptions/addXOption pair per field per feature. fieldName is validated
// server-side against a fixed allow-list (see ConfigurationConstantsAssertion
// on the backend).
export default class ConfigurationConstantsService {
  public static current: ConfigurationConstantsService = new ConfigurationConstantsService();

  public async getOptions(fieldName: string): Promise<string[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/ConfigurationConstants/${fieldName}`);

    const payload: APIResponseInterfaceModel<string[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch the options.');
    }

    return payload.data;
  }

  public async addOption(fieldName: string, request: AddConfigurationConstantOptionRequestInterfaceModel): Promise<string[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/ConfigurationConstants/${fieldName}`, {
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
}
