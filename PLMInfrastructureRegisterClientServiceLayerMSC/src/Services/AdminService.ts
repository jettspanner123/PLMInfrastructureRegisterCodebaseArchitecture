import ApplicationNetworkAPIConfiguration from '../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../Models/APIResponseInterfaceModel';
import type AdminLoginRequestInterfaceModel from '../Models/AdminLoginRequestInterfaceModel';
import type AdminLoginResponseInterfaceModel from '../Models/AdminLoginResponseInterfaceModel';

export default class AdminService {
  public static current: AdminService = new AdminService();

  public async login(request: AdminLoginRequestInterfaceModel): Promise<AdminLoginResponseInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/Admin/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<AdminLoginResponseInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to log in.');
    }

    return payload.data;
  }
}
