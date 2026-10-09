import React, { useEffect, useState } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation,
} from '@tanstack/react-router';
import ApplicationRouteCON from '../Constants/ApplicationRouteCON';
import ApplicationThemeUtility from '../Utilities/ApplicationThemeUtility';
import ApplicationLayoutWidthUtility from '../Utilities/ApplicationLayoutWidthUtility';
import ApplicationTableHeightUtility from '../Utilities/ApplicationTableHeightUtility';
import ApplicationTableDensityUtility from '../Utilities/ApplicationTableDensityUtility';
import NavigationController from '../Features/Navigation/NavigationController';
import InfrastructureRegisterScreenRoute from '../Routes/InfrastructureRegisterScreenRoute';
import SettingsScreenRoute from '../Routes/SettingsScreenRoute';
import EnvironmentOverviewScreenRoute from '../Routes/EnvironmentOverviewScreenRoute';
import SplashScreenController from '../Features/SplashScreen/SplashScreenController';
import SubscriptionsScreenController from '../Features/Subscriptions/SubscriptionsScreenController';
import SettingsColorEditingScreenController from '../Features/Settings/SettingsColorEditingScreenController';
import SettingsSidebarStaticComponent from '../Features/Settings/Components/SettingsSidebarStaticComponent';

// ==========================================
// 1. Root Route & Theme Shell
// ==========================================
const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  // Only Settings gets a sidebar today - NavigationController's slot is
  // generic (any route could pass one later), but deciding WHICH routes do
  // is kept here rather than inside NavigationController itself, so that
  // component stays agnostic about any particular screen.
  const isSettingsRoute = location.pathname.startsWith(ApplicationRouteCON.SETTINGS);

  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const saved = ApplicationThemeUtility.current.getSavedTheme();
    ApplicationThemeUtility.current.applyTheme(saved);
    return saved;
  });

  useEffect(() => {
    ApplicationThemeUtility.current.applyTheme(currentTheme);
  }, [currentTheme]);

  // App-wide, not scoped to any one screen - the only context menu anywhere
  // in this app should ever be ContextMenuSharedComponent's own (currently
  // just Infrastructure Register's cell formatting), never the browser's
  // native one. Matches AssetSphere's own identical app-wide suppression.
  useEffect(() => {
    const disableNativeContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('contextmenu', disableNativeContextMenu);
    return () => window.removeEventListener('contextmenu', disableNativeContextMenu);
  }, []);

  const handleToggleTheme = (): void => {
    const next = ApplicationThemeUtility.current.toggleTheme(currentTheme);
    setCurrentTheme(next);
  };

  const [layoutWidth, setLayoutWidth] = useState<string>(() => {
    const saved = ApplicationLayoutWidthUtility.current.getSavedPreference();
    ApplicationLayoutWidthUtility.current.applyPreference(saved);
    return saved;
  });

  useEffect(() => {
    ApplicationLayoutWidthUtility.current.applyPreference(layoutWidth);
  }, [layoutWidth]);

  const handleToggleLayoutWidth = (): void => {
    const next = ApplicationLayoutWidthUtility.current.togglePreference(layoutWidth);
    setLayoutWidth(next);
  };

  // Table Height's own control lives entirely inside the profile dropdown
  // (nothing else needs its value as a prop), but that control only mounts
  // once the dropdown is actually opened — so the saved mode still has to be
  // applied to <html> here, unconditionally, the same way Theme and Layout
  // Width bootstrap themselves above.
  useState(() => {
    ApplicationTableHeightUtility.current.applyMode(ApplicationTableHeightUtility.current.getSavedMode());
    const savedCustomHeightPx = ApplicationTableHeightUtility.current.getSavedCustomHeightPx();
    if (savedCustomHeightPx !== null) {
      ApplicationTableHeightUtility.current.applyCustomHeightPx(savedCustomHeightPx);
    }
  });

  // Same reasoning as Table Height just above: Table Density's control also
  // lives entirely inside the profile dropdown, so its saved value needs
  // the same independent bootstrap here.
  useState(() => {
    ApplicationTableDensityUtility.current.applyDensity(ApplicationTableDensityUtility.current.getSavedDensity());
  });

  const handleNavigateHome = (): void => {
    navigate({ to: ApplicationRouteCON.ROOT });
  };

  return (
    <NavigationController
      currentTheme={currentTheme}
      onToggleTheme={handleToggleTheme}
      layoutWidth={layoutWidth}
      onToggleLayoutWidth={handleToggleLayoutWidth}
      onNavigateHome={handleNavigateHome}
      sidebar={isSettingsRoute ? <SettingsSidebarStaticComponent /> : undefined}
    >
      <Outlet />
    </NavigationController>
  );
}

// ==========================================
// 2. Infrastructure Register Route
// ==========================================
const infrastructureRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ApplicationRouteCON.ROOT,
  component: InfrastructureRegisterScreenRoute,
});

// ==========================================
// 3. Settings Route (sidebar shell + 2 URL-backed tabs)
// ==========================================
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ApplicationRouteCON.SETTINGS,
  component: SettingsScreenRoute,
});

// Bare /settings (no tab) lands on Subscriptions - replace (not push) so the
// redirect itself never becomes its own back-button stop.
function SettingsIndexRedirectComponent(): null {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: ApplicationRouteCON.SETTINGS_SUBSCRIPTIONS, replace: true });
  }, [navigate]);
  return null;
}

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  component: SettingsIndexRedirectComponent,
});

const settingsSubscriptionsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'subscriptions',
  component: SubscriptionsScreenController,
});

const settingsEditingRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'editing',
  component: SettingsColorEditingScreenController,
});

// ==========================================
// 4. Environment Overview Route
// ==========================================
const environmentOverviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ApplicationRouteCON.ENVIRONMENT_OVERVIEW,
  component: EnvironmentOverviewScreenRoute,
});

// ==========================================
// 5. Router Tree
// ==========================================
const routeTree = rootRoute.addChildren([
  infrastructureRegisterRoute,
  settingsRoute.addChildren([settingsIndexRoute, settingsSubscriptionsRoute, settingsEditingRoute]),
  environmentOverviewRoute,
]);

export const applicationRouter = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof applicationRouter;
  }
}

export default function ApplicationRouter(): React.JSX.Element {
  // Applied here, before the splash-vs-router branch below, so the splash
  // screen itself respects the saved theme too — RootLayout only mounts
  // (and only applies/exposes the toggle) once the splash screen is gone.
  useState(() => {
    const saved = ApplicationThemeUtility.current.getSavedTheme();
    ApplicationThemeUtility.current.applyTheme(saved);
  });

  const [isSplashReady, setIsSplashReady] = useState<boolean>(false);

  if (!isSplashReady) {
    return <SplashScreenController onReady={() => setIsSplashReady(true)} />;
  }

  return <RouterProvider router={applicationRouter} />;
}
