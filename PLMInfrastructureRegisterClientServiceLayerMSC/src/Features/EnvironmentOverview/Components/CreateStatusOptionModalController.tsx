import React, { useEffect, useState } from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';

export interface CreateStatusOptionModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  // Fired after the new Status option is successfully created - the parent
  // decides what to do with it (e.g. immediately select it onto whichever
  // row's dropdown opened this modal), matching SignForge's own
  // CreateDepartmentModalController.onCreated convention. This component
  // itself knows nothing about which row (if any) triggered it.
  onCreated: (status: string) => void;
}

export default function CreateStatusOptionModalController({
  isOpen,
  onClose,
  onCreated,
}: CreateStatusOptionModalControllerProps): React.JSX.Element {
  const [statusName, setStatusName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addStatusOptionMutation = TanstackQueryClientService.current.environmentOverview.useAddStatusOptionMutation({
    onSuccess: () => {
      onCreated(statusName.trim());
      setStatusName('');
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setStatusName('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleCreate = async (): Promise<void> => {
    const trimmed = statusName.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    try {
      await addStatusOptionMutation.mutateAsync({ status: trimmed });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create the Status option.');
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Create Status"
      subtitle="Adds a new option to the Status dropdown for every environment."
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={addStatusOptionMutation.isPending}>
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label="Create Status"
            onClick={handleCreate}
            disabled={!statusName.trim()}
            isLoading={addStatusOptionMutation.isPending}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="create-status-name" className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            Status Name
          </label>
          <input
            id="create-status-name"
            name="status-name"
            type="text"
            value={statusName}
            onChange={(event) => setStatusName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && statusName.trim()) {
                event.preventDefault();
                void handleCreate();
              }
            }}
            placeholder="e.g. Maintenance"
            autoFocus
            className="w-full h-10 px-3 text-xs rounded-lg bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086]"
          />
        </div>

        {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
      </div>
    </ModalSharedComponent>
  );
}
