import React, { useMemo, useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import InputSharedComponent from '../../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { type SelectOption } from '../../../Shared/Components/CustomSelectSharedComponent';
import BadgeSharedComponent from '../../../Shared/Components/BadgeSharedComponent';
import EmptyStateSharedComponent from '../../../Shared/Components/EmptyStateSharedComponent';
import FeatureRequestCardStaticComponent from './FeatureRequestCardStaticComponent';
import FeatureRequestsCON from '../Constants/FeatureRequestsCON';
import type FeatureRequestInterfaceModel from '../../../Models/FeatureRequestInterfaceModel';
import type { FeatureRequestStatusEnumModel } from '../../../Models/FeatureRequestStatusEnumModel';

export interface FeatureRequestListFeedStaticComponentProps {
  requests: FeatureRequestInterfaceModel[];
  isLoading?: boolean;
  onStatusChange: (id: string, status: FeatureRequestStatusEnumModel) => void;
  onDeleteRequest: (id: string) => void;
}

export default function FeatureRequestListFeedStaticComponent({
  requests,
  isLoading = false,
  onStatusChange,
  onDeleteRequest,
}: FeatureRequestListFeedStaticComponentProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(FeatureRequestsCON.FILTER_ALL_CATEGORIES);
  const [selectedStatus, setSelectedStatus] = useState<string>(FeatureRequestsCON.FILTER_ALL_STATUSES);

  // Filter options with "All" prepended
  const categoryFilterOptions: SelectOption[] = useMemo(() => [
    { value: FeatureRequestsCON.FILTER_ALL_CATEGORIES, label: 'All Modules' },
    ...FeatureRequestsCON.CATEGORY_OPTIONS,
  ], []);

  const statusFilterOptions: SelectOption[] = useMemo(() => [
    { value: FeatureRequestsCON.FILTER_ALL_STATUSES, label: 'All Statuses' },
    ...FeatureRequestsCON.STATUS_OPTIONS,
  ], []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Search text match
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesTitle = req.title.toLowerCase().includes(query);
        const matchesDesc = req.description.toLowerCase().includes(query);
        const matchesAuthor = req.requesterName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesAuthor) {
          return false;
        }
      }

      // Category filter match
      if (selectedCategory !== FeatureRequestsCON.FILTER_ALL_CATEGORIES && req.category !== selectedCategory) {
        return false;
      }

      // Status filter match
      if (selectedStatus !== FeatureRequestsCON.FILTER_ALL_STATUSES && req.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Top Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0d0d10] p-4 rounded-xl border border-slate-300/70 dark:border-zinc-800/80 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              {FeatureRequestsCON.LIST_HEADER_TITLE}
            </h2>
            <BadgeSharedComponent variant="neutral" size="sm">
              {filteredRequests.length} of {requests.length}
            </BadgeSharedComponent>
          </div>
        </div>

        {/* Search Input */}
        <InputSharedComponent
          placeholder={FeatureRequestsCON.SEARCH_PLACEHOLDER}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <CustomSelectSharedComponent
            value={selectedCategory}
            options={categoryFilterOptions}
            onChange={(val) => setSelectedCategory(val)}
            size="sm"
          />
          <CustomSelectSharedComponent
            value={selectedStatus}
            options={statusFilterOptions}
            onChange={(val) => setSelectedStatus(val)}
            size="sm"
          />
        </div>
      </div>

      {/* Cards List or Empty State */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-sm text-slate-400">
            Loading feature requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="my-auto py-8">
            <EmptyStateSharedComponent
              title={requests.length === 0 ? 'No Feature Requests Yet' : 'No Matching Requests'}
              description={
                requests.length === 0
                  ? 'Be the first to submit a suggestion or new requirement using the form on the left.'
                  : 'Try adjusting your search query or filter options to find what you are looking for.'
              }
              icon={<Inbox className="w-8 h-8 text-slate-400" />}
            />
          </div>
        ) : (
          filteredRequests.map((req) => (
            <FeatureRequestCardStaticComponent
              key={req.id}
              request={req}
              onStatusChange={(newStatus) => onStatusChange(req.id, newStatus)}
              onDelete={() => onDeleteRequest(req.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
