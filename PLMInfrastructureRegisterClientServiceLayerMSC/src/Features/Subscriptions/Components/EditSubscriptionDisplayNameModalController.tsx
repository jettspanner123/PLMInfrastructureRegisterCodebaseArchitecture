import React, { useEffect, useState } from 'react';
import ModalSharedComponent from '../../../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../../../Shared/Components/ButtonSharedComponent';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import TanstackQueryClientService from '../../../Services/TanstackQueryClientService';
import type ConfiguredSubscriptionInterfaceModel from '../../../Models/ConfiguredSubscriptionInterfaceModel';

export interface EditSubscriptionDisplayNameModalControllerProps {
  subscription: ConfiguredSubscriptionInterfaceModel | null;
  onClose: () => void;
}

export default function EditSubscriptionDisplayNameModalController({
  subscription,
  onClose,
}: EditSubscriptionDisplayNameModalControllerProps): React.JSX.Element {
  const [displayName, setDisplayName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data caching ref so the modal's content doesn't vanish mid-exit-animation
  // once the parent clears `subscription` to close it (per CODING-RULES.md
  // §10.2's Modal Data Caching Ref convention).
  const lastSubscriptionRef = React.useRef<ConfiguredSubscriptionInterfaceModel | null>(subscription);
  if (subscription) lastSubscriptionRef.current = subscription;
  const displaySubscription = subscription || lastSubscriptionRef.current;

  useEffect(() => {
    if (subscription) {
      setDisplayName(subscription.displayName);
      setErrorMessage(null);
    }
  }, [subscription]);

  const updateDisplayNameMutation = TanstackQueryClientService.current.subscriptions.useUpdateSubscriptionDisplayNameMutation(
    {
      onSuccess: () => onClose(),
    }
  );

  const handleSave = async (): Promise<void> => {
    if (!displaySubscription || !displayName.trim()) return;

    setErrorMessage(null);
    try {
      await updateDisplayNameMutation.mutateAsync({ id: displaySubscription.id, displayName: displayName.trim() });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update the display name.');
    }
  };

  return (
    <ModalSharedComponent
      isOpen={subscription !== null}
      onClose={onClose}
      title="Rename Subscription"
      subtitle={displaySubscription?.azureSubscriptionId}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <ButtonSharedComponent variant="outline" onClick={onClose} disabled={updateDisplayNameMutation.isPending}>
            Cancel
          </ButtonSharedComponent>
          <ButtonSharedComponent
            variant="primary"
            onClick={handleSave}
            disabled={!displayName.trim()}
            isLoading={updateDisplayNameMutation.isPending}
          >
            Save
          </ButtonSharedComponent>
        </div>
      }
    >
      <div className="space-y-3">
        <InputSharedComponent
          label="Display Name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          This only renames the label on this page — it won't touch the Subscription column on already-synced
          Resources until the next Sync run refreshes them.
        </p>
        {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
      </div>
    </ModalSharedComponent>
  );
}
