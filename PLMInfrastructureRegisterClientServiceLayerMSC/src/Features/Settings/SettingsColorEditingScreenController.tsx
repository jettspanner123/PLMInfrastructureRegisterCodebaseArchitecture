import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import ResourceCellFormatHelper from '../Resources/Helpers/ResourceCellFormatHelper';
import AddCustomColorModalController from '../Resources/Components/AddCustomColorModalController';
import type CustomColorOptionInterfaceModel from '../../Models/CustomColorOptionInterfaceModel';

// Full CRUD on the named custom-color palette Infrastructure Register's
// right-click cell formatting menu offers - the 4 fixed named colors
// (Yellow/Green/Blue/Red) aren't managed here; they stay exactly as they are
// today (see ResourceCellFormatCON).
export default function SettingsColorEditingScreenController(): React.JSX.Element {
  const { data: colors = [], isLoading } = TanstackQueryClientService.current.resources.useCustomColorsQuery();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingColor, setEditingColor] = useState<CustomColorOptionInterfaceModel | null>(null);
  const [deletingColor, setDeletingColor] = useState<CustomColorOptionInterfaceModel | null>(null);

  const deleteColorMutation = TanstackQueryClientService.current.resources.useDeleteCustomColorMutation({
    onSuccess: () => setDeletingColor(null),
  });

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingColor) return;
    await deleteColorMutation.mutateAsync(deletingColor.id);
  };

  const isColorModalOpen = isAddModalOpen || editingColor !== null;
  const handleCloseColorModal = (): void => {
    setIsAddModalOpen(false);
    setEditingColor(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="font-serif-headline text-xl font-bold text-slate-900 dark:text-white">
            Cell Format Colors
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            The named custom colors available in Infrastructure Register&apos;s right-click cell formatting menu.
          </p>
        </div>
        <ButtonSharedComponent
          variant="primary"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Color
        </ButtonSharedComponent>
      </div>

      {!isLoading && colors.length === 0 ? (
        <EmptyStateSharedComponent
          icon={<Plus className="w-6 h-6" />}
          title="No custom colors yet"
          description="Add one to make it available in Infrastructure Register's formatting menu."
        />
      ) : (
        <div className="hairline-border rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-zinc-800">
          {colors.map((color) => (
            <div key={color.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0c0c0e]">
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10 shrink-0"
                style={ResourceCellFormatHelper.current.getSwatchStyleForCustomColor(color)}
              />
              <span className="flex-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">
                {color.colorName}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase shrink-0">
                {color.format}
              </span>
              <button
                type="button"
                onClick={() => setEditingColor(color)}
                aria-label={`Edit ${color.colorName}`}
                className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingColor(color)}
                aria-label={`Delete ${color.colorName}`}
                className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddCustomColorModalController
        isOpen={isColorModalOpen}
        onClose={handleCloseColorModal}
        onCreated={() => {}}
        editingColor={editingColor ?? undefined}
      />

      <ConfirmationModalSharedComponent
        isOpen={deletingColor !== null}
        onClose={() => setDeletingColor(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Color"
        subtitle={deletingColor?.colorName}
        description="This removes it from the formatting menu's color list. Cells already using this color keep their exact formatting - only its name disappears from the list."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        maxWidth="md"
        isLoading={deleteColorMutation.isPending}
      />
    </div>
  );
}
