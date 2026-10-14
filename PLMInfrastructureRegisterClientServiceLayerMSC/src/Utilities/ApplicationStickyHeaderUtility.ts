import ApplicationStickyHeaderCON from '../Constants/ApplicationStickyHeaderCON';
import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

export default class ApplicationStickyHeaderUtility {
  public static current: ApplicationStickyHeaderUtility = new ApplicationStickyHeaderUtility();

  public static readonly EVENT_STICKY_HEADER_CHANGE = 'table-sticky-header-change';

  public getSavedPreference(): string {
    const saved = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.STICKY_HEADER
    );
    if (saved === ApplicationStickyHeaderCON.STICKY || saved === ApplicationStickyHeaderCON.STATIC) {
      return saved;
    }
    return ApplicationStickyHeaderCON.STICKY; // Default: sticky enabled
  }

  public applyPreference(preference: string): void {
    ApplicationUserPreferenceUtility.current.setPreference(
      ApplicationUserPreferenceKeyCON.STICKY_HEADER,
      preference
    );

    if (typeof window === 'undefined') return;

    const isSticky = preference === ApplicationStickyHeaderCON.STICKY;
    document.documentElement.classList.toggle('table-sticky-header', isSticky);

    window.dispatchEvent(
      new CustomEvent(ApplicationStickyHeaderUtility.EVENT_STICKY_HEADER_CHANGE, {
        detail: { isSticky, preference },
      })
    );
  }
}
