// Generic key-value user-preference store. Unlike ApplicationThemeUtility /
// ApplicationLayoutWidthUtility (one utility per preference, with its own
// hardcoded storage key), this utility is deliberately generic: callers pass
// in a key (always a SCREAM_CASE constant from ApplicationUserPreferenceKeyCON)
// and get plain localStorage-backed get/set, plus JSON helpers for
// structured values like "which columns are visible".
export default class ApplicationUserPreferenceUtility {
  public static current: ApplicationUserPreferenceUtility = new ApplicationUserPreferenceUtility();

  public getPreference(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  public setPreference(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
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
