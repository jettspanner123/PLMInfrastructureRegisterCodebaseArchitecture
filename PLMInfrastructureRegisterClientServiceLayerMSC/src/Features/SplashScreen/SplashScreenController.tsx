import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreenLogoStaticComponent from './Components/static/SplashScreenLogoStaticComponent';
import SplashScreenCON from './Constants/SplashScreenCON';

export interface SplashScreenControllerProps {
  onReady: () => void;
}

export default function SplashScreenController({
  onReady,
}: SplashScreenControllerProps): React.JSX.Element {
  // No real data query exists yet for the Resources table (it's still static
  // placeholder content) — once it fetches via TanStack Query, pre-fetch it
  // here and replace this with its settled state (loaded or errored), same
  // pattern SignForge uses for its own dashboard/config queries.
  const allQueriesSettled = true;

  const [isReadyToDismiss, setIsReadyToDismiss] = useState(false);

  useEffect(() => {
    // When all queries settle (loaded or errored), wait out the minimum display duration,
    // then signal the animation to dismiss at the end of its CURRENT loop rather than
    // cutting it off mid-playback.
    if (allQueriesSettled) {
      const timer = setTimeout(() => {
        setIsReadyToDismiss(true);
      }, SplashScreenCON.MINIMUM_DISPLAY_DURATION_MS);

      return () => clearTimeout(timer);
    }
  }, [allQueriesSettled]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`fixed inset-0 z-50 flex items-center justify-center min-h-screen w-screen overflow-hidden ${SplashScreenCON.BG_LIGHT} ${SplashScreenCON.BG_DARK}`}
      >
        <SplashScreenLogoStaticComponent
          isReadyToDismiss={isReadyToDismiss}
          onLoopComplete={onReady}
        />
      </motion.div>
    </AnimatePresence>
  );
}
