import ApplicationThemeCON from '../Constants/ApplicationThemeCON';
import ApplicationUserPreferenceKeyCON from '../Constants/ApplicationUserPreferenceKeyCON';
import ApplicationUserPreferenceUtility from './ApplicationUserPreferenceUtility';

export default class ApplicationThemeUtility {
  public static current: ApplicationThemeUtility = new ApplicationThemeUtility();

  public getSavedTheme(): string {
    const saved = ApplicationUserPreferenceUtility.current.getPreference(
      ApplicationUserPreferenceKeyCON.THEME_PREFERENCE
    );
    if (saved === ApplicationThemeCON.DARK || saved === ApplicationThemeCON.LIGHT) {
      return saved;
    }
    return ApplicationThemeCON.DARK; // Default to Dark Mode
  }

  public applyTheme(theme: string): void {
    ApplicationUserPreferenceUtility.current.setPreference(
      ApplicationUserPreferenceKeyCON.THEME_PREFERENCE,
      theme
    );
    if (typeof window === 'undefined') return;
    if (theme === ApplicationThemeCON.DARK) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  public toggleTheme(currentTheme: string): string {
    const nextTheme =
      currentTheme === ApplicationThemeCON.LIGHT
        ? ApplicationThemeCON.DARK
        : ApplicationThemeCON.LIGHT;
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  public executeAnimatedThemeToggle(
    targetElement: HTMLElement | null,
    toggleCallback: () => void,
    duration: number = 450
  ): void {
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      !(document as any).startViewTransition
    ) {
      toggleCallback();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = viewportWidth / 2;
    let y = viewportHeight / 2;

    if (targetElement) {
      const { top, left, width, height } = targetElement.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const toX = (px: number) => `${(px / viewportWidth) * 100}%`;
    const toY = (py: number) => `${(py / viewportHeight) * 100}%`;
    const toRadius = (r: number) =>
      `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;
    const point = `${toX(x)} ${toY(y)}`;

    const clipPath = [
      `circle(0% at ${point})`,
      `circle(${toRadius(maxRadius)} at ${point})`,
    ];

    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);
    root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0]);

    const cleanup = () => {
      clearTimeout(safetyTimer);
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
    };

    // Failsafe: if the View Transition never finishes (e.g. navigation mid-animation),
    // force cleanup so the page doesn't stay clipped to circle(0%).
    const safetyTimer = setTimeout(cleanup, duration + 200);

    const transition = (document as any).startViewTransition(() => {
      toggleCallback();
    });

    if (transition?.finished?.finally) {
      transition.finished.finally(cleanup).catch(() => {});
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready
        .then(() => {
          document.documentElement.animate(
            { clipPath },
            {
              duration,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'forwards',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {});
    }
  }
}
