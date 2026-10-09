import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimate } from 'motion/react';
import { useNavigate } from '@tanstack/react-router';
import { Settings, Mail, Sun, Moon, LogOut, Maximize2, Minimize2, Rows3, Rows4, X } from 'lucide-react';
import ApplicationThemeCON from '../../Constants/ApplicationThemeCON';
import ApplicationLayoutWidthCON from '../../Constants/ApplicationLayoutWidthCON';
import ApplicationTableDensityCON from '../../Constants/ApplicationTableDensityCON';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';
import ApplicationTableDensityUtility from '../../Utilities/ApplicationTableDensityUtility';
import NavigationCON from '../../Features/Navigation/Constants/NavigationCON';
import TableHeightControlStaticComponent from '../../Features/Navigation/Components/static/TableHeightControlStaticComponent';
import ConfirmationModalSharedComponent from './ConfirmationModalSharedComponent';
import ControllBlockSharedComponent from './ControllBlockSharedComponent';

export interface ProfileSettingsSharedComponentProps {
  currentTheme: string;
  onToggleTheme: () => void;
  layoutWidth: string;
  onToggleLayoutWidth: () => void;
}

interface SimpleRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Same shared-element morph recipe as ChatAssistantSharedComponent.tsx — see
// PLMInfrastructureRegisterAgentDocumentationNMSC/SHARED_ELEMENT_MORPH_ANIMATION_GUIDE.md
// for the full writeup (why the automatic layoutId projection doesn't bridge
// the portal boundary on open, and why the manual flip below is the fix).
// This component replaces the old anchored ProfileDropdownStaticComponent —
// same preferences/options, but opening now morphs the avatar trigger into a
// centered, backdrop-blurred panel instead of a small anchored dropdown. The
// trigger now lives inside this component (it has to, for the flip to
// measure it) rather than in NavigationController.tsx.
const PROFILE_SETTINGS_LAYOUT_ID = 'profile-settings-panel';
const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function ProfileSettingsSharedComponent({
  currentTheme,
  onToggleTheme,
  layoutWidth,
  onToggleLayoutWidth,
}: ProfileSettingsSharedComponentProps): React.JSX.Element {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRectRef = useRef<SimpleRect | null>(null);
  const [panelScope, animatePanel] = useAnimate();

  // Self-contained, like Table Height's own control — nothing outside this
  // panel needs Table Density's value as a prop. RootLayout still bootstraps
  // the saved value onto <html> independently on mount, since this state
  // only mounts once the panel is actually opened.
  const [tableDensity, setTableDensity] = useState<string>(() =>
    ApplicationTableDensityUtility.current.getSavedDensity()
  );

  const handleChangeTableDensity = (next: string): void => {
    setTableDensity(next);
    ApplicationTableDensityUtility.current.applyDensity(next);
  };

  // The trigger's slot in the header is stable while closed, so its rect
  // only needs refreshing on resize — not on every open.
  useEffect(() => {
    const measureTriggerRect = (): void => {
      if (!triggerButtonRef.current) return;
      const rect = triggerButtonRef.current.getBoundingClientRect();
      triggerRectRef.current = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    measureTriggerRect();
    window.addEventListener('resize', measureTriggerRect);
    return () => window.removeEventListener('resize', measureTriggerRect);
  }, []);

  // Manual flip on mount — see the guide for why this can't just be
  // automatic layoutId projection once the panel is portaled.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const panelEl = panelScope.current;
    const origin = triggerRectRef.current;
    if (!panelEl || !origin) return;

    const finalRect = panelEl.getBoundingClientRect();
    const scaleX = origin.width / finalRect.width;
    const scaleY = origin.height / finalRect.height;
    const originCenterX = origin.x + origin.width / 2;
    const originCenterY = origin.y + origin.height / 2;
    const finalCenterX = finalRect.x + finalRect.width / 2;
    const finalCenterY = finalRect.y + finalRect.height / 2;

    animatePanel(
      panelEl,
      {
        x: [originCenterX - finalCenterX, 0],
        y: [originCenterY - finalCenterY, 0],
        scaleX: [scaleX, 1],
        scaleY: [scaleY, 1],
      },
      SPRING_TRANSITION
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => panelScope.current?.focus(), 200);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setTimeout(() => triggerButtonRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = (): void => {
    setIsOpen(false);
    setTimeout(() => triggerButtonRef.current?.focus(), 0);
  };

  const handleInitiateSignOut = (): void => {
    handleClose();
    setIsSignOutModalOpen(true);
  };

  const handleNavigateToSettings = (): void => {
    handleClose();
    navigate({ to: ApplicationRouteCON.SETTINGS_SUBSCRIPTIONS });
  };

  const handleConfirmSignOut = (): void => {
    setIsSignOutModalOpen(false);
  };

  return (
    <React.Fragment>
      <AnimatePresence mode="popLayout">
        {!isOpen && (
          <motion.button
            key="profile-settings-trigger"
            ref={triggerButtonRef}
            layoutId={PROFILE_SETTINGS_LAYOUT_ID}
            exit={{ opacity: 0 }}
            transition={SPRING_TRANSITION}
            type="button"
            onClick={() => setIsOpen(true)}
            title={`${NavigationCON.PROFILE_DISPLAY_NAME} - Profile & Settings`}
            aria-haspopup="dialog"
            aria-label={`${NavigationCON.PROFILE_DISPLAY_NAME} - Profile & Settings`}
            className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl sm:rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hairline-border hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer relative flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400"
          >
            <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs sm:text-[10px] font-mono">
              {NavigationCON.PROFILE_INITIALS}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <React.Fragment>
              <motion.div
                key="profile-settings-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={handleClose}
                className="fixed inset-0 z-[60] bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
              />

              <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  key="profile-settings-panel"
                  ref={panelScope}
                  layoutId={PROFILE_SETTINGS_LAYOUT_ID}
                  layoutRoot
                  role="dialog"
                  aria-modal="true"
                  aria-label="Profile and preferences"
                  tabIndex={-1}
                  transition={SPRING_TRANSITION}
                  className="pointer-events-auto relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0c0c0e] hairline-border-strong rounded-2xl shadow-2xl p-5 text-xs space-y-4 focus:outline-none"
                >
                  {/* Floating close button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close Profile and Settings"
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white dark:bg-[#0c0c0e] shadow-md text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* 1. Header: User Identity */}
                  <div className="flex items-center gap-3 pb-3.5 pr-10 border-b border-slate-100 dark:border-zinc-800/80">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold font-serif-headline text-sm shadow-xs shrink-0">
                      {NavigationCON.PROFILE_INITIALS}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white font-serif-headline text-sm truncate leading-tight">
                        {NavigationCON.PROFILE_DISPLAY_NAME}
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5 font-mono">
                        {NavigationCON.PROFILE_DISPLAY_ROLE}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{NavigationCON.PROFILE_DISPLAY_EMAIL}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Preferences & Controls */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500 block px-1">
                      Preferences & Controls
                    </span>

                    <ControllBlockSharedComponent
                      label="Theme Mode"
                      layoutId="themeModeControlPill"
                      value={currentTheme}
                      onChange={() => onToggleTheme()}
                      options={[
                        { value: ApplicationThemeCON.LIGHT, label: 'Light Mode', icon: <Sun className="w-3.5 h-3.5" /> },
                        { value: ApplicationThemeCON.DARK, label: 'Dark Mode', icon: <Moon className="w-3.5 h-3.5" /> },
                      ]}
                    />

                    <ControllBlockSharedComponent
                      label="Table Width"
                      layoutId="layoutWidthControlPill"
                      value={layoutWidth}
                      onChange={() => onToggleLayoutWidth()}
                      animatedTransition={false}
                      options={[
                        {
                          value: ApplicationLayoutWidthCON.CONSTRAINED,
                          label: 'Current',
                          icon: <Minimize2 className="w-3.5 h-3.5" />,
                        },
                        {
                          value: ApplicationLayoutWidthCON.FULL_WIDTH,
                          label: 'Max Width',
                          icon: <Maximize2 className="w-3.5 h-3.5" />,
                        },
                      ]}
                    />

                    <TableHeightControlStaticComponent />

                    <ControllBlockSharedComponent
                      label="Table Density"
                      layoutId="tableDensityControlPill"
                      value={tableDensity}
                      onChange={handleChangeTableDensity}
                      animatedTransition={false}
                      options={[
                        {
                          value: ApplicationTableDensityCON.STANDARD,
                          label: 'Standard',
                          icon: <Rows3 className="w-3.5 h-3.5" />,
                        },
                        {
                          value: ApplicationTableDensityCON.COMPACT,
                          label: 'Compact',
                          icon: <Rows4 className="w-3.5 h-3.5" />,
                        },
                      ]}
                    />
                  </div>

                  {/* 3. Administration */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                    <button
                      type="button"
                      onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                      onClick={handleNavigateToSettings}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer font-bold text-xs"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* 4. Footer: Sign Out */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                    <button
                      type="button"
                      onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                      onClick={handleInitiateSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-bold text-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ConfirmationModalSharedComponent
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        title={NavigationCON.SIGN_OUT_TITLE}
        subtitle={NavigationCON.SIGN_OUT_SUBTITLE}
        description={NavigationCON.SIGN_OUT_DESCRIPTION}
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        maxWidth="md"
      />
    </React.Fragment>
  );
}
