import ApplicationTableHeightCON from '../Constants/ApplicationTableHeightCON';
import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

// Mirrors ApplicationLayoutWidthUtility's pattern: classes on <html> that CSS
// reacts to (see index.css's `.data-table-scroll-area` / `.data-table-card` /
// `.data-table-header-cell` rules), persisted through
// ApplicationUserPreferenceUtility. Every table in the app reacts through
// CSS alone — no React state needs to reach the tables themselves.
export default class ApplicationTableHeightUtility {
  public static current: ApplicationTableHeightUtility = new ApplicationTableHeightUtility();

  public getSavedMode(): string {
    const saved = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.TABLE_HEIGHT_MODE
    );
    if (
      saved === ApplicationTableHeightCON.EXTENDED ||
      saved === ApplicationTableHeightCON.LIMITED ||
      saved === ApplicationTableHeightCON.CUSTOM
    ) {
      return saved;
    }
    return ApplicationTableHeightCON.EXTENDED; // Default: full width, the page scrolls horizontally
  }

  public getSavedCustomHeightPx(): number | null {
    const saved = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.TABLE_HEIGHT_CUSTOM_PX
    );
    const parsed = saved !== null ? Number(saved) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }

  public applyMode(mode: string): void {
    ApplicationUserPreferenceUtility.current.setPreference(ApplicationUserPreferenceKeyCON.TABLE_HEIGHT_MODE, mode);

    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('table-height-extended', mode === ApplicationTableHeightCON.EXTENDED);
    root.classList.toggle('table-height-limited', mode === ApplicationTableHeightCON.LIMITED);
    root.classList.toggle('table-height-custom', mode === ApplicationTableHeightCON.CUSTOM);
  }

  public applyCustomHeightPx(customHeightPx: number): void {
    ApplicationUserPreferenceUtility.current.setPreference(
      ApplicationUserPreferenceKeyCON.TABLE_HEIGHT_CUSTOM_PX,
      String(customHeightPx)
    );
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty('--table-custom-height', `${customHeightPx}px`);
  }
}
