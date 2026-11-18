import React, { useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import SegmentedControlSharedComponent from './SegmentedControlSharedComponent';
import ApplicationThemeCON from '../../Constants/ApplicationThemeCON';
import ApplicationThemeUtility from '../../Utilities/ApplicationThemeUtility';

export interface NavigationThemeToggleSharedComponentProps {
  currentTheme: string;
  onToggleTheme: () => void;
}

// Icon-only twin of the profile card's old Theme Mode row, living directly
// in the navbar. Keeps the same circle-wipe transition by capturing the
// actually-clicked button (same pattern as ControllBlockSharedComponent) and
// handing it to ApplicationThemeUtility as the animation's origin point.
export default function NavigationThemeToggleSharedComponent({
  currentTheme,
  onToggleTheme,
}: NavigationThemeToggleSharedComponentProps): React.JSX.Element {
  const clickedElementRef = useRef<HTMLElement | null>(null);

  const handleCaptureClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    clickedElementRef.current = (event.target as HTMLElement).closest('button');
  };

  const handleChange = (nextTheme: string): void => {
    if (nextTheme === currentTheme) return;
    ApplicationThemeUtility.current.executeAnimatedThemeToggle(clickedElementRef.current, onToggleTheme);
  };

  return (
    <div onClickCapture={handleCaptureClick}>
      <SegmentedControlSharedComponent
        value={currentTheme}
        onChange={handleChange}
        layoutId="navbarThemeModeControlPill"
        iconOnly
        options={[
          {
            value: ApplicationThemeCON.LIGHT,
            label: 'Light Mode',
            ariaLabel: 'Switch to light mode',
            icon: <Sun className="w-3.5 h-3.5" />,
          },
          {
            value: ApplicationThemeCON.DARK,
            label: 'Dark Mode',
            ariaLabel: 'Switch to dark mode',
            icon: <Moon className="w-3.5 h-3.5" />,
          },
        ]}
      />
    </div>
  );
}
