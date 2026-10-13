import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

export type HorizontalScrollPillPreference = 'SHOW' | 'HIDE';

export default class ApplicationHorizontalScrollPillUtility {
  public static current: ApplicationHorizontalScrollPillUtility = new ApplicationHorizontalScrollPillUtility();

  public static readonly SHOW: HorizontalScrollPillPreference = 'SHOW';
  public static readonly HIDE: HorizontalScrollPillPreference = 'HIDE';
  public static readonly PREFERENCE_CHANGED_EVENT: string = 'horizontal-scroll-pill-preference-changed';

  public getSavedPreference(): HorizontalScrollPillPreference {
    const saved = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.HORIZONTAL_SCROLL_PILL_ENABLED
    );
    if (saved === ApplicationHorizontalScrollPillUtility.HIDE) {
      return ApplicationHorizontalScrollPillUtility.HIDE;
    }
    return ApplicationHorizontalScrollPillUtility.SHOW;
  }

  public isEnabled(): boolean {
    return this.getSavedPreference() === ApplicationHorizontalScrollPillUtility.SHOW;
  }

  public setPreference(preference: HorizontalScrollPillPreference): void {
    ApplicationUserPreferenceUtility.current.setPreference(
      ApplicationUserPreferenceKeyCON.HORIZONTAL_SCROLL_PILL_ENABLED,
      preference
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(ApplicationHorizontalScrollPillUtility.PREFERENCE_CHANGED_EVENT, {
          detail: { preference },
        })
      );
    }
  }
}
