import React from 'react';
import { ServerOff } from 'lucide-react';
import CardSharedComponent from '../../Shared/Components/CardSharedComponent';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';
import ResourceColumnCON from './Constants/ResourceColumnCON';

export default function ResourcesScreenController(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif-headline text-2xl font-bold text-slate-900 dark:text-white">
          Infrastructure Register
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Azure Resources tracked by this register.
        </p>
      </div>

      <CardSharedComponent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="divide-x divide-slate-200 dark:divide-zinc-800 border-b border-slate-200 dark:border-zinc-800">
                {ResourceColumnCON.COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-3 py-2.5 text-left font-mono font-bold uppercase tracking-wider text-[10px] text-slate-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-900/60"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {/* Rows render here once Sync populates Resources — each <tr> should carry
                  the same divide-x divide-slate-200 dark:divide-zinc-800 vertical dividers
                  as the header row, so the grid reads as one consistent spreadsheet. */}
            </tbody>
          </table>
        </div>
      </CardSharedComponent>

      <EmptyStateSharedComponent
        icon={<ServerOff className="w-6 h-6" />}
        title="No Resources yet"
        description="Sync hasn't run yet, so nothing has been discovered."
      />
    </div>
  );
}
