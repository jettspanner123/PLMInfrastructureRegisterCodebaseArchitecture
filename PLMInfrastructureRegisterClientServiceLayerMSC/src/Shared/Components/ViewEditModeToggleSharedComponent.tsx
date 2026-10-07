import React, { useEffect, useId, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import SegmentedControlSharedComponent from './SegmentedControlSharedComponent';
import ViewEditModeCON from '../../Constants/ViewEditModeCON';

// A self-contained View/Edit mode toggle for a table page - owns its own
// state (always starts on View Mode, resets on reload; not persisted, unlike
// Table Height/Density) since each mounted instance is independent per page
// by design. Ctrl/Cmd+E toggles it from anywhere while mounted, mirroring
// ExpandableSearchSharedComponent's Ctrl/Cmd+K convention exactly - including
// the same "don't hijack focus away from an active text field" guard, which
// also happens to be what keeps this safe from macOS's native Ctrl+E
// ("move to end of line") text-field binding: that OS shortcut only fires
// while a field has focus, and this guard is what skips our own handler in
// exactly that situation, so the two never actually compete.
//
// Purely cosmetic for now - switching to Edit Mode doesn't enable editing
// anything; see ADMIN_GATED_ENVIRONMENT_OVERVIEW_ROW_DELETION_TODO.md and
// its neighbors for the kind of real behavior this is expected to grow into
// once there's an authentication system to gate it with.
export default function ViewEditModeToggleSharedComponent(): React.JSX.Element {
  const [mode, setMode] = useState<string>(ViewEditModeCON.VIEW);
  const layoutId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const isToggleShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e';
      if (!isToggleShortcut) return;

      const activeElement = document.activeElement;
      const isTypingElsewhere =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);
      if (isTypingElsewhere) return;

      event.preventDefault();
      setMode((previous) => (previous === ViewEditModeCON.VIEW ? ViewEditModeCON.EDIT : ViewEditModeCON.VIEW));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SegmentedControlSharedComponent
      value={mode}
      onChange={setMode}
      layoutId={`view-edit-mode-${layoutId}`}
      options={[
        { value: ViewEditModeCON.VIEW, label: 'View Mode', icon: <Eye className="w-3.5 h-3.5" /> },
        { value: ViewEditModeCON.EDIT, label: 'Edit Mode', icon: <Pencil className="w-3.5 h-3.5" /> },
      ]}
    />
  );
}
