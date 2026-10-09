import React from 'react';
import { Outlet } from '@tanstack/react-router';

// Just this screen's own page content now - the sidebar itself lives in
// NavigationController's dedicated slot (see ApplicationRouter.tsx's
// RootLayout), sitting flush against the real viewport edge rather than
// nested in here, so it stays sticky/full-height independently of whatever
// this content area does.
export default function SettingsScreenController(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div className="pb-6 border-b border-slate-200 dark:border-zinc-800">
        <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">App-wide preferences and administration.</p>
      </div>

      <Outlet />
    </div>
  );
}
