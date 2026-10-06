import React, { useState } from 'react';
import { Cloud, Pencil, Plus, Trash2 } from 'lucide-react';
import DataTableContainerSharedComponent from '../../Shared/Components/DataTableContainerSharedComponent';
import TableHeaderCellSharedComponent from '../../Shared/Components/TableHeaderCellSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import ConfirmationModalSharedComponent from '../../Shared/Components/ConfirmationModalSharedComponent';
import CopyableTableCellSharedComponent from '../../Shared/Components/CopyableTableCellSharedComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import TableSelectionService from '../../Services/TableSelectionService';
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

  // Excel-like multi-cell/row/column selection, shared with Resources - see
  // TableSelectionService.ts for the full design. Only the 3 copyable
  // columns (Display Name, Azure Subscription ID, Resources) are part of the
  // addressable grid - Sl. No and Actions are chrome, not data, same as
  // Resources excludes its own row-number column.
  const tableSelection = TableSelectionService.current.useTableSelection({
    rowCount: subscriptions.length,
    columnCount: 3,
    getCellValue: (rowIndex, colIndex) => {
      const subscription = subscriptions[rowIndex];
      if (!subscription) return '';
      if (colIndex === 0) return subscription.displayName;
      if (colIndex === 1) return subscription.azureSubscriptionId;
      return String(subscription.resourceCount);
    },
  });

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
        <DataTableContainerSharedComponent ref={tableSelection.containerRef}>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="divide-x divide-white/10">
                <TableHeaderCellSharedComponent align="center" className="w-12">
                  Sl. No
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent {...tableSelection.getColumnHeaderHandlers(0)}>
                  Display Name
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent {...tableSelection.getColumnHeaderHandlers(1)}>
                  Azure Subscription ID
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent {...tableSelection.getColumnHeaderHandlers(2)}>
                  Resources
                </TableHeaderCellSharedComponent>
                <TableHeaderCellSharedComponent align="right">Actions</TableHeaderCellSharedComponent>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {subscriptions.map((subscription, rowIndex) => (
                <tr key={subscription.id} className="divide-x divide-slate-200 dark:divide-zinc-800">
                  <td
                    {...tableSelection.getRowHeaderHandlers(rowIndex)}
                    className="whitespace-nowrap px-3 py-2 font-mono text-slate-400 dark:text-zinc-500 text-center cursor-pointer select-none"
                  >
                    {rowIndex + 1}
                  </td>
                  <CopyableTableCellSharedComponent
                    value={subscription.displayName}
                    ariaLabel={`Copy Display Name: ${subscription.displayName}`}
                    className="whitespace-nowrap px-3 py-2 font-mono font-semibold text-slate-900 dark:text-zinc-100"
                    isSelected={tableSelection.isCellSelected(rowIndex, 0)}
                    selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, 0)}
                    onCellMouseDown={tableSelection.getCellHandlers(rowIndex, 0).onMouseDown}
                    onCellMouseEnter={tableSelection.getCellHandlers(rowIndex, 0).onMouseEnter}
                  >
                    {subscription.displayName}
                  </CopyableTableCellSharedComponent>
                  <CopyableTableCellSharedComponent
                    value={subscription.azureSubscriptionId}
                    ariaLabel={`Copy Azure Subscription ID: ${subscription.azureSubscriptionId}`}
                    className="whitespace-nowrap px-3 py-2 font-mono text-slate-500 dark:text-zinc-400"
                    isSelected={tableSelection.isCellSelected(rowIndex, 1)}
                    selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, 1)}
                    onCellMouseDown={tableSelection.getCellHandlers(rowIndex, 1).onMouseDown}
                    onCellMouseEnter={tableSelection.getCellHandlers(rowIndex, 1).onMouseEnter}
                  >
                    {subscription.azureSubscriptionId}
                  </CopyableTableCellSharedComponent>
                  <CopyableTableCellSharedComponent
                    value={String(subscription.resourceCount)}
                    ariaLabel={`Copy Resources count: ${subscription.resourceCount}`}
                    className="whitespace-nowrap px-3 py-2 font-mono text-slate-700 dark:text-zinc-300"
                    isSelected={tableSelection.isCellSelected(rowIndex, 2)}
                    selectionBoxShadow={tableSelection.getCellSelectionBoxShadow(rowIndex, 2)}
                    onCellMouseDown={tableSelection.getCellHandlers(rowIndex, 2).onMouseDown}
                    onCellMouseEnter={tableSelection.getCellHandlers(rowIndex, 2).onMouseEnter}
                  >
                    {subscription.resourceCount}
                  </CopyableTableCellSharedComponent>
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
        </DataTableContainerSharedComponent>
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
