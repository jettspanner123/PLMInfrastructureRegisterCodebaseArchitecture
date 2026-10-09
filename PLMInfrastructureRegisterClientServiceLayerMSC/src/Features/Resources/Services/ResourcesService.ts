import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type ResourceInterfaceModel from '../../../Models/ResourceInterfaceModel';
import type ResourceCellFormatInterfaceModel from '../../../Models/ResourceCellFormatInterfaceModel';
import type UpdateResourceCellFormatRequestInterfaceModel from '../../../Models/UpdateResourceCellFormatRequestInterfaceModel';
import type CustomColorOptionInterfaceModel from '../../../Models/CustomColorOptionInterfaceModel';
import type AddCustomColorOptionRequestInterfaceModel from '../../../Models/AddCustomColorOptionRequestInterfaceModel';
import type UpdateCustomColorOptionRequestInterfaceModel from '../../../Models/UpdateCustomColorOptionRequestInterfaceModel';

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

  public async getCellFormats(): Promise<ResourceCellFormatInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Resources/CellFormats`);

    const payload: APIResponseInterfaceModel<ResourceCellFormatInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch cell formats.');
    }

    return payload.data;
  }

  public async updateCellFormat(
    request: UpdateResourceCellFormatRequestInterfaceModel
  ): Promise<ResourceCellFormatInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Resources/CellFormats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<ResourceCellFormatInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the cell format.');
    }

    return payload.data;
  }

  public async getCustomColors(): Promise<CustomColorOptionInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Resources/CellFormats/Colors`);

    const payload: APIResponseInterfaceModel<CustomColorOptionInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch custom colors.');
    }

    return payload.data;
  }

  public async addCustomColor(
    request: AddCustomColorOptionRequestInterfaceModel
  ): Promise<CustomColorOptionInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Resources/CellFormats/Colors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<CustomColorOptionInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to add the custom color.');
    }

    return payload.data;
  }

  public async updateCustomColor(
    id: string,
    request: UpdateCustomColorOptionRequestInterfaceModel
  ): Promise<CustomColorOptionInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Resources/CellFormats/Colors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<CustomColorOptionInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the custom color.');
    }

    return payload.data;
  }

  public async deleteCustomColor(id: string): Promise<CustomColorOptionInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Resources/CellFormats/Colors/${id}`, {
      method: 'DELETE',
    });

    const payload: APIResponseInterfaceModel<CustomColorOptionInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to delete the custom color.');
    }

    return payload.data;
  }
}
