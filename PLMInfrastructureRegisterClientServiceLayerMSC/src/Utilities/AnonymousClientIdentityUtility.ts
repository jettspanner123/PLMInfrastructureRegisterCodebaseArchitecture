import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

// A placeholder stand-in for real user identity, which this app doesn't have
// yet (no authentication system exists). Generates one random id the first
// time it's asked for, then persists and reuses that same id for every
// subsequent call from this browser - via ApplicationUserPreferenceUtility,
// the same localStorage-backed utility every other preference in this app
// already goes through. This only guarantees "the same browser made these
// changes", not who that person actually is; replace every caller of this
// with a real authenticated user id once auth exists.
export default class AnonymousClientIdentityUtility {
  public static current: AnonymousClientIdentityUtility = new AnonymousClientIdentityUtility();

  public getOrCreateClientId(): string {
    const existing = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.ANONYMOUS_CLIENT_ID
    );
    if (existing) return existing;

    const generated = crypto.randomUUID();
    ApplicationUserPreferenceUtility.current.setPreference(ApplicationUserPreferenceKeyCON.ANONYMOUS_CLIENT_ID, generated);
    return generated;
  }
}
