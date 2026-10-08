import React, { useEffect, useId, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import SegmentedControlSharedComponent from './SegmentedControlSharedComponent';
import ViewEditModeCON from '../../Constants/ViewEditModeCON';

export interface ViewEditModeToggleSharedComponentProps {
  // Both optional, standard controlled/uncontrolled hybrid: pass neither for
  // the original self-contained behavior (e.g. Resources, which has nothing
  // to react to Edit Mode yet). Pass both when the parent screen needs to
  // know the current mode (e.g. Environment Overview, which renders its
  // Status column differently in Edit Mode) - the parent then owns the
  // state and this component becomes a pure display/toggle for it.
  value?: string;
  onChange?: (value: string) => void;
}

// A View/Edit mode toggle for a table page - self-contained by default (owns
// its own state, always starts on View Mode, resets on reload; not
// persisted, unlike Table Height/Density) since each mounted instance is
// independent per page by design, but can be lifted to a controlled
// component via the value/onChange props above. Ctrl/Cmd+E toggles it from
// anywhere while mounted, mirroring ExpandableSearchSharedComponent's
// Ctrl/Cmd+K convention exactly - including the same "don't hijack focus
// away from an active text field" guard, which also happens to be what
// keeps this safe from macOS's native Ctrl+E ("move to end of line")
// text-field binding: that OS shortcut only fires while a field has focus,
// and this guard is what skips our own handler in exactly that situation,
// so the two never actually compete.
//
// Edit Mode itself still has no admin-only gate - see
// ADMIN_GATED_ROW_DELETION_AND_EDIT_MODE_TODO.md for why, and what's
// expected to change once there's an authentication system to gate it with.
export default function ViewEditModeToggleSharedComponent({
  value,
  onChange,
}: ViewEditModeToggleSharedComponentProps): React.JSX.Element {
  const [internalMode, setInternalMode] = useState<string>(ViewEditModeCON.VIEW);
  const isControlled = value !== undefined && onChange !== undefined;
  const mode = isControlled ? value : internalMode;
  const setMode = isControlled ? onChange : setInternalMode;
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
      // Reads `mode` directly rather than a functional setState update - the
      // controlled case's setMode is just `onChange: (value) => void`, which
      // has no functional-update form to rely on, so this effect depends on
      // `mode` instead to always close over its latest value.
      setMode(mode === ViewEditModeCON.VIEW ? ViewEditModeCON.EDIT : ViewEditModeCON.VIEW);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, setMode]);

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
