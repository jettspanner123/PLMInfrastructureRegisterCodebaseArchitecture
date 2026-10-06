import React, { useEffect, useState } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from '@tanstack/react-router';
import ApplicationRouteCON from '../Constants/ApplicationRouteCON';
import ApplicationThemeUtility from '../Utilities/ApplicationThemeUtility';
import ApplicationLayoutWidthUtility from '../Utilities/ApplicationLayoutWidthUtility';
import ApplicationTableHeightUtility from '../Utilities/ApplicationTableHeightUtility';
import ApplicationTableDensityUtility from '../Utilities/ApplicationTableDensityUtility';
import NavigationController from '../Features/Navigation/NavigationController';
import InfrastructureRegisterScreenRoute from '../Routes/InfrastructureRegisterScreenRoute';
import ConfigureSubscriptionsScreenRoute from '../Routes/ConfigureSubscriptionsScreenRoute';
import SplashScreenController from '../Features/SplashScreen/SplashScreenController';

// ==========================================
// 1. Root Route & Theme Shell
// ==========================================
const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const saved = ApplicationThemeUtility.current.getSavedTheme();
    ApplicationThemeUtility.current.applyTheme(saved);
    return saved;
  });

  useEffect(() => {
    ApplicationThemeUtility.current.applyTheme(currentTheme);
  }, [currentTheme]);

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
// 3. Configure Subscriptions Route
// ==========================================
const configureSubscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ApplicationRouteCON.CONFIGURE_SUBSCRIPTIONS,
  component: ConfigureSubscriptionsScreenRoute,
});

// ==========================================
// 4. Router Tree
// ==========================================
const routeTree = rootRoute.addChildren([infrastructureRegisterRoute, configureSubscriptionsRoute]);

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
