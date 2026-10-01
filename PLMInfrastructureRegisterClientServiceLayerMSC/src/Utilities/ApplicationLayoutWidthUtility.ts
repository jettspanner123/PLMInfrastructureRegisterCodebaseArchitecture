import ApplicationLayoutWidthCON from '../Constants/ApplicationLayoutWidthCON';

// Mirrors ApplicationThemeUtility/ApplicationGradientUtility's exact
// storage/DOM-class pattern: a class on <html> that CSS reacts to (see
// index.css's `html.full-width-layout main` rule), session-scoped with a
// localStorage fallback for new tabs.
export default class ApplicationLayoutWidthUtility {
  public static current: ApplicationLayoutWidthUtility = new ApplicationLayoutWidthUtility();

  private preferenceKey: string = 'plm_infrastructure_register_layout_width_preference';

  public getSavedPreference(): string {
    if (typeof window !== 'undefined') {
      try {
        const sessionValue = sessionStorage.getItem(this.preferenceKey);
        if (
          sessionValue === ApplicationLayoutWidthCON.CONSTRAINED ||
          sessionValue === ApplicationLayoutWidthCON.FULL_WIDTH
        ) {
          return sessionValue;
        }

        const localValue = localStorage.getItem(this.preferenceKey);
        if (
          localValue === ApplicationLayoutWidthCON.CONSTRAINED ||
          localValue === ApplicationLayoutWidthCON.FULL_WIDTH
        ) {
          sessionStorage.setItem(this.preferenceKey, localValue);
          return localValue;
        }
      } catch {
        // Ignore storage access errors
      }
    }
    return ApplicationLayoutWidthCON.CONSTRAINED; // Default to the current constrained width
  }

  public applyPreference(value: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(this.preferenceKey, value);
      localStorage.setItem(this.preferenceKey, value);
    } catch {
      // Ignore storage access errors
    }
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
