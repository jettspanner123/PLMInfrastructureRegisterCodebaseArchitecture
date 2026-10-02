import React, { useEffect, useState } from 'react';
import { Cloud } from 'lucide-react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import CustomSelectSharedComponent from '../../../Shared/Components/CustomSelectSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';

export interface AddSubscriptionModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSubscriptionModalController({
  isOpen,
  onClose,
}: AddSubscriptionModalControllerProps): React.JSX.Element {
  const [selectedAzureSubscriptionId, setSelectedAzureSubscriptionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: availableSubscriptions = [], isLoading: isLoadingAvailable } =
    TanstackQueryClientService.current.subscriptions.useAvailableAzureSubscriptionsQuery(isOpen);

  const addSubscriptionMutation = TanstackQueryClientService.current.subscriptions.useAddSubscriptionMutation({
    onSuccess: () => {
      setSelectedAzureSubscriptionId('');
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedAzureSubscriptionId('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleAdd = async (): Promise<void> => {
    if (!selectedAzureSubscriptionId) return;

    setErrorMessage(null);
    try {
      await addSubscriptionMutation.mutateAsync(selectedAzureSubscriptionId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add the subscription.');
    }
  };

  const pickerOptions = availableSubscriptions.map((subscription) => ({
    value: subscription.azureSubscriptionId,
    label: subscription.displayName,
    sublabel: subscription.azureSubscriptionId,
  }));

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Add Subscription"
      subtitle="Only subscriptions your Azure credentials can already see are selectable."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={addSubscriptionMutation.isPending}>
            Cancel
          </ButtonSharedComponent>
          <ButtonSharedComponent
            variant="primary"
            onClick={handleAdd}
            disabled={!selectedAzureSubscriptionId}
            isLoading={addSubscriptionMutation.isPending}
          >
            Add Subscription
          </ButtonSharedComponent>
        </div>
      }
    >
      <div className="space-y-4">
        <CustomSelectSharedComponent
          label="Azure Subscription"
          value={selectedAzureSubscriptionId}
          onChange={setSelectedAzureSubscriptionId}
          options={pickerOptions}
          placeholder={isLoadingAvailable ? 'Loading subscriptions…' : 'Select a subscription…'}
          searchable
        />

        {!isLoadingAvailable && pickerOptions.length === 0 && (
          <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/60 rounded-lg p-3">
            <Cloud className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              No unconfigured subscriptions were found — either every subscription visible to this app's Azure
              credentials has already been added, or the credentials can't see any subscriptions.
            </span>
          </div>
        )}

        {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
      </div>
    </ModalSharedComponent>
  );
}
