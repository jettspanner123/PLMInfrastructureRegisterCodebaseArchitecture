import { useEffect, useState } from 'react';
import { ServerOff } from 'lucide-react';
import ApplicationThemeCON from './Constants/ApplicationThemeCON';
import ApplicationThemeUtility from './Utilities/ApplicationThemeUtility';
import ButtonSharedComponent from './Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from './Shared/Components/PrimaryActionButtonSharedComponent';
import BadgeSharedComponent from './Shared/Components/BadgeSharedComponent';
import EmptyStateSharedComponent from './Shared/Components/EmptyStateSharedComponent';
import ThemeToggleSharedComponent from './Shared/Components/ThemeToggleSharedComponent';
import AnimatedThemeToggleSharedComponent from './Shared/Components/AnimatedThemeToggleSharedComponent';
import InputSharedComponent from './Shared/Components/InputSharedComponent';

function App(): React.JSX.Element {
  const [theme, setTheme] = useState<string>(ApplicationThemeCON.DARK);

  useEffect(() => {
    const savedTheme = ApplicationThemeUtility.current.getSavedTheme();
    setTheme(savedTheme);
    ApplicationThemeUtility.current.applyTheme(savedTheme);
  }, []);

  const handleToggle = () => {
    setTheme((current) => ApplicationThemeUtility.current.toggleTheme(current));
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] p-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="font-serif-headline text-2xl font-bold">Shared Component Verification</h1>
        <ThemeToggleSharedComponent currentTheme={theme} onToggle={handleToggle} />
        <AnimatedThemeToggleSharedComponent currentTheme={theme} onToggleTheme={handleToggle} />
      </div>

      <div className="flex items-center gap-3">
        <ButtonSharedComponent variant="primary">Primary</ButtonSharedComponent>
        <ButtonSharedComponent variant="outline">Outline</ButtonSharedComponent>
        <ButtonSharedComponent variant="danger">Danger</ButtonSharedComponent>
        <PrimaryActionButtonSharedComponent label="Add Resource" />
      </div>

      <div className="flex items-center gap-3">
        <BadgeSharedComponent variant="success" showDot>Running</BadgeSharedComponent>
        <BadgeSharedComponent variant="neutral">Stopped</BadgeSharedComponent>
        <BadgeSharedComponent variant="danger">Decommissioned</BadgeSharedComponent>
      </div>

      <InputSharedComponent label="Hostname" placeholder="AIASNLAS0008" />

      <EmptyStateSharedComponent
        icon={<ServerOff className="w-6 h-6" />}
        title="No Resources yet"
        description="Sync hasn't run yet, so nothing has been discovered."
      />
    </div>
  );
}

export default App;
