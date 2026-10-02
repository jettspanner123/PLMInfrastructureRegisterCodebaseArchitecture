import React, { useState } from 'react';
import { Cloud, Pencil, Plus, Trash2 } from 'lucide-react';
import CardSharedComponent from '../../Shared/Components/CardSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import AddSubscriptionModalController from './Components/AddSubscriptionModalController';
import EditSubscriptionDisplayNameModalController from './Components/EditSubscriptionDisplayNameModalController';
import type ConfiguredSubscriptionInterfaceModel from '../../Models/ConfiguredSubscriptionInterfaceModel';

export default function SubscriptionsScreenController(): React.JSX.Element {
  const { data: subscriptions = [], isLoading } =
    TanstackQueryClientService.current.subscriptions.useConfiguredSubscriptionsQuery();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingSubscription, setEditingSubscription] = useState<ConfiguredSubscriptionInterfaceModel | null>(null);
  const [deletingSubscription, setDeletingSubscription] = useState<ConfiguredSubscriptionInterfaceModel | null>(null);

  const deleteSubscriptionMutation = TanstackQueryClientService.current.subscriptions.useDeleteSubscriptionMutation({
    onSuccess: () => setDeletingSubscription(null),
  });

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingSubscription) return;
    await deleteSubscriptionMutation.mutateAsync(deletingSubscription.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">
            Configure Subscriptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            The Azure subscriptions Sync is allowed to scan.
          </p>
        </div>

        <ButtonSharedComponent variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Add Subscription
        </ButtonSharedComponent>
      </div>

      {subscriptions.length > 0 && (
        <CardSharedComponent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="divide-x divide-slate-200 dark:divide-zinc-800 border-b border-slate-200 dark:border-zinc-800">
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono font-bold uppercase tracking-wider text-[10px] text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-900/60">
                    Display Name
                  </th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono font-bold uppercase tracking-wider text-[10px] text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-900/60">
                    Azure Subscription ID
                  </th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-left font-mono font-bold uppercase tracking-wider text-[10px] text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-900/60">
                    Resources
                  </th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right font-mono font-bold uppercase tracking-wider text-[10px] text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-900/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="divide-x divide-slate-200 dark:divide-zinc-800">
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900 dark:text-zinc-100">
                      {subscription.displayName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-500 dark:text-zinc-400">
                      {subscription.azureSubscriptionId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-zinc-300">
                      {subscription.resourceCount}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingSubscription(subscription)}
                          aria-label={`Rename ${subscription.displayName}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSubscription(subscription)}
                          aria-label={`Remove ${subscription.displayName}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardSharedComponent>
      )}

      {!isLoading && subscriptions.length === 0 && (
        <EmptyStateSharedComponent
          icon={<Cloud className="w-6 h-6" />}
          title="No subscriptions configured"
          description="Sync won't scan anything until at least one Azure subscription is added here."
          actionButton={
            <ButtonSharedComponent variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
              Add Subscription
            </ButtonSharedComponent>
          }
        />
      )}

      <AddSubscriptionModalController isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <EditSubscriptionDisplayNameModalController
        subscription={editingSubscription}
        onClose={() => setEditingSubscription(null)}
      />

      <ConfirmationModalSharedComponent
        isOpen={deletingSubscription !== null}
        onClose={() => setDeletingSubscription(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Subscription"
        subtitle={deletingSubscription?.displayName}
        description={
          deletingSubscription && deletingSubscription.resourceCount > 0 ? (
            <>
              This subscription has <strong>{deletingSubscription.resourceCount}</strong> active Resource
              {deletingSubscription.resourceCount === 1 ? '' : 's'}. Removing it will mark all of them as{' '}
              <strong>Decommissioned</strong> — they won't be deleted, but Sync will stop scanning this subscription
              going forward.
            </>
          ) : (
            'This subscription has no active Resources. Removing it will stop Sync from scanning it going forward.'
          )
        }
        confirmText="Remove Subscription"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteSubscriptionMutation.isPending}
        maxWidth="md"
      />
    </div>
  );
}
