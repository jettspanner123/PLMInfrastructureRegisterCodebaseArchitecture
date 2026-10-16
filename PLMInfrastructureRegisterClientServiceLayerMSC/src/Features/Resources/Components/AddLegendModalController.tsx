import React, { useEffect, useState } from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import AnonymousClientIdentityUtility from '../../../Utilities/AnonymousClientIdentityUtility';
import CellFormatHelper from '../../../Utilities/CellFormatHelper';
import CellFormatCON from '../../../Constants/CellFormatCON';
import type LegendEntryInterfaceModel from '../../../Models/LegendEntryInterfaceModel';

export interface AddLegendModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  // Fired after a NEW legend is successfully persisted (never for an edit) -
  // same onCreated convention as AddCustomColorModalController.
  onCreated: (legend: LegendEntryInterfaceModel) => void;
  // When present, the modal edits this existing legend (rename/recolor)
  // instead of creating a new one. Never passed for a system legend - those
  // never render an edit affordance to begin with.
  editingLegend?: LegendEntryInterfaceModel;
}

// A legend's own color is always a literal "#RRGGBB" at rest (HEX or RGB on
// the wire, normalized the same way the backend's own
// ResourceCellFormatColorUtility.NormalizeToHex does), purely so it can be
// compared against the swatch grid's own hex values - same reasoning as
// CellFormatHelper.getApplicableColorKey, reimplemented locally here since
// that helper's parameter type is CustomColorOptionInterfaceModel
// specifically (colorName required), not the shape a legend entry has.
function resolveToHex(format: 'HEX' | 'RGB', color: string): string {
  if (format === 'RGB') {
    const [r, g, b] = color.split(',').map(Number);
    return CellFormatHelper.current.rgbComponentsToHex(r, g, b);
  }
  return color.toUpperCase();
}

interface PaletteSwatch {
  key: string;
  label: string;
  hex: string;
  swatchClassName?: string;
}

export default function AddLegendModalController({
  isOpen,
  onClose,
  onCreated,
  editingLegend,
}: AddLegendModalControllerProps): React.JSX.Element {
  const isEditMode = editingLegend !== undefined;

  const [nameInput, setNameInput] = useState<string>('');
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const legendsQuery = TanstackQueryClientService.current.resources.useLegendsQuery();
  const customColorsQuery = TanstackQueryClientService.current.resources.useCustomColorsQuery();

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);

    if (editingLegend) {
      setNameInput(editingLegend.name);
      setSelectedHex(resolveToHex(editingLegend.format, editingLegend.color));
      return;
    }

    setNameInput('');
    setSelectedHex(null);
    // editingLegend is intentionally omitted - re-running this effect every
    // time the SAME legend object gets a new reference (e.g. a background
    // refetch) would stomp on in-progress typing. Same convention as
    // AddCustomColorModalController.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const addLegendMutation = TanstackQueryClientService.current.resources.useAddLegendMutation({
    onSuccess: (legends) => {
      onCreated(legends[legends.length - 1]);
      onClose();
    },
  });

  const updateLegendMutation = TanstackQueryClientService.current.resources.useUpdateLegendMutation({
    onSuccess: () => onClose(),
  });

  // hex (uppercase) -> name of the legend already using it, excluding this
  // entry's own current color while editing.
  const colorNameInUse = new Map<string, string>();
  for (const legend of legendsQuery.data ?? []) {
    if (editingLegend && legend.id === editingLegend.id) continue;
    colorNameInUse.set(resolveToHex(legend.format, legend.color), legend.name);
  }

  const palette: PaletteSwatch[] = [
    ...CellFormatCON.COLORS.map((color) => ({
      key: `fixed-${color.key}`,
      label: color.label,
      hex: color.hexColor.toUpperCase(),
      swatchClassName: color.swatchClassName,
    })),
    ...(customColorsQuery.data ?? []).map((option) => ({
      key: `custom-${option.id}`,
      label: option.colorName,
      hex: resolveToHex(option.format, option.color),
    })),
  ];

  const trimmedName = nameInput.trim();
  const isNameTaken = (legendsQuery.data ?? []).some(
    (legend) =>
      (!editingLegend || legend.id !== editingLegend.id) && legend.name.toLowerCase() === trimmedName.toLowerCase()
  );
  const isNameValid = trimmedName.length > 0 && !isNameTaken;
  const isColorAvailable = !!selectedHex && !colorNameInUse.has(selectedHex);
  const canSubmit = isNameValid && isColorAvailable;
  const isSubmitting = addLegendMutation.isPending || updateLegendMutation.isPending;

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit || !selectedHex) return;

    setErrorMessage(null);
    try {
      if (editingLegend) {
        await updateLegendMutation.mutateAsync({
          id: editingLegend.id,
          request: { name: trimmedName, format: 'HEX', color: selectedHex },
        });
      } else {
        await addLegendMutation.mutateAsync({
          name: trimmedName,
          format: 'HEX',
          color: selectedHex,
          createdByClientId: AnonymousClientIdentityUtility.current.getOrCreateClientId(),
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : `Failed to ${editingLegend ? 'save' : 'add'} the legend.`);
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Legend' : 'Add Legend'}
      subtitle={
        isEditMode
          ? 'Renames and/or recolors this legend entry.'
          : 'Adds a new entry to the Infrastructure Register legend row. This is a reference label only - it does not change any table column colors.'
      }
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label={isEditMode ? 'Save Changes' : 'Add Legend'}
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
          name="legend-name"
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder="e.g. Pending migration"
          required
        />
        {isNameTaken && trimmedName.length > 0 && (
          <p className="text-xs text-rose-500">A legend named &quot;{trimmedName}&quot; already exists.</p>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">Color</label>
          <div className="grid grid-cols-6 gap-2 justify-items-center">
            {palette.map((swatch) => {
              const usedByName = colorNameInUse.get(swatch.hex);
              const isDisabled = !!usedByName;
              const isSelected = selectedHex === swatch.hex;

              return (
                <button
                  key={swatch.key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedHex(swatch.hex)}
                  title={isDisabled ? `Already used by '${usedByName}'` : swatch.label}
                  style={swatch.swatchClassName ? undefined : { backgroundColor: swatch.hex }}
                  className={`w-6 h-6 rounded-full transition-transform ${swatch.swatchClassName ?? ''} ${
                    isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : isSelected
                        ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 scale-110 z-10'
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
      </div>
    </ModalSharedComponent>
  );
}
