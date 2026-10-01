import ApplicationLayoutWidthCON from '../Constants/ApplicationLayoutWidthCON';
import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

// Mirrors ApplicationThemeUtility's pattern: a class on <html> that CSS
// reacts to (see index.css's `html.full-width-layout .max-w-7xl` rule),
// persisted through ApplicationUserPreferenceUtility.
export default class ApplicationLayoutWidthUtility {
  public static current: ApplicationLayoutWidthUtility = new ApplicationLayoutWidthUtility();

  public getSavedPreference(): string {
    const saved = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.LAYOUT_WIDTH_PREFERENCE
    );
    if (saved === ApplicationLayoutWidthCON.CONSTRAINED || saved === ApplicationLayoutWidthCON.FULL_WIDTH) {
      return saved;
    }
    return ApplicationLayoutWidthCON.CONSTRAINED; // Default to the current constrained width
  }

  public applyPreference(value: string): void {
    ApplicationUserPreferenceUtility.current.setPreference(
      ApplicationUserPreferenceKeyCON.LAYOUT_WIDTH_PREFERENCE,
      value
    );
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle(
      'full-width-layout',
      value === ApplicationLayoutWidthCON.FULL_WIDTH
    );
  }

  public togglePreference(currentValue: string): string {
    const next =
      currentValue === ApplicationLayoutWidthCON.CONSTRAINED
        ? ApplicationLayoutWidthCON.FULL_WIDTH
        : ApplicationLayoutWidthCON.CONSTRAINED;
    this.applyPreference(next);
    return next;
  }
}
