import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type EnvironmentOverviewInterfaceModel from '../../../Models/EnvironmentOverviewInterfaceModel';
import type CreateEnvironmentOverviewRequestInterfaceModel from '../../../Models/CreateEnvironmentOverviewRequestInterfaceModel';
import type UpdateEnvironmentOverviewStatusRequestInterfaceModel from '../../../Models/UpdateEnvironmentOverviewStatusRequestInterfaceModel';
import type AddActionItemRequestInterfaceModel from '../../../Models/AddActionItemRequestInterfaceModel';
import type UpdateActionItemRequestInterfaceModel from '../../../Models/UpdateActionItemRequestInterfaceModel';
import type UpdateEnvironmentOverviewFieldRequestInterfaceModel from '../../../Models/UpdateEnvironmentOverviewFieldRequestInterfaceModel';
import type UpdateUptimeScheduleRequestInterfaceModel from '../../../Models/UpdateUptimeScheduleRequestInterfaceModel';
import type EnvironmentOverviewCellFormatInterfaceModel from '../../../Models/EnvironmentOverviewCellFormatInterfaceModel';
import type UpdateEnvironmentOverviewCellFormatRequestInterfaceModel from '../../../Models/UpdateEnvironmentOverviewCellFormatRequestInterfaceModel';
import type InsertRowRequestInterfaceModel from '../../../Models/InsertRowRequestInterfaceModel';
import type EnvironmentOverviewCustomColumnInterfaceModel from '../../../Models/EnvironmentOverviewCustomColumnInterfaceModel';
import type CreateCustomColumnRequestInterfaceModel from '../../../Models/CreateCustomColumnRequestInterfaceModel';
import type UpdateCustomColumnHeaderRequestInterfaceModel from '../../../Models/UpdateCustomColumnHeaderRequestInterfaceModel';
import type AddCustomColumnOptionRequestInterfaceModel from '../../../Models/AddCustomColumnOptionRequestInterfaceModel';
import type UpsertCustomCellValueRequestInterfaceModel from '../../../Models/UpsertCustomCellValueRequestInterfaceModel';

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

  // Separate from updateField (not the generic fieldName/value pair) since
  // this bundles two values together (the already-composed schedule string
  // plus the optional raw note) and can trigger server-side AI
  // summarization for a long note - neither of which the generic endpoint
  // supports.
  public async updateUptimeSchedule(
    id: string,
    request: UpdateUptimeScheduleRequestInterfaceModel
  ): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}/UptimeSchedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the uptime schedule.');
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

  public async updateActionItem(
    id: string,
    lineIndex: number,
    request: UpdateActionItemRequestInterfaceModel
  ): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}/ActionItems/${lineIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the action item.');
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

  public async getCellFormats(): Promise<EnvironmentOverviewCellFormatInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/CellFormats`);

    const payload: APIResponseInterfaceModel<EnvironmentOverviewCellFormatInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch cell formats.');
    }

    return payload.data;
  }

  public async updateCellFormat(
    request: UpdateEnvironmentOverviewCellFormatRequestInterfaceModel
  ): Promise<EnvironmentOverviewCellFormatInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/CellFormats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewCellFormatInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the cell format.');
    }

    return payload.data;
  }

  // Backs both the right-click "Add Row Above/Below" actions and the
  // unified "Add Environment" toolbar button.
  public async insertRow(request: InsertRowRequestInterfaceModel): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/InsertRow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to insert the row.');
    }

    return payload.data;
  }

  public async getCustomColumns(): Promise<EnvironmentOverviewCustomColumnInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/CustomColumns`);

    const payload: APIResponseInterfaceModel<EnvironmentOverviewCustomColumnInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch custom columns.');
    }

    return payload.data;
  }

  public async createCustomColumn(
    request: CreateCustomColumnRequestInterfaceModel
  ): Promise<EnvironmentOverviewCustomColumnInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/CustomColumns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewCustomColumnInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to create the column.');
    }

    return payload.data;
  }

  public async updateCustomColumnHeader(
    id: string,
    request: UpdateCustomColumnHeaderRequestInterfaceModel
  ): Promise<EnvironmentOverviewCustomColumnInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/CustomColumns/${id}/Header`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewCustomColumnInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to rename the column.');
    }

    return payload.data;
  }

  // Soft delete server-side - the frontend never sees that distinction,
  // same reasoning as deleteEnvironmentOverview above.
  public async deleteCustomColumn(id: string): Promise<boolean> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/CustomColumns/${id}`, {
      method: 'DELETE',
    });

    const payload: APIResponseInterfaceModel<boolean> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to delete the column.');
    }

    return payload.data;
  }

  public async addCustomColumnOption(
    id: string,
    request: AddCustomColumnOptionRequestInterfaceModel
  ): Promise<EnvironmentOverviewCustomColumnInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/CustomColumns/${id}/Options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<EnvironmentOverviewCustomColumnInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to add the option.');
    }

    return payload.data;
  }

  public async updateCustomCellValue(
    id: string,
    customColumnId: string,
    request: UpsertCustomCellValueRequestInterfaceModel
  ): Promise<EnvironmentOverviewInterfaceModel> {
    const response = await fetch(
      `${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/EnvironmentOverview/${id}/CustomCells/${customColumnId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    const payload: APIResponseInterfaceModel<EnvironmentOverviewInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the cell.');
    }

    return payload.data;
  }
}
