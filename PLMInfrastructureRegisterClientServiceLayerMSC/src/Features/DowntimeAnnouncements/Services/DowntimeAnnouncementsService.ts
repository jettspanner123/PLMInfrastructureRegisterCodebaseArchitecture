import ApplicationNetworkAPIConfiguration from '../../../Constants/ApplicationNetworkAPIConfiguration';
import type APIResponseInterfaceModel from '../../../Models/APIResponseInterfaceModel';
import type DowntimeAnnouncementInterfaceModel from '../../../Models/DowntimeAnnouncementInterfaceModel';
import type CreateDowntimeAnnouncementInputInterfaceModel from '../../../Models/CreateDowntimeAnnouncementInputInterfaceModel';
import type UpdateDowntimeAnnouncementInputInterfaceModel from '../../../Models/UpdateDowntimeAnnouncementInputInterfaceModel';
import AdminIdentityUtility from '../../../Utilities/AdminIdentityUtility';

export default class DowntimeAnnouncementsService {
  public static current: DowntimeAnnouncementsService = new DowntimeAnnouncementsService();

  // Only this feature's two admin-only calls actually send the admin JWT -
  // no other fetch call in this app sends an Authorization header today
  // (AdminIdentityUtility previously only decoded it locally for display).
  // This is what makes the backend's new [Authorize(Policy = "RequireAdmin")]
  // checks reachable at all.
  private buildAdminAuthorizationHeaders(): HeadersInit {
    const token = AdminIdentityUtility.current.getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  public async createDowntimeAnnouncement(
    request: CreateDowntimeAnnouncementInputInterfaceModel
  ): Promise<DowntimeAnnouncementInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/DowntimeAnnouncements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.buildAdminAuthorizationHeaders() },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<DowntimeAnnouncementInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to create the downtime announcement.');
    }

    return payload.data;
  }

  public async getActiveDowntimeAnnouncement(): Promise<DowntimeAnnouncementInterfaceModel | null> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/DowntimeAnnouncements/Active`);

    const payload: APIResponseInterfaceModel<DowntimeAnnouncementInterfaceModel | null> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch the active downtime announcement.');
    }

    return payload.data;
  }

  // Public (no admin auth header) - contracts/calendar-backend-endpoints.md
  // §2 in specs/009-calendar-backend-integration. Both params required.
  public async getDowntimeAnnouncementsInRange(fromAt: Date, toAt: Date): Promise<DowntimeAnnouncementInterfaceModel[]> {
    const params = new URLSearchParams({
      fromAt: fromAt.toISOString(),
      toAt: toAt.toISOString(),
    });

    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/DowntimeAnnouncements/InRange?${params.toString()}`);

    const payload: APIResponseInterfaceModel<DowntimeAnnouncementInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch downtime announcements.');
    }

    return payload.data;
  }

  public async endDowntimeAnnouncementEarly(id: string): Promise<DowntimeAnnouncementInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/DowntimeAnnouncements/${id}/EndEarly`, {
      method: 'PUT',
      headers: this.buildAdminAuthorizationHeaders(),
    });

    const payload: APIResponseInterfaceModel<DowntimeAnnouncementInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to end the downtime announcement.');
    }

    return payload.data;
  }

  public async getAllDowntimeAnnouncements(): Promise<DowntimeAnnouncementInterfaceModel[]> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/DowntimeAnnouncements`, {
      headers: this.buildAdminAuthorizationHeaders(),
    });

    const payload: APIResponseInterfaceModel<DowntimeAnnouncementInterfaceModel[]> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to fetch downtime announcements.');
    }

    return payload.data;
  }

  public async updateDowntimeAnnouncement(
    id: string,
    request: UpdateDowntimeAnnouncementInputInterfaceModel
  ): Promise<DowntimeAnnouncementInterfaceModel> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/DowntimeAnnouncements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.buildAdminAuthorizationHeaders() },
      body: JSON.stringify(request),
    });

    const payload: APIResponseInterfaceModel<DowntimeAnnouncementInterfaceModel> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to update the downtime announcement.');
    }

    return payload.data;
  }

  public async deleteDowntimeAnnouncement(id: string): Promise<boolean> {
    const response = await fetch(`${ApplicationNetworkAPIConfiguration.API_BASE_URL}/Api/V1/DowntimeAnnouncements/${id}`, {
      method: 'DELETE',
      headers: this.buildAdminAuthorizationHeaders(),
    });

    const payload: APIResponseInterfaceModel<boolean> = await response.json();

    if (!response.ok || !payload.status) {
      throw new Error(payload.message || 'Failed to delete the downtime announcement.');
    }

    return payload.data;
  }
}
