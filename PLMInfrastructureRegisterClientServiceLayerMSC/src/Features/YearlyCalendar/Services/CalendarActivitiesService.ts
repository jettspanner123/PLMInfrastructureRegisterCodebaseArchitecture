import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type CalendarActivityInterfaceModel from '../../../Models/CalendarActivityInterfaceModel';
import type CreateCalendarActivityInputInterfaceModel from '../../../Models/CreateCalendarActivityInputInterfaceModel';
import AdminIdentityUtility from '../../../Utilities/AdminIdentityUtility';

export default class CalendarActivitiesService {
  public static current: CalendarActivitiesService = new CalendarActivitiesService();

  private buildAdminAuthorizationHeaders(): HeadersInit {
    const token = AdminIdentityUtility.current.getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  public async createCalendarActivity(
    request: CreateCalendarActivityInputInterfaceModel
  ): Promise<CalendarActivityInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/CalendarActivities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.buildAdminAuthorizationHeaders() },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<CalendarActivityInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to create the calendar activity.');
    }

    return payload.data;
  }

  // Public - no auth header, per contracts/list-calendar-activities.md.
  public async getAllCalendarActivities(): Promise<CalendarActivityInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/CalendarActivities`);

    const payload: APIResponseInterfaceModel<CalendarActivityInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch calendar activities.');
    }

    return payload.data;
  }
}
