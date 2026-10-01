import React from 'react';
import { ServerOff } from 'lucide-react';
import EmptyStateSharedComponent from '../../Shared/Components/EmptyStateSharedComponent';

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

      <EmptyStateSharedComponent
        icon={<ServerOff className="w-6 h-6" />}
        title="No Resources yet"
        description="Sync hasn't run yet, so nothing has been discovered."
      />
    </div>
  );
}
