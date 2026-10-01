import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sun, Moon, LogOut, Sparkles, Square } from 'lucide-react';
import ApplicationThemeCON from '../../../../Constants/ApplicationThemeCON';
import ApplicationHapticsUtility from '../../../../Utilities/ApplicationHapticsUtility';
import ConfirmationModalSharedComponent from '../../../../Shared/Components/ConfirmationModalSharedComponent';
import ControllBlockSharedComponent from '../../../../Shared/Components/ControllBlockSharedComponent';
import NavigationCON from '../../Constants/NavigationCON';

export interface ProfileDropdownStaticComponentProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onToggleTheme: () => void;
  gradientsEnabled: boolean;
  onToggleGradients: () => void;
}

export default function ProfileDropdownStaticComponent({
  isOpen,
  onClose,
  currentTheme,
  onToggleTheme,
  gradientsEnabled,
  onToggleGradients,
}: ProfileDropdownStaticComponentProps): React.JSX.Element {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose]);

  const handleInitiateSignOut = () => {
    onClose();
    setIsSignOutModalOpen(true);
  };

  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
  };

  return (
    <React.Fragment>
      <AnimatePresence>
        {isOpen && (
          <React.Fragment>
            {/* Full Screen Transparent Backdrop Overlay */}
            <div
              onClick={onClose}
              className="fixed inset-0 z-40 bg-transparent cursor-default pointer-events-auto"
            />

            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 top-20 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80 z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 text-xs select-none space-y-4"
            >
              {/* 1. Header: User Identity */}
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
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
                  label="Gradient Backgrounds"
                  layoutId="gradientBackgroundsControlPill"
                  value={gradientsEnabled ? 'on' : 'off'}
                  onChange={() => onToggleGradients()}
                  options={[
                    { value: 'on', label: 'On', icon: <Sparkles className="w-3.5 h-3.5" /> },
                    { value: 'off', label: 'Off', icon: <Square className="w-3.5 h-3.5" /> },
                  ]}
                />
              </div>

              {/* 3. Footer: Sign Out */}
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
          </React.Fragment>
        )}
      </AnimatePresence>

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
