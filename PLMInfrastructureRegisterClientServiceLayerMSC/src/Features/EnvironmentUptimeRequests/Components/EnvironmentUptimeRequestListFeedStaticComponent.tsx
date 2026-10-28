import React, { useMemo, useState } from 'react';
import { Search, CalendarX2 } from 'lucide-react';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import BadgeSharedComponent from '../../../Shared/Components/BadgeSharedComponent';
import EmptyStateSharedComponent from '../../../Shared/Components/EmptyStateSharedComponent';
import EnvironmentUptimeRequestCardStaticComponent from './EnvironmentUptimeRequestCardStaticComponent';
import EnvironmentUptimeRequestsCON from '../Constants/EnvironmentUptimeRequestsCON';
import type EnvironmentUptimeRequestInterfaceModel from '../../../Models/EnvironmentUptimeRequestInterfaceModel';

export interface EnvironmentUptimeRequestListFeedStaticComponentProps {
  requests: EnvironmentUptimeRequestInterfaceModel[];
  isLoading?: boolean;
  onDeleteRequest: (id: string) => void;
}

export default function EnvironmentUptimeRequestListFeedStaticComponent({
  requests,
  isLoading = false,
  onDeleteRequest,
}: EnvironmentUptimeRequestListFeedStaticComponentProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(EnvironmentUptimeRequestsCON.FILTER_ALL_STATUSES);

  const statusFilterOptions: SelectOption[] = useMemo(
    () => [
      { value: EnvironmentUptimeRequestsCON.FILTER_ALL_STATUSES, label: 'All Statuses' },
      ...EnvironmentUptimeRequestsCON.STATUS_OPTIONS,
    ],
    []
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesTicketId = req.ticketId.toLowerCase().includes(query);
        const matchesEnvironment = req.environment.toLowerCase().includes(query);
        const matchesMessage = (req.message ?? '').toLowerCase().includes(query);
        if (!matchesTicketId && !matchesEnvironment && !matchesMessage) {
          return false;
        }
      }

      if (selectedStatus !== EnvironmentUptimeRequestsCON.FILTER_ALL_STATUSES && req.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, selectedStatus]);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Top Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0d0d10] p-4 rounded-xl border border-slate-300/70 dark:border-zinc-800/80 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              {EnvironmentUptimeRequestsCON.LIST_HEADER_TITLE}
            </h2>
            <BadgeSharedComponent variant="neutral" size="sm">
              {filteredRequests.length} of {requests.length}
            </BadgeSharedComponent>
          </div>
        </div>

        {/* Search Input */}
        <InputSharedComponent
          placeholder={EnvironmentUptimeRequestsCON.SEARCH_PLACEHOLDER}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {/* Status Filter */}
        <CustomSelectSharedComponent
          value={selectedStatus}
          options={statusFilterOptions}
          onChange={(val) => setSelectedStatus(val)}
          size="sm"
        />
      </div>

      {/* Cards List or Empty State */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-sm text-slate-400">
            Loading uptime requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="my-auto py-8">
            <EmptyStateSharedComponent
              title={requests.length === 0 ? 'No Uptime Requests Yet' : 'No Matching Requests'}
              description={
                requests.length === 0
                  ? 'Submit your first planned uptime or downtime window using the form on the left.'
                  : 'Try adjusting your search query or filter to find what you are looking for.'
              }
              icon={<CalendarX2 className="w-8 h-8 text-slate-400" />}
            />
          </div>
        ) : (
          filteredRequests.map((req) => (
            <EnvironmentUptimeRequestCardStaticComponent
              key={req.id}
              request={req}
              onDelete={() => onDeleteRequest(req.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
