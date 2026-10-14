import React from 'react';
import { Outlet } from '@tanstack/react-router';

// Just this screen's own page content now - the sidebar itself lives in
// NavigationController's dedicated slot (see ApplicationRouter.tsx's
// RootLayout), sitting flush against the real viewport edge rather than
// nested in here, so it stays sticky/full-height independently of whatever
// this content area does.
export default function SettingsScreenController(): React.JSX.Element {
  return <Outlet />;
}
