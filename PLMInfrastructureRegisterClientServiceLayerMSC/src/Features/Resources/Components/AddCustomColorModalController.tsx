import React, { useEffect, useState } from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import SegmentedControlSharedComponent from '../../../Shared/Components/SegmentedControlSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import AnonymousClientIdentityUtility from '../../../Utilities/AnonymousClientIdentityUtility';
import ResourceCellFormatHelper from '../Helpers/ResourceCellFormatHelper';
import type CustomColorOptionInterfaceModel from '../../../Models/CustomColorOptionInterfaceModel';

export interface AddCustomColorModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  // Fired after a NEW color is successfully persisted (never for an edit) -
  // the parent decides what to do with it (e.g. immediately apply it to
  // whichever cells were selected when "Add Color" was opened), matching
  // CreateOptionModalController's own onCreated convention.
  onCreated: (option: CustomColorOptionInterfaceModel) => void;
  // When present, the modal edits this existing color (rename/recolor)
  // instead of creating a new one - same form, different mutation and
  // copy. Settings' "Editing" tab is the one caller that passes this.
  editingColor?: CustomColorOptionInterfaceModel;
}

type ColorInputMode = 'HEX' | 'RGB';

const HEX_INPUT_PATTERN = /^#?[0-9a-fA-F]{6}$/;

function clampByteInput(value: string): string {
  // Keeps whatever the user typed if it isn't a clean number yet (so they
  // can still be mid-edit, e.g. backspacing to retype), only clamping once
  // it actually parses.
  const parsed = Number(value);
  if (value.trim() === '' || Number.isNaN(parsed)) return value;
  return String(Math.min(255, Math.max(0, Math.round(parsed))));
}

function isValidRgbComponent(value: string): boolean {
  const parsed = Number(value);
  return value.trim() !== '' && !Number.isNaN(parsed) && parsed >= 0 && parsed <= 255;
}

export default function AddCustomColorModalController({
  isOpen,
  onClose,
  onCreated,
  editingColor,
}: AddCustomColorModalControllerProps): React.JSX.Element {
  const isEditMode = editingColor !== undefined;

  const [inputMode, setInputMode] = useState<ColorInputMode>('HEX');
  const [colorNameInput, setColorNameInput] = useState<string>('');
  const [hexInput, setHexInput] = useState<string>('');
  const [redInput, setRedInput] = useState<string>('');
  const [greenInput, setGreenInput] = useState<string>('');
  const [blueInput, setBlueInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);

    if (editingColor) {
      setColorNameInput(editingColor.colorName);
      setInputMode(editingColor.format);
      if (editingColor.format === 'HEX') {
        setHexInput(editingColor.color);
        setRedInput('');
        setGreenInput('');
        setBlueInput('');
      } else {
        const [r, g, b] = editingColor.color.split(',');
        setRedInput(r ?? '');
        setGreenInput(g ?? '');
        setBlueInput(b ?? '');
        setHexInput('');
      }
      return;
    }

    setInputMode('HEX');
    setColorNameInput('');
    setHexInput('');
    setRedInput('');
    setGreenInput('');
    setBlueInput('');
    // editingColor is intentionally omitted - re-running this effect every
    // time the SAME color object gets a new reference (e.g. a background
    // refetch after some unrelated edit) would stomp on in-progress typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const addColorMutation = TanstackQueryClientService.current.resources.useAddCustomColorMutation({
    onSuccess: (options) => {
      onCreated(options[options.length - 1]);
      onClose();
    },
  });

  const updateColorMutation = TanstackQueryClientService.current.resources.useUpdateCustomColorMutation({
    onSuccess: () => onClose(),
  });

  const isRgbInputValid =
    isValidRgbComponent(redInput) && isValidRgbComponent(greenInput) && isValidRgbComponent(blueInput);

  // Normalized "#RRGGBB" (uppercase) once the current mode's input is fully
  // valid, null otherwise - drives the live preview circle regardless of
  // mode (an RGB entry is converted purely for display here; the raw triple
  // is what actually gets submitted, see handleAddColor) and whether
  // "Add Color" is enabled.
  const resolvedHex: string | null =
    inputMode === 'HEX'
      ? HEX_INPUT_PATTERN.test(hexInput.trim())
        ? `#${hexInput.trim().replace('#', '').toUpperCase()}`
        : null
      : isRgbInputValid
        ? ResourceCellFormatHelper.current.rgbComponentsToHex(Number(redInput), Number(greenInput), Number(blueInput))
        : null;

  const isNameValid = colorNameInput.trim().length > 0;
  const canSubmit = !!resolvedHex && isNameValid;
  const isSubmitting = addColorMutation.isPending || updateColorMutation.isPending;

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit || !resolvedHex) return;

    const colorValue = inputMode === 'HEX' ? resolvedHex : `${Number(redInput)},${Number(greenInput)},${Number(blueInput)}`;

    setErrorMessage(null);
    try {
      if (editingColor) {
        await updateColorMutation.mutateAsync({
          id: editingColor.id,
          request: { colorName: colorNameInput.trim(), format: inputMode, color: colorValue },
        });
      } else {
        await addColorMutation.mutateAsync({
          colorName: colorNameInput.trim(),
          format: inputMode,
          color: colorValue,
          createdByClientId: AnonymousClientIdentityUtility.current.getOrCreateClientId(),
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : `Failed to ${editingColor ? 'save' : 'add'} the color.`);
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Color' : 'Add Color'}
      subtitle={
        isEditMode
          ? 'Renames and/or recolors this entry everywhere it appears in the formatting menu.'
          : 'Adds a new background color to the cell-formatting context menu for every table.'
      }
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label={isEditMode ? 'Save Changes' : 'Add Color'}
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <InputSharedComponent
          label="Name"
          name="custom-color-name"
          value={colorNameInput}
          onChange={(event) => setColorNameInput(event.target.value)}
          placeholder="e.g. Sunset Orange"
          required
        />

        <SegmentedControlSharedComponent
          value={inputMode}
          onChange={setInputMode}
          layoutId="add-custom-color-input-mode"
          alwaysFullWidth
          options={[
            { value: 'HEX', label: 'HEX' },
            { value: 'RGB', label: 'RGB' },
          ]}
        />

        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="shrink-0 w-9 h-9 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10"
            style={resolvedHex ? ResourceCellFormatHelper.current.getSwatchStyle(resolvedHex) : undefined}
          />

          {inputMode === 'HEX' ? (
            <input
              id="add-custom-color-hex"
              name="custom-color-hex"
              type="text"
              value={hexInput}
              onChange={(event) => setHexInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && resolvedHex) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="#RRGGBB"
              autoFocus
              className="flex-1 h-10 px-3 text-xs font-mono rounded-lg bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086]"
            />
          ) : (
            <div className="flex-1 grid grid-cols-3 gap-2">
              {(
                [
                  { label: 'R', value: redInput, setValue: setRedInput },
                  { label: 'G', value: greenInput, setValue: setGreenInput },
                  { label: 'B', value: blueInput, setValue: setBlueInput },
                ] as const
              ).map((channel) => (
                <div key={channel.label} className="space-y-1">
                  <label
                    htmlFor={`add-custom-color-${channel.label.toLowerCase()}`}
                    className="block text-[10px] font-semibold text-slate-400 dark:text-zinc-500 text-center"
                  >
                    {channel.label}
                  </label>
                  <input
                    id={`add-custom-color-${channel.label.toLowerCase()}`}
                    name={`custom-color-${channel.label.toLowerCase()}`}
                    type="number"
                    min={0}
                    max={255}
                    value={channel.value}
                    onChange={(event) => channel.setValue(clampByteInput(event.target.value))}
                    className="w-full h-10 px-2 text-xs text-center font-mono rounded-lg bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#0C2086]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
      </div>
    </ModalSharedComponent>
  );
}
