import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useRouterState } from '@tanstack/react-router';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import SettingsCON from '../Constants/SettingsCON';

// A 1:1 visual/structural copy of AssetSphere's own
// SidebarStaticComponent.tsx (collapse toggle, motion width animation, the
// left-edge active-tab indicator bar) - scoped to just this one screen's own
// internal layout, not an app-wide sidebar. AssetSphere's version also pulls
// in permission-gating and a pending-requests badge count; neither applies
// here (this app has no auth system and only 2 flat items, no categories),
// so those are the only things dropped from the original.
export default function SettingsSidebarStaticComponent(): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 68 : 220 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      // Sticky top-16/h-[calc(100dvh-64px)] matches AssetSphere's own
      // sidebar verbatim - both apps' headers are the same 64px (h-16)
      // tall, which is what that offset/height math is anchored to.
      className="shrink-0 border-r border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-black/60 hidden md:flex flex-col sticky top-16 h-[calc(100dvh-64px)] overflow-y-auto p-3 select-none z-20 overflow-x-hidden"
    >
      <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
        {!isCollapsed && (
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase font-mono tracking-wider">
            Settings
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((previous) => !previous)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-1 flex-1">
        {SettingsCON.SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.key}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
              } rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer relative group ${
                isActive
                  ? 'bg-slate-200/80 dark:bg-zinc-800/90 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {isActive && (
                <motion.div
                  layoutId="settingsSidebarActiveIndicator"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-1 bottom-1 w-1 bg-zinc-900 dark:bg-white rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}
