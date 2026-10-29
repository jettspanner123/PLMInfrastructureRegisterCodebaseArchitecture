import React, { useMemo, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';

export interface CustomTimePickerSharedComponentProps {
  value?: string; // 'HH:mm'
  onChange: (time: string) => void;
  className?: string;
  showPresets?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));
// 60 minutes from 00 through 59 (every single minute)
const MINUTES = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));

export default function CustomTimePickerSharedComponent({
  value = '12:00',
  onChange,
  className = '',
}: CustomTimePickerSharedComponentProps): React.JSX.Element {
  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!value || !value.includes(':')) {
      return ['12', '00'];
    }
    const [h, m] = value.split(':');
    return [h.padStart(2, '0'), m.padStart(2, '0')];
  }, [value]);

  const selectedHourRef = useRef<HTMLButtonElement | null>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll selected hour and minute into view when opened or selection changes
  useEffect(() => {
    if (selectedHourRef.current) {
      selectedHourRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    if (selectedMinuteRef.current) {
      selectedMinuteRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedHour, selectedMinute]);

  const handleSelectHour = (hour: string): void => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(8);
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleSelectMinute = (minute: string): void => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(8);
    onChange(`${selectedHour}:${minute}`);
  };

  return (
    <div className={`flex flex-col select-none p-3 ${className}`}>
      {/* Time Header with Clock Icon */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-100">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Select Time</span>
        </div>
      </div>

      {/* Dual Column Picker: Hours and Minutes */}
      <div className="grid grid-cols-2 gap-2 border border-slate-200/80 dark:border-zinc-800 rounded-lg p-1.5 bg-slate-50/50 dark:bg-zinc-900/30">
        {/* Hours Column */}
        <div className="flex flex-col">
          <div className="text-[10px] font-mono font-medium text-slate-400 dark:text-zinc-500 text-center pb-1 border-b border-slate-200/60 dark:border-zinc-800/60 mb-1">
            Hour
          </div>
          <div className="h-48 overflow-y-auto pr-1 flex flex-col gap-0.5 scrollbar-thin">
            {HOURS.map((h) => {
              const isSelected = selectedHour === h;
              return (
                <button
                  key={h}
                  ref={isSelected ? selectedHourRef : undefined}
                  type="button"
                  onClick={() => handleSelectHour(h)}
                  className={`w-full py-1 text-xs font-mono rounded transition-colors text-center cursor-pointer ${
                    isSelected
                      ? '!bg-[#0C2086] text-white font-bold shadow-xs'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minutes Column */}
        <div className="flex flex-col">
          <div className="text-[10px] font-mono font-medium text-slate-400 dark:text-zinc-500 text-center pb-1 border-b border-slate-200/60 dark:border-zinc-800/60 mb-1">
            Minute
          </div>
          <div className="h-48 overflow-y-auto pr-1 flex flex-col gap-0.5 scrollbar-thin">
            {MINUTES.map((m) => {
              const isSelected = selectedMinute === m;
              return (
                <button
                  key={m}
                  ref={isSelected ? selectedMinuteRef : undefined}
                  type="button"
                  onClick={() => handleSelectMinute(m)}
                  className={`w-full py-1 text-xs font-mono rounded transition-colors text-center cursor-pointer ${
                    isSelected
                      ? '!bg-[#0C2086] text-white font-bold shadow-xs'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
