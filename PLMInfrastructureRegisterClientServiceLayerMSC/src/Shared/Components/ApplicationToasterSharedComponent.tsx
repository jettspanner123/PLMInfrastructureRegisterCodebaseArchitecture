import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import ApplicationThemeCON from '../../Constants/ApplicationThemeCON';
import ApplicationThemeUtility from '../../Utilities/ApplicationThemeUtility';

// 1:1 with AssetSphere's own ApplicationToasterSharedComponent.tsx (theme
// sync, responsive position, icon set, Sonner CSS vars in index.css) - see
// the sidebar-pattern-preference memory for why: mirror the established
// We.PLM pattern for a given piece of UI rather than inventing a new one.
export default function ApplicationToasterSharedComponent(): React.JSX.Element {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return ApplicationThemeUtility.current.getSavedTheme() === ApplicationThemeCON.LIGHT ? 'light' : 'dark';
  });

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const handleSync = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    handleSync();

    const observer = new MutationObserver(handleSync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Toaster
      theme={currentTheme}
      position={isMobile ? 'bottom-center' : 'bottom-right'}
      closeButton={true}
      richColors={true}
      expand={true}
      duration={4500}
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
        error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
        warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
        info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
        loading: <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />,
      }}
    />
  );
}
