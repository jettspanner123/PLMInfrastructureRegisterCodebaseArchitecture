// The single place every persisted user preference in this app goes through —
// theme, layout width, column visibility, and anything added later. Callers
// pass a key (always a SCREAM_CASE constant from ApplicationUserPreferenceKeyCON)
// and get a tab-scoped read/write: a value set in one tab doesn't silently
// change what an already-open tab sees until that tab reloads, while a brand
// new tab still inherits the last value saved anywhere (session-first, then
// falls back to and re-seeds from localStorage). Plus JSON helpers for
// structured values like "which columns are visible".
export default class ApplicationUserPreferenceUtility {
  public static current: ApplicationUserPreferenceUtility = new ApplicationUserPreferenceUtility();

  public getPreference(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue !== null) return sessionValue;

      const localValue = localStorage.getItem(key);
      if (localValue !== null) {
        sessionStorage.setItem(key, localValue);
        return localValue;
      }
    } catch {
      // Ignore storage access errors
    }
    return null;
  }

  public setPreference(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, value);
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage access errors
    }
  }

  public getJSONPreference<T>(key: string, fallback: T): T {
    const raw = this.getPreference(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  public setJSONPreference<T>(key: string, value: T): void {
    this.setPreference(key, JSON.stringify(value));
  }
}
