import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

interface DecodedAdminJwtPayload {
  sub?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): DecodedAdminJwtPayload | null {
  try {
    const payloadSegment = token.split('.')[1];
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Stores/reads the JWT issued by POST /Api/V1/Admin/Login, via the same
// tab-scoped localStorage/sessionStorage utility every other preference in
// this app already goes through. No endpoint actually checks admin status
// yet (see PRD_ADMIN_EMAIL_PASSWORD_LOGIN.md) - this is purely identity
// storage for now.
export default class AdminIdentityUtility {
  public static current: AdminIdentityUtility = new AdminIdentityUtility();

  public storeAdminToken(token: string): void {
    ApplicationUserPreferenceUtility.current.setPreference(ApplicationUserPreferenceKeyCON.ADMIN_JWT_TOKEN, token);
  }

  public getAdminToken(): string | null {
    return ApplicationUserPreferenceUtility.current.getPreference(ApplicationUserPreferenceKeyCON.ADMIN_JWT_TOKEN);
  }

  public isLoggedInAsAdmin(): boolean {
    const token = this.getAdminToken();
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;

    return payload.exp * 1000 > Date.now();
  }

  public getAdminDisplayIdentity(): string | null {
    const token = this.getAdminToken();
    if (!token) return null;

    return decodeJwtPayload(token)?.sub ?? null;
  }

  public clearAdminToken(): void {
    ApplicationUserPreferenceUtility.current.setPreference(ApplicationUserPreferenceKeyCON.ADMIN_JWT_TOKEN, '');
  }
}
