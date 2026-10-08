import React, { useEffect, useState } from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../Shared/Components/PrimaryActionButtonSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';

export interface CreateOptionModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  // Which field's growable dropdown this is adding to ("Status", "Sponsor",
  // ...) - drives both the API call (useAddOptionMutation(fieldName)) and
  // every piece of copy below.
  fieldName: string;
  title: string;
  subtitle: string;
  inputLabel: string;
  inputPlaceholder: string;
  // Fired after the new option is successfully created - the parent decides
  // what to do with it (e.g. immediately select it onto whichever row's
  // dropdown opened this modal), matching SignForge's own
  // CreateDepartmentModalController.onCreated convention. This component
  // itself knows nothing about which row (if any) triggered it.
  onCreated: (value: string) => void;
}

export default function CreateOptionModalController({
  isOpen,
  onClose,
  fieldName,
  title,
  subtitle,
  inputLabel,
  inputPlaceholder,
  onCreated,
}: CreateOptionModalControllerProps): React.JSX.Element {
  const [optionValue, setOptionValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addOptionMutation = TanstackQueryClientService.current.environmentOverview.useAddOptionMutation(fieldName, {
    onSuccess: () => {
      onCreated(optionValue.trim());
      setOptionValue('');
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setOptionValue('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleCreate = async (): Promise<void> => {
    const trimmed = optionValue.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    try {
      await addOptionMutation.mutateAsync({ value: trimmed });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create the option.');
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={addOptionMutation.isPending}>
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label={title}
            onClick={handleCreate}
            disabled={!optionValue.trim()}
            isLoading={addOptionMutation.isPending}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="create-option-value" className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            {inputLabel}
          </label>
          <input
            id="create-option-value"
            name="option-value"
            type="text"
            value={optionValue}
            onChange={(event) => setOptionValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && optionValue.trim()) {
                event.preventDefault();
                void handleCreate();
              }
            }}
            placeholder={inputPlaceholder}
            autoFocus
            className="w-full h-10 px-3 text-xs rounded-lg bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086]"
          />
        </div>

        {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
      </div>
    </ModalSharedComponent>
  );
}
