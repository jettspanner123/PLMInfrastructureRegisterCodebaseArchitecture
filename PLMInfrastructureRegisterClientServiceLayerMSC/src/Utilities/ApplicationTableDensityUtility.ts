import ApplicationTableDensityCON from '../Constants/ApplicationTableDensityCON';
import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

// Mirrors ApplicationTableHeightUtility's pattern: a class on <html> that
// index.css reacts to (`.data-table-header-cell` / `.data-table-scroll-area
// td` padding rules), persisted through ApplicationUserPreferenceUtility.
// Every table in the app reacts through CSS alone.
export default class ApplicationTableDensityUtility {
  public static current: ApplicationTableDensityUtility = new ApplicationTableDensityUtility();

  public getSavedDensity(): string {
    const saved = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.TABLE_DENSITY
    );
    if (saved === ApplicationTableDensityCON.STANDARD || saved === ApplicationTableDensityCON.COMPACT) {
      return saved;
    }
    return ApplicationTableDensityCON.STANDARD; // Default: today's existing cell padding, unchanged
  }

  public applyDensity(density: string): void {
    ApplicationUserPreferenceUtility.current.setPreference(ApplicationUserPreferenceKeyCON.TABLE_DENSITY, density);

    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle(
      'table-density-compact',
      density === ApplicationTableDensityCON.COMPACT
    );
  }
}
