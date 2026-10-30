import { useEffect, useState } from 'react';
import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

// Storage changes alone don't trigger a React re-render in sibling
// components (e.g. logging in via the profile card doesn't re-render
// ResourcesScreenController, a totally separate part of the tree) - this
// event is how useIsAdmin() below finds out something changed without
// needing a page reload.
const ADMIN_STATUS_CHANGED_EVENT = 'admin-status-changed';

interface DecodedAdminJwtPayload {
  sub?: string;
  exp?: number;
  firstName?: string;
  lastName?: string;
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
    window.dispatchEvent(new Event(ADMIN_STATUS_CHANGED_EVENT));
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

  public getAdminFullName(): string | null {
    const token = this.getAdminToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload?.firstName || !payload.lastName) return null;

    return `${payload.firstName} ${payload.lastName}`;
  }

  public getAdminInitials(): string | null {
    const token = this.getAdminToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload?.firstName || !payload.lastName) return null;

    return `${payload.firstName[0]}${payload.lastName[0]}`.toUpperCase();
  }

  public clearAdminToken(): void {
    ApplicationUserPreferenceUtility.current.setPreference(ApplicationUserPreferenceKeyCON.ADMIN_JWT_TOKEN, '');
    window.dispatchEvent(new Event(ADMIN_STATUS_CHANGED_EVENT));
  }
}

// Reactive read of admin status - re-renders the calling component whenever
// storeAdminToken/clearAdminToken fire anywhere in the app (login, sign out),
// not just on this component's own mount. Every place that needs to hide/show
// something based on admin status (profile card, Mode toggles, future gates)
// should use this instead of calling AdminIdentityUtility directly.
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => AdminIdentityUtility.current.isLoggedInAsAdmin());

  useEffect(() => {
    const handleAdminStatusChanged = (): void => {
      setIsAdmin(AdminIdentityUtility.current.isLoggedInAsAdmin());
    };

    window.addEventListener(ADMIN_STATUS_CHANGED_EVENT, handleAdminStatusChanged);
    return () => window.removeEventListener(ADMIN_STATUS_CHANGED_EVENT, handleAdminStatusChanged);
  }, []);

  return isAdmin;
}
