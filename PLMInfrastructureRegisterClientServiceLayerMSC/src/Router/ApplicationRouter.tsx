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
import ApplicationGradientUtility from '../Utilities/ApplicationGradientUtility';
import NavigationController from '../Features/Navigation/NavigationController';
import InfrastructureRegisterScreenRoute from '../Routes/InfrastructureRegisterScreenRoute';

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

  const [gradientsEnabled, setGradientsEnabled] = useState<boolean>(() => {
    const saved = ApplicationGradientUtility.current.getSavedPreference();
    ApplicationGradientUtility.current.applyPreference(saved);
    return saved;
  });

  useEffect(() => {
    ApplicationGradientUtility.current.applyPreference(gradientsEnabled);
  }, [gradientsEnabled]);

  const handleToggleGradients = (): void => {
    const next = ApplicationGradientUtility.current.togglePreference(gradientsEnabled);
    setGradientsEnabled(next);
  };

  const handleNavigateHome = (): void => {
    navigate({ to: ApplicationRouteCON.ROOT });
  };

  return (
    <NavigationController
      currentTheme={currentTheme}
      onToggleTheme={handleToggleTheme}
      gradientsEnabled={gradientsEnabled}
      onToggleGradients={handleToggleGradients}
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
// 3. Router Tree
// ==========================================
const routeTree = rootRoute.addChildren([infrastructureRegisterRoute]);

export const applicationRouter = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof applicationRouter;
  }
}

export default function ApplicationRouter(): React.JSX.Element {
  return <RouterProvider router={applicationRouter} />;
}
