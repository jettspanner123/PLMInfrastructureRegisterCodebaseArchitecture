import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, SlidersHorizontal } from 'lucide-react';
import ControllBlockSharedComponent from '../../../../Shared/Components/ControllBlockSharedComponent';
import InputSharedComponent from '../../../../Shared/Components/InputSharedComponent';
import ApplicationTableHeightCON from '../../../../Constants/ApplicationTableHeightCON';
import ApplicationTableHeightUtility from '../../../../Utilities/ApplicationTableHeightUtility';

// Lives entirely on its own — unlike Theme Mode / Table Width, nothing
// outside this component needs to read the current Table Height preference
// as a prop. Every table in the app reacts purely through the `table-height-*`
// class ApplicationTableHeightUtility toggles on <html>, picked up by
// index.css. State here only has to survive this component staying mounted
// across the profile dropdown opening/closing, which it already does (the
// dropdown is always in the tree; `isOpen` only toggles its visibility).
export default function TableHeightControlStaticComponent(): React.JSX.Element {
  const [mode, setMode] = useState<string>(() => ApplicationTableHeightUtility.current.getSavedMode());
  const [customHeightPx, setCustomHeightPx] = useState<number>(() => {
    const saved = ApplicationTableHeightUtility.current.getSavedCustomHeightPx();
    return saved ?? Math.round(window.innerHeight - ApplicationTableHeightCON.RESERVED_VERTICAL_SPACE_PX);
  });
  const [minCustomHeightPx, setMinCustomHeightPx] = useState<number>(() =>
    Math.round(window.innerHeight - ApplicationTableHeightCON.RESERVED_VERTICAL_SPACE_PX)
  );

  // The floor for "Custom" is "whatever height Limited would give you right
  // now" — which is viewport-relative, so it has to be recomputed live
  // rather than hardcoded.
  useEffect(() => {
    const handleResize = (): void => {
      setMinCustomHeightPx(Math.round(window.innerHeight - ApplicationTableHeightCON.RESERVED_VERTICAL_SPACE_PX));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChangeMode = (nextMode: string): void => {
    setMode(nextMode);
    ApplicationTableHeightUtility.current.applyMode(nextMode);

    if (nextMode === ApplicationTableHeightCON.CUSTOM) {
      const clamped = Math.max(customHeightPx, minCustomHeightPx);
      setCustomHeightPx(clamped);
      ApplicationTableHeightUtility.current.applyCustomHeightPx(clamped);
    }
  };

  const handleChangeCustomHeightPx = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = Number(event.target.value);
    if (!Number.isFinite(raw)) return;

    const clamped = Math.max(raw, minCustomHeightPx);
    setCustomHeightPx(clamped);
    ApplicationTableHeightUtility.current.applyCustomHeightPx(clamped);
  };

  return (
    <ControllBlockSharedComponent
      label="Table Height"
      layoutId="tableHeightControlPill"
      value={mode}
      onChange={handleChangeMode}
      animatedTransition={false}
      options={[
        { value: ApplicationTableHeightCON.EXTENDED, label: 'Extended', icon: <Maximize2 className="w-3.5 h-3.5" /> },
        { value: ApplicationTableHeightCON.LIMITED, label: 'Limited', icon: <Minimize2 className="w-3.5 h-3.5" /> },
        {
          value: ApplicationTableHeightCON.CUSTOM,
          label: 'Custom',
          icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
        },
      ]}
    >
      {mode === ApplicationTableHeightCON.CUSTOM && (
        <div className="flex items-center gap-2 pt-1">
          <InputSharedComponent
            type="number"
            value={customHeightPx}
            min={minCustomHeightPx}
            onChange={handleChangeCustomHeightPx}
            className="h-8 text-xs"
          />
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0">px</span>
        </div>
      )}
    </ControllBlockSharedComponent>
  );
}
