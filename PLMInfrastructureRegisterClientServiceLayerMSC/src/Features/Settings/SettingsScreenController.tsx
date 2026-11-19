import React from 'react';
import { Outlet } from '@tanstack/react-router';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';

// Just this screen's own page content now - the sidebar itself lives in
// NavigationController's dedicated slot (see ApplicationRouter.tsx's
// RootLayout), sitting flush against the real viewport edge rather than
// nested in here, so it stays sticky/full-height independently of whatever
// this content area does.
export default function SettingsScreenController(): React.JSX.Element {
  // Prefetch as soon as the user lands on /settings (either tab), so by the
  // time they reach Subscriptions and open "Add Subscription" the list is
  // already cached - mirrors RootLayout's own prefetch-via-hook pattern.
  TanstackQueryClientService.current.subscriptions.useAvailableAzureSubscriptionsQuery();

  return <Outlet />;
}
