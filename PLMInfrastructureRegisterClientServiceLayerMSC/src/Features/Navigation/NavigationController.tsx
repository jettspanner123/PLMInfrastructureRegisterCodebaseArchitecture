import React from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import ProfileSettingsSharedComponent from '../../Shared/Components/ProfileSettingsSharedComponent';
import SegmentedControlSharedComponent from '../../Shared/Components/SegmentedControlSharedComponent';
import NavigationCON from './Constants/NavigationCON';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import weplmLogo from '../../Assets/weplm.jpeg';

export interface NavigationControllerProps {
  currentTheme: string;
  onToggleTheme: () => void;
  layoutWidth: string;
  onToggleLayoutWidth: () => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
  // Optional, screen-agnostic slot for a route that wants a left sidebar
  // sitting flush against the real viewport edge (sticky below the header,
  // full remaining height) - RootLayout decides which routes pass one, not
  // this component. Undefined for every route that doesn't, which renders
  // identically to before this slot existed.
  sidebar?: React.ReactNode;
}

export default function NavigationController({
  currentTheme,
  onToggleTheme,
  layoutWidth,
  onToggleLayoutWidth,
  onNavigateHome,
  children,
  sidebar,
}: NavigationControllerProps): React.JSX.Element {
  // Derived from the actual route, not independent state — otherwise
  // navigating elsewhere (e.g. the profile dropdown's Configure
  // Subscriptions link) would leave this pill stuck showing whatever it
  // last was, since nothing outside this component ever told it the route
  // changed. Matches neither PRIMARY_NAV_ITEMS option (so neither highlights)
  // when the current route isn't one of them.
  const navigate = useNavigate();
  const location = useLocation();
  const currentView =
    location.pathname === ApplicationRouteCON.ROOT
      ? 'infrastructure-register'
      : location.pathname === ApplicationRouteCON.ENVIRONMENT_OVERVIEW
        ? 'environment-overview'
        : '';

  return (
    <div className="min-h-screen bg-(--color-canvas) text-(--color-ink) flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-black sm:bg-white/90 sm:dark:bg-black/90 sm:backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0">
            <img
              src={weplmLogo}
              alt="We.PLM Logo"
              onClick={onNavigateHome}
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-sm object-cover shrink-0 shadow-sm border border-slate-200/80 dark:border-zinc-800 cursor-pointer"
            />
            <div className="flex flex-col justify-center cursor-pointer" onClick={onNavigateHome}>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white font-serif-headline leading-tight">
                {NavigationCON.BRAND_TITLE}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 leading-none">
                {NavigationCON.BRAND_SUBTITLE}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Section Navigation Capsule (Infrastructure Register / Environment Overview) */}
            <SegmentedControlSharedComponent
              value={currentView}
              onChange={(next) => {
                if (next === 'infrastructure-register') {
                  onNavigateHome();
                } else if (next === 'environment-overview') {
                  navigate({ to: ApplicationRouteCON.ENVIRONMENT_OVERVIEW });
                }
              }}
              layoutId="activeTopNavPill"
              desktopOnly
              activeTextClassName="text-[#0C2086] dark:text-zinc-100 font-semibold"
              inactiveTextClassName="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              options={NavigationCON.PRIMARY_NAV_ITEMS.map((item) => ({
                value: item.id,
                label: item.label,
                icon: <item.icon className="w-3.5 h-3.5" />,
                disabled: item.disabled,
              }))}
            />

            <ProfileSettingsSharedComponent
              currentTheme={currentTheme}
              onToggleTheme={onToggleTheme}
              layoutWidth={layoutWidth}
              onToggleLayoutWidth={onToggleLayoutWidth}
            />
          </div>
        </div>
      </header>
      {/* A sidebar (when passed) sits here as <main>'s sibling, outside its
          max-width - that's what lets it sit flush against the real
          viewport edge instead of inside the centered content column, same
          as AssetSphere's own header+sidebar+main shell. */}
      <div className="flex-1 flex w-full items-start">
        {sidebar}
        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
